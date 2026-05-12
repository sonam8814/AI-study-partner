# app/main.py
from __future__ import annotations

import time
import uuid
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
import sys

from app.config import settings


# ── Logging setup ─────────────────────────────────────────────────────────────
logger.remove()
logger.add(
    sys.stderr,
    level=settings.LOG_LEVEL,
    format=(
        "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | "
        "{name}:{function}:{line} | {message}"
    ),
    colorize=True,
)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Study Partner API...")
    logger.info(f"LLM provider : {settings.LLM_PROVIDER}")
    logger.info(f"Embedding model: {settings.EMBEDDING_MODEL}")
    logger.info(f"CORS origins : {settings.cors_origins_list}")

    if not settings.RELOAD_MODE:
        # Production: pre-warm the embedding model so first request is instant.
        # Skipped in dev (RELOAD_MODE=True) to avoid the multiprocessing/fork
        # mutex issue with --reload.
        logger.info("Pre-warming embedding model (production mode)...")
        from app.core.embeddings import get_embedder
        get_embedder()
        logger.info("Embedding model ready.")
    else:
        logger.info(
            "RELOAD_MODE=True — embedding model will load lazily on first use."
        )

    yield

    logger.info("Shutting down AI Study Partner API.")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Study Partner",
    version="1.0.0",
    description="The Library — backend API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request ID Middleware ────────────────────────────────────────────────────
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


app.add_middleware(RequestIDMiddleware)


# ── Rate Limiting ────────────────────────────────────────────────────────────
_rate_buckets: dict[str, list[float]] = defaultdict(list)

LLM_PATHS = {"/api/v1/chat", "/api/v1/feynman/prompt", "/api/v1/feynman/critique"}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("authorization", "")
        if not auth.startswith("Bearer "):
            return await call_next(request)

        token_hash = str(hash(auth))
        now = time.time()
        window = 60.0

        is_llm = request.url.path in LLM_PATHS
        limit = settings.RATE_LIMIT_PER_MINUTE if is_llm else 60

        bucket = _rate_buckets[token_hash]
        _rate_buckets[token_hash] = [t for t in bucket if now - t < window]
        bucket = _rate_buckets[token_hash]

        if len(bucket) >= limit:
            return JSONResponse(
                status_code=429,
                content={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Rate limit exceeded. Max {limit} requests per minute.",
                        "details": {},
                    }
                },
                headers={"Retry-After": "60"},
            )

        bucket.append(now)
        return await call_next(request)


app.add_middleware(RateLimitMiddleware)


# ── Routers ───────────────────────────────────────────────────────────────────
from app.api.routes.health import router as health_router
from app.api.routes.materials import router as materials_router
from app.api.routes.chat import router as chat_router
from app.api.routes.feynman import router as feynman_router
from app.api.routes.garden import router as garden_router
from app.api.routes.weakspots import router as weakspots_router

app.include_router(health_router, prefix="/api/v1")
app.include_router(materials_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(feynman_router, prefix="/api/v1")
app.include_router(garden_router, prefix="/api/v1")
app.include_router(weakspots_router, prefix="/api/v1")


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception(f"[{request_id}] Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
                "details": {},
            },
            "request_id": request_id,
        },
    )

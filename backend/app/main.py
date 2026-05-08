# app/main.py
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
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
    allow_origins=settings.cors_origins_list,   # ← uses the property correctly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
from app.api.routes.health import router as health_router
from app.api.routes.materials import router as materials_router
app.include_router(health_router, prefix="/api/v1")
app.include_router(materials_router, prefix="/api/v1")

# Uncomment these as you build each module:
# from app.api.routes.chat       import router as chat_router
# from app.api.routes.feynman    import router as feynman_router
# from app.api.routes.garden     import router as garden_router
# from app.api.routes.weakspots  import router as weakspots_router
# app.include_router(chat_router,      prefix="/api/v1")
# app.include_router(feynman_router,   prefix="/api/v1")
# app.include_router(garden_router,    prefix="/api/v1")
# app.include_router(weakspots_router, prefix="/api/v1")


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc: Exception):
    logger.exception(f"Unhandled error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
                "details": {},
            }
        },
    )
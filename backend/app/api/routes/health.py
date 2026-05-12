# app/api/routes/health.py
from __future__ import annotations

from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    # Show actual provider being used (groq may fall back to ollama if key is missing)
    actual_provider = settings.LLM_PROVIDER
    actual_model = settings.GROQ_MODEL if settings.LLM_PROVIDER == "groq" else settings.OLLAMA_MODEL
    if settings.LLM_PROVIDER == "groq" and not settings.GROQ_API_KEY:
        actual_provider = "ollama (fallback: GROQ_API_KEY not set)"
        actual_model = settings.OLLAMA_MODEL

    return {
        "status": "ok",
        "version": "1.0.0",
        "llm_provider": actual_provider,
        "llm_model": actual_model,
        "embedding_model": settings.EMBEDDING_MODEL,
    }
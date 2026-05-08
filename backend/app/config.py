# app/config.py
from __future__ import annotations

import os
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Supabase ──────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # ── LLM ───────────────────────────────────────────────────
    LLM_PROVIDER: str = "groq"          # "groq" | "ollama"
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:8b"

    # ── Embeddings ────────────────────────────────────────────
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # ── Server ────────────────────────────────────────────────
    # Comma-separated origins string — parsed into a list via property below
    CORS_ORIGINS: str = "http://localhost:3000"
    LOG_LEVEL: str = "INFO"

    # ── Limits ────────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 30
    MAX_CHUNK_TOKENS: int = 512
    MAX_CONTEXT_CHUNKS: int = 5

    # ── Dev flag ──────────────────────────────────────────────
    # True  = dev mode  → skip model pre-warm at startup (safe with --reload)
    # False = prod mode → pre-warm model at startup
    RELOAD_MODE: bool = True

    # ── Computed property ─────────────────────────────────────
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS env var into a Python list.

        Supports both formats:
          CORS_ORIGINS="http://localhost:3000,https://app.example.com"
          CORS_ORIGINS="http://localhost:3000"
        """
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
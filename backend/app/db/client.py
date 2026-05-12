from __future__ import annotations

from loguru import logger
from supabase import create_client, Client

from app.config import settings

_client: Client | None = None


def get_supabase() -> Client:
    global _client
    if _client is None:
        key = settings.SUPABASE_SERVICE_ROLE_KEY
        if not key:
            logger.error("SUPABASE_SERVICE_ROLE_KEY is missing.")
            raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not set.")
        _client = create_client(settings.SUPABASE_URL, key)
    return _client

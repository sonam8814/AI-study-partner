from __future__ import annotations

from functools import lru_cache
from uuid import UUID

import httpx
from fastapi import Header, HTTPException, status
from jose import jwk, jwt, JWTError
from loguru import logger

from app.config import settings


@lru_cache(maxsize=1)
def _get_jwks_key():
    """Fetch the Supabase JWKS public key once and cache it."""
    url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    resp = httpx.get(url, timeout=10)
    resp.raise_for_status()
    key_data = resp.json()["keys"][0]
    logger.info(f"JWKS loaded — alg: {key_data.get('alg')}, kid: {key_data.get('kid')}")
    return jwk.construct(key_data)


def _decode_token(token: str) -> dict:
    """Try ES256 (JWKS) first, fall back to HS256 (legacy secret)."""
    # ES256 — newer Supabase projects
    try:
        key = _get_jwks_key()
        return jwt.decode(token, key, algorithms=["ES256"], audience="authenticated")
    except JWTError:
        pass

    # HS256 — older Supabase projects
    if settings.SUPABASE_JWT_SECRET:
        try:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        except JWTError:
            pass

    raise JWTError("Token could not be verified with any known key")


async def get_current_user_id(
    authorization: str | None = Header(default=None),
) -> UUID:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = _decode_token(token)
    except JWTError as exc:
        logger.warning(f"JWT verification failed: {exc}")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {exc}")
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token missing sub")
    return UUID(sub)

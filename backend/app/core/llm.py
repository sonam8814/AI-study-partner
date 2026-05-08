from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from typing import AsyncIterator

from loguru import logger

from app.config import settings


class LLMClient(ABC):
    @abstractmethod
    async def stream_chat(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.4,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        """Yield text tokens as they arrive."""

    @abstractmethod
    async def complete(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int = 512,
        json_mode: bool = False,
    ) -> str:
        """Non-streaming completion, returns full response text."""


# ── Groq ───────────────────────────────────────────────────────────────────────

class GroqClient(LLMClient):
    def __init__(self, api_key: str, model: str) -> None:
        import groq as _groq
        self._client = _groq.AsyncGroq(api_key=api_key)
        self._model = model

    async def stream_chat(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.4,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        import groq as _groq
        msgs = [{"role": "system", "content": system}] + messages
        last_err: Exception | None = None
        for attempt in range(3):
            try:
                stream = await self._client.chat.completions.create(
                    model=self._model,
                    messages=msgs,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        yield delta
                return
            except (_groq.APIStatusError, _groq.APITimeoutError, _groq.APIConnectionError) as e:
                last_err = e
                # Don't retry non-rate-limit 4xx errors
                if isinstance(e, _groq.APIStatusError) and e.status_code < 500 and e.status_code != 429:
                    raise
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)
        if last_err:
            raise last_err

    async def complete(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int = 512,
        json_mode: bool = False,
    ) -> str:
        import groq as _groq
        msgs = [{"role": "system", "content": system}] + messages
        kwargs: dict = {
            "model": self._model,
            "messages": msgs,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        last_err: Exception | None = None
        for attempt in range(3):
            try:
                resp = await self._client.chat.completions.create(**kwargs)
                return resp.choices[0].message.content or ""
            except (_groq.APIStatusError, _groq.APITimeoutError, _groq.APIConnectionError) as e:
                last_err = e
                if isinstance(e, _groq.APIStatusError) and e.status_code < 500 and e.status_code != 429:
                    raise
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)
        if last_err:
            raise last_err
        return ""


# ── Ollama ─────────────────────────────────────────────────────────────────────

class OllamaClient(LLMClient):
    def __init__(self, host: str, model: str) -> None:
        import ollama as _ollama
        self._client = _ollama.AsyncClient(host=host)
        self._model = model

    @staticmethod
    def _content(chunk: object) -> str:
        if isinstance(chunk, dict):
            return chunk.get("message", {}).get("content", "") or ""
        return getattr(getattr(chunk, "message", None), "content", "") or ""

    async def stream_chat(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.4,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        import httpx
        msgs = [{"role": "system", "content": system}] + messages
        last_err: Exception | None = None
        for attempt in range(3):
            try:
                stream = await self._client.chat(
                    model=self._model,
                    messages=msgs,
                    stream=True,
                    options={"temperature": temperature, "num_predict": max_tokens},
                )
                async for chunk in stream:
                    delta = self._content(chunk)
                    if delta:
                        yield delta
                return
            except (httpx.ConnectError, httpx.TimeoutException) as e:
                last_err = e
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)
        if last_err:
            raise last_err

    async def complete(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int = 512,
        json_mode: bool = False,
    ) -> str:
        import httpx
        msgs = [{"role": "system", "content": system}] + messages
        last_err: Exception | None = None
        for attempt in range(3):
            try:
                resp = await self._client.chat(
                    model=self._model,
                    messages=msgs,
                    stream=False,
                    options={"temperature": temperature, "num_predict": max_tokens},
                    format="json" if json_mode else "",
                )
                return self._content(resp)
            except (httpx.ConnectError, httpx.TimeoutException) as e:
                last_err = e
                if attempt < 2:
                    await asyncio.sleep(2 ** attempt)
        if last_err:
            raise last_err
        return ""


# ── Failover wrapper ───────────────────────────────────────────────────────────

class FailoverLLMClient(LLMClient):
    """Tries primary; on failure falls back to secondary (if configured)."""

    def __init__(self, primary: LLMClient, fallback: LLMClient | None = None) -> None:
        self._primary = primary
        self._fallback = fallback

    async def stream_chat(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.4,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        primary_gen = self._primary.stream_chat(system, messages, temperature, max_tokens)
        try:
            # Peek at the first token to validate the connection
            first = await primary_gen.__anext__()
        except StopAsyncIteration:
            return
        except Exception as primary_err:
            if self._fallback is None:
                raise
            logger.warning(f"Primary LLM stream_chat failed ({primary_err!r}), falling back to Ollama")
            async for token in self._fallback.stream_chat(system, messages, temperature, max_tokens):
                yield token
            return

        yield first
        async for token in primary_gen:
            yield token

    async def complete(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int = 512,
        json_mode: bool = False,
    ) -> str:
        try:
            return await self._primary.complete(system, messages, temperature, max_tokens, json_mode)
        except Exception as primary_err:
            if self._fallback is None:
                raise
            logger.warning(f"Primary LLM complete failed ({primary_err!r}), falling back to Ollama")
            return await self._fallback.complete(system, messages, temperature, max_tokens, json_mode)


# ── Factory ────────────────────────────────────────────────────────────────────

def get_llm_client() -> LLMClient:
    """Return the configured LLM client (with optional failover)."""
    fallback: LLMClient | None = None
    if settings.OLLAMA_HOST:
        fallback = OllamaClient(host=settings.OLLAMA_HOST, model=settings.OLLAMA_MODEL)

    if settings.LLM_PROVIDER == "groq":
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not set — using Ollama directly")
            if fallback:
                return fallback
            raise RuntimeError("No LLM configured: set GROQ_API_KEY or use LLM_PROVIDER=ollama")
        primary = GroqClient(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL)
        return FailoverLLMClient(primary=primary, fallback=fallback)

    # LLM_PROVIDER == "ollama"
    if not fallback:
        raise RuntimeError("LLM_PROVIDER=ollama but OLLAMA_HOST is not set")
    return fallback

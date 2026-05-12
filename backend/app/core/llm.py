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


_SENTINEL = object()


# ── Groq ───────────────────────────────────────────────────────────────────────

class GroqClient(LLMClient):
    def __init__(self, api_key: str, model: str) -> None:
        self._api_key = api_key
        self._model = model

    async def stream_chat(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.4,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        """Stream tokens using sync Groq client in a thread + asyncio.Queue.

        The groq==0.8.0 AsyncGroq streaming has a known issue where its
        AsyncStream raises 'Attempted to call a sync iterator on an async stream'
        when consumed inside async generators. Using the sync client in a thread
        with call_soon_threadsafe avoids this entirely.
        """
        from groq import Groq, APIStatusError, APITimeoutError, APIConnectionError

        queue: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_running_loop()
        error_holder: list[Exception] = []

        def _sync_stream() -> None:
            client = Groq(api_key=self._api_key)
            msgs = [{"role": "system", "content": system}] + messages
            last_err: Exception | None = None
            for attempt in range(3):
                try:
                    stream = client.chat.completions.create(
                        model=self._model,
                        messages=msgs,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        stream=True,
                    )
                    for chunk in stream:
                        delta = chunk.choices[0].delta.content
                        if delta:
                            loop.call_soon_threadsafe(queue.put_nowait, delta)
                    return
                except (APIStatusError, APITimeoutError, APIConnectionError) as e:
                    last_err = e
                    if isinstance(e, APIStatusError) and e.status_code < 500 and e.status_code != 429:
                        error_holder.append(e)
                        return
                    if attempt < 2:
                        import time
                        time.sleep(2 ** attempt)
            if last_err:
                error_holder.append(last_err)

        future = loop.run_in_executor(None, _sync_stream)

        try:
            while True:
                try:
                    token = await asyncio.wait_for(queue.get(), timeout=0.05)
                    yield token
                except asyncio.TimeoutError:
                    if future.done():
                        while not queue.empty():
                            yield queue.get_nowait()
                        break
        finally:
            await future

        if error_holder:
            raise error_holder[0]

    async def complete(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int = 512,
        json_mode: bool = False,
    ) -> str:
        from groq import Groq, APIStatusError, APITimeoutError, APIConnectionError

        def _sync_complete() -> str:
            client = Groq(api_key=self._api_key)
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
                    resp = client.chat.completions.create(**kwargs)
                    return resp.choices[0].message.content or ""
                except (APIStatusError, APITimeoutError, APIConnectionError) as e:
                    last_err = e
                    if isinstance(e, APIStatusError) and e.status_code < 500 and e.status_code != 429:
                        raise
                    if attempt < 2:
                        import time
                        time.sleep(2 ** attempt)
            if last_err:
                raise last_err
            return ""

        return await asyncio.to_thread(_sync_complete)


# ── Ollama ─────────────────────────────────────────────────────────────────────

class OllamaClient(LLMClient):
    def __init__(self, host: str, model: str) -> None:
        self._host = host
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
        """Stream tokens using sync Ollama client in a thread + asyncio.Queue."""
        import ollama as _ollama
        import httpx

        queue: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_running_loop()
        error_holder: list[Exception] = []

        def _sync_stream() -> None:
            client = _ollama.Client(host=self._host)
            msgs = [{"role": "system", "content": system}] + messages
            last_err: Exception | None = None
            for attempt in range(3):
                try:
                    stream = client.chat(
                        model=self._model,
                        messages=msgs,
                        stream=True,
                        options={"temperature": temperature, "num_predict": max_tokens},
                    )
                    for chunk in stream:
                        delta = OllamaClient._content(chunk)
                        if delta:
                            loop.call_soon_threadsafe(queue.put_nowait, delta)
                    return
                except (httpx.ConnectError, httpx.TimeoutException, Exception) as e:
                    last_err = e
                    if attempt < 2:
                        import time
                        time.sleep(2 ** attempt)
            if last_err:
                error_holder.append(last_err)

        future = loop.run_in_executor(None, _sync_stream)

        try:
            while True:
                try:
                    token = await asyncio.wait_for(queue.get(), timeout=0.05)
                    yield token
                except asyncio.TimeoutError:
                    if future.done():
                        while not queue.empty():
                            yield queue.get_nowait()
                        break
        finally:
            await future

        if error_holder:
            raise error_holder[0]

    async def complete(
        self,
        system: str,
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int = 512,
        json_mode: bool = False,
    ) -> str:
        import ollama as _ollama
        import httpx

        def _sync_complete() -> str:
            client = _ollama.Client(host=self._host)
            msgs = [{"role": "system", "content": system}] + messages
            last_err: Exception | None = None
            for attempt in range(3):
                try:
                    resp = client.chat(
                        model=self._model,
                        messages=msgs,
                        stream=False,
                        options={"temperature": temperature, "num_predict": max_tokens},
                        format="json" if json_mode else "",
                    )
                    return OllamaClient._content(resp)
                except (httpx.ConnectError, httpx.TimeoutException) as e:
                    last_err = e
                    if attempt < 2:
                        import time
                        time.sleep(2 ** attempt)
            if last_err:
                raise last_err
            return ""

        return await asyncio.to_thread(_sync_complete)


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
        try:
            had_tokens = False
            async for token in self._primary.stream_chat(
                system, messages, temperature, max_tokens
            ):
                had_tokens = True
                yield token
            if had_tokens:
                return
        except Exception as primary_err:
            if self._fallback is None:
                raise
            logger.warning(
                f"Primary LLM stream_chat failed ({primary_err!r}), falling back"
            )

        if self._fallback:
            async for token in self._fallback.stream_chat(
                system, messages, temperature, max_tokens
            ):
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
            return await self._primary.complete(
                system, messages, temperature, max_tokens, json_mode
            )
        except Exception as primary_err:
            if self._fallback is None:
                raise
            logger.warning(
                f"Primary LLM complete failed ({primary_err!r}), falling back"
            )
            return await self._fallback.complete(
                system, messages, temperature, max_tokens, json_mode
            )


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
            raise RuntimeError(
                "No LLM configured: set GROQ_API_KEY or use LLM_PROVIDER=ollama"
            )
        primary = GroqClient(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL)
        return FailoverLLMClient(primary=primary, fallback=fallback)

    # LLM_PROVIDER == "ollama"
    if not fallback:
        raise RuntimeError("LLM_PROVIDER=ollama but OLLAMA_HOST is not set")
    return fallback

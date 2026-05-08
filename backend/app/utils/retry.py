from __future__ import annotations

from tenacity import retry, stop_after_attempt, wait_exponential

# Standard retry decorator for LLM calls:
# 3 attempts, exponential backoff 1s → 2s → 4s (per PRD §10.2)
llm_retry = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    reraise=True,
)

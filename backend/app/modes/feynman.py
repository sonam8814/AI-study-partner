from __future__ import annotations

import json
import re
from uuid import UUID

from loguru import logger

from app.core.prompts import FEYNMAN_GENERAL_PROMPT
from app.core.rag_engine import RetrievedChunk, build_rag_context
from app.modes.base import ModeHandler
from app.modes.examiner import upsert_weak_spot

_FEYNMAN_RESULT_RE = re.compile(r"FEYNMAN_RESULT:\s*(\{.+?\})", re.DOTALL)


class FeynmanMode(ModeHandler):
    name = "feynman"

    def system_prompt(self, context_chunks: list[RetrievedChunk]) -> str:
        return FEYNMAN_GENERAL_PROMPT.format(rag_context=build_rag_context(context_chunks))

    async def post_process(
        self,
        user_id: UUID,
        material_id: UUID | None,
        user_msg: str,
        assistant_msg: str,
        retrieved: list[RetrievedChunk],
    ) -> dict:
        m = _FEYNMAN_RESULT_RE.search(assistant_msg)
        if not m:
            return {}
        try:
            data = json.loads(m.group(1))
            score = data.get("score", 0)
            gaps: list[str] = data.get("gaps", [])
            created = []
            for topic in gaps:
                row = await upsert_weak_spot(
                    user_id, material_id, topic, "Feynman gap"
                )
                created.append({"id": row["id"], "topic": topic, "description": "Feynman gap"})
            return {"score": score, "gaps": gaps, "weak_spots_created": created}
        except Exception as exc:
            logger.warning(f"[feynman] Failed to parse FEYNMAN_RESULT: {exc}")
            return {}

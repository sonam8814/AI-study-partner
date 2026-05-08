from __future__ import annotations

from uuid import UUID

from app.core.prompts import TUTOR_PROMPT
from app.core.rag_engine import RetrievedChunk, build_rag_context
from app.modes.base import ModeHandler


class TutorMode(ModeHandler):
    name = "tutor"

    def system_prompt(self, context_chunks: list[RetrievedChunk]) -> str:
        return TUTOR_PROMPT.format(rag_context=build_rag_context(context_chunks))

    async def post_process(
        self,
        user_id: UUID,
        material_id: UUID | None,
        user_msg: str,
        assistant_msg: str,
        retrieved: list[RetrievedChunk],
    ) -> dict:
        return {}

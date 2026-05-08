from __future__ import annotations

from abc import ABC, abstractmethod
from uuid import UUID

from app.core.rag_engine import RetrievedChunk


class ModeHandler(ABC):
    name: str

    @abstractmethod
    def system_prompt(self, context_chunks: list[RetrievedChunk]) -> str:
        """Return the full system prompt for this mode, with RAG context injected."""

    @abstractmethod
    async def post_process(
        self,
        user_id: UUID,
        material_id: UUID | None,
        user_msg: str,
        assistant_msg: str,
        retrieved: list[RetrievedChunk],
    ) -> dict:
        """
        Called after streaming completes.
        Returns extras dict (e.g. weak_spots_created, score, gaps).
        """

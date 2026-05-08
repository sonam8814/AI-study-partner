from __future__ import annotations

import asyncio
import re
from uuid import UUID

from pydantic import BaseModel

from app.config import settings
from app.core.embeddings import embed_text
from app.db.client import get_supabase
from app.db.schemas import Citation


class RetrievedChunk(BaseModel):
    id: UUID
    material_id: UUID
    chunk_index: int
    content: str
    section_heading: str | None
    char_start: int
    char_end: int
    similarity: float


async def retrieve_context(
    user_id: UUID,
    query: str,
    material_id: UUID | None = None,
    k: int | None = None,
    threshold: float = 0.5,
) -> list[RetrievedChunk]:
    """Embed query and call match_chunks RPC, returning top-k ranked chunks."""
    if k is None:
        k = settings.MAX_CONTEXT_CHUNKS

    query_emb = embed_text(query)

    def _rpc() -> list[dict]:
        resp = get_supabase().rpc(
            "match_chunks",
            {
                "query_embedding": query_emb,
                "match_user_id": str(user_id),
                "match_material_id": str(material_id) if material_id else None,
                "match_threshold": threshold,
                "match_count": k,
            },
        ).execute()
        return resp.data or []

    rows = await asyncio.to_thread(_rpc)
    return [RetrievedChunk(**r) for r in rows]


def build_rag_context(chunks: list[RetrievedChunk]) -> str:
    """Build the RAG context string injected into system prompts (PRD §10.7)."""
    if not chunks:
        return ""
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        heading = chunk.section_heading or "your notes"
        parts.append(f'[{i}] (from "{heading}")\n{chunk.content}')
    header = (
        "You have access to the user's notes via the following retrieved excerpts.\n"
        "When citing them, use [N] format where N matches the source number.\n\n"
    )
    return header + "\n\n".join(parts)


_CITATION_RE = re.compile(r"\[(\d+)\]")


def extract_citations(text: str, retrieved: list[RetrievedChunk]) -> list[Citation]:
    """Parse [N] markers in assistant text → Citation objects (PRD §10.8)."""
    indices = sorted({int(m.group(1)) for m in _CITATION_RE.finditer(text)})
    return [
        Citation(
            index=i,
            chunk_id=retrieved[i - 1].id,
            material_id=retrieved[i - 1].material_id,
            char_start=retrieved[i - 1].char_start,
            char_end=retrieved[i - 1].char_end,
            section=retrieved[i - 1].section_heading,
            similarity=retrieved[i - 1].similarity,
        )
        for i in indices
        if 1 <= i <= len(retrieved)
    ]

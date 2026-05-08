from __future__ import annotations

import asyncio
import json
import re
from datetime import UTC, datetime
from uuid import UUID

from loguru import logger

from app.core.prompts import EXAMINER_PROMPT
from app.core.rag_engine import RetrievedChunk, build_rag_context
from app.modes.base import ModeHandler

_WEAK_SPOT_RE = re.compile(r"WEAK_SPOT:\s*(\{.+?\})", re.DOTALL)


async def upsert_weak_spot(
    user_id: UUID,
    material_id: UUID | None,
    topic: str,
    description: str,
) -> dict:
    """Insert or increment-miss a weak spot. Returns the DB row."""
    from app.db.client import get_supabase

    def _sync() -> dict:
        db = get_supabase()
        q = (
            db.table("weak_spots")
            .select("id, miss_count")
            .eq("user_id", str(user_id))
            .eq("topic", topic)
            .eq("resolved", False)
        )
        if material_id:
            q = q.eq("material_id", str(material_id))
        existing = q.maybe_single().execute()

        if existing is None or not existing.data:
            row = (
                db.table("weak_spots")
                .insert(
                    {
                        "user_id": str(user_id),
                        "material_id": str(material_id) if material_id else None,
                        "topic": topic,
                        "description": description,
                    }
                )
                .execute()
            )
            return row.data[0]
        else:
            new_count = existing.data["miss_count"] + 1
            row = (
                db.table("weak_spots")
                .update(
                    {
                        "miss_count": new_count,
                        "last_missed_at": datetime.now(UTC).isoformat(),
                        "description": description,
                    }
                )
                .eq("id", existing.data["id"])
                .execute()
            )
            return row.data[0]

    return await asyncio.to_thread(_sync)


class ExaminerMode(ModeHandler):
    name = "examiner"

    def system_prompt(self, context_chunks: list[RetrievedChunk]) -> str:
        return EXAMINER_PROMPT.format(rag_context=build_rag_context(context_chunks))

    async def post_process(
        self,
        user_id: UUID,
        material_id: UUID | None,
        user_msg: str,
        assistant_msg: str,
        retrieved: list[RetrievedChunk],
    ) -> dict:
        m = _WEAK_SPOT_RE.search(assistant_msg)
        if not m:
            return {}
        try:
            data = json.loads(m.group(1))
            topic = data.get("topic", "Unknown topic")
            description = data.get("description", "")
            row = await upsert_weak_spot(user_id, material_id, topic, description)
            return {
                "weak_spots_created": [
                    {"id": row["id"], "topic": topic, "description": description}
                ]
            }
        except Exception as exc:
            logger.warning(f"[examiner] Failed to parse/upsert WEAK_SPOT: {exc}")
            return {}

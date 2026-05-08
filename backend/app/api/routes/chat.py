from __future__ import annotations

import asyncio
import json
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from loguru import logger

from app.api.deps import get_current_user_id
from app.config import settings
from app.core.llm import get_llm_client
from app.core.rag_engine import extract_citations, retrieve_context
from app.db.client import get_supabase
from app.db.schemas import ChatRequest, StudySession
from app.modes.base import ModeHandler
from app.modes.examiner import ExaminerMode
from app.modes.feynman import FeynmanMode
from app.modes.peer import PeerMode
from app.modes.tutor import TutorMode

router = APIRouter(prefix="/chat", tags=["chat"])

UserID = Annotated[uuid.UUID, Depends(get_current_user_id)]

MODE_REGISTRY: dict[str, type[ModeHandler]] = {
    "peer": PeerMode,
    "tutor": TutorMode,
    "examiner": ExaminerMode,
    "feynman": FeynmanMode,
}


def _get_mode(name: str) -> ModeHandler:
    cls = MODE_REGISTRY.get(name)
    if not cls:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Unknown mode: {name}")
    return cls()


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


def _get_or_create_session(db, body: ChatRequest, user_id: uuid.UUID) -> tuple[str, list[dict]]:
    """Returns (session_id_str, existing_messages)."""
    if body.session_id:
        resp = (
            db.table("study_sessions")
            .select("id, messages")
            .eq("id", str(body.session_id))
            .eq("user_id", str(user_id))
            .maybe_single()
            .execute()
        )
        if resp is None or not resp.data:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                detail={
                    "error": {
                        "code": "SESSION_NOT_FOUND",
                        "message": "Study session not found",
                        "details": {"session_id": str(body.session_id)},
                    }
                },
            )
        return str(resp.data["id"]), resp.data.get("messages") or []

    resp = (
        db.table("study_sessions")
        .insert(
            {
                "user_id": str(user_id),
                "material_id": str(body.material_id) if body.material_id else None,
                "mode": body.mode,
                "messages": [],
            }
        )
        .execute()
    )
    return str(resp.data[0]["id"]), []


@router.post("", response_class=StreamingResponse)
async def chat(body: ChatRequest, user_id: UserID) -> StreamingResponse:
    db = get_supabase()

    # 1. Session
    session_id, prior_messages = await asyncio.to_thread(
        _get_or_create_session, db, body, user_id
    )

    # 2. RAG retrieval
    retrieved = []
    if body.material_id:
        try:
            retrieved = await retrieve_context(
                user_id=user_id,
                query=body.message,
                material_id=body.material_id,
                k=settings.MAX_CONTEXT_CHUNKS,
            )
        except Exception as exc:
            logger.warning(f"[chat] RAG retrieval failed: {exc}")

    # 3. Mode handler + system prompt
    handler = _get_mode(body.mode)
    system = handler.system_prompt(retrieved)

    # 4. LLM message history (prior turns + new user message)
    llm_messages = [
        {"role": m["role"], "content": m["content"]} for m in prior_messages
    ]
    llm_messages.append({"role": "user", "content": body.message})

    llm = get_llm_client()
    message_id = str(uuid.uuid4())

    async def event_generator():
        full_response = ""
        try:
            async for token in llm.stream_chat(
                system=system,
                messages=llm_messages,
                temperature=0.4,
                max_tokens=1024,
            ):
                full_response += token
                yield f"event: token\ndata: {json.dumps({'text': token})}\n\n"
        except Exception as exc:
            logger.error(f"[chat] LLM stream error: {exc}")
            yield (
                f"event: error\ndata: "
                f"{json.dumps({'code': 'LLM_ERROR', 'message': str(exc)})}\n\n"
            )
            return

        # 5. Citations
        citations = extract_citations(full_response, retrieved)
        citations_data = [
            {
                "index": c.index,
                "chunk_id": str(c.chunk_id),
                "material_id": str(c.material_id),
                "char_start": c.char_start,
                "char_end": c.char_end,
                "section": c.section,
                "similarity": c.similarity,
            }
            for c in citations
        ]
        yield f"event: citations\ndata: {json.dumps({'citations': citations_data})}\n\n"

        # 6. Post-process (examiner WEAK_SPOT, feynman FEYNMAN_RESULT)
        try:
            extras = await handler.post_process(
                user_id=user_id,
                material_id=body.material_id,
                user_msg=body.message,
                assistant_msg=full_response,
                retrieved=retrieved,
            )
        except Exception as exc:
            logger.warning(f"[chat] post_process error: {exc}")
            extras = {}

        for ws in extras.get("weak_spots_created", []):
            yield (
                f"event: weak_spot\ndata: "
                f"{json.dumps({'topic': ws['topic'], 'description': ws['description']})}\n\n"
            )

        # 7. Persist session
        now = _now_iso()
        user_msg_record = {
            "role": "user",
            "content": body.message,
            "citations": [],
            "timestamp": now,
            "mode": body.mode,
        }
        assistant_msg_record = {
            "id": message_id,
            "role": "assistant",
            "content": full_response,
            "citations": citations_data,
            "timestamp": now,
            "mode": body.mode,
        }
        updated_messages = prior_messages + [user_msg_record, assistant_msg_record]

        try:
            await asyncio.to_thread(
                lambda: db.table("study_sessions")
                .update({"messages": updated_messages, "last_active_at": now})
                .eq("id", session_id)
                .execute()
            )
        except Exception as exc:
            logger.error(f"[chat] Failed to persist session: {exc}")

        # 8. Done
        yield (
            f"event: done\ndata: "
            f"{json.dumps({'session_id': session_id, 'message_id': message_id})}\n\n"
        )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


@router.get("/sessions/{session_id}", response_model=StudySession)
async def get_session(session_id: uuid.UUID, user_id: UserID) -> StudySession:
    db = get_supabase()
    resp = (
        db.table("study_sessions")
        .select("*")
        .eq("id", str(session_id))
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if resp is None or not resp.data:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "SESSION_NOT_FOUND",
                    "message": "Study session not found",
                    "details": {"session_id": str(session_id)},
                }
            },
        )
    row = resp.data
    row.setdefault("messages", [])
    return StudySession(**row)

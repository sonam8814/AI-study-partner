from __future__ import annotations

import asyncio
import json
import random
import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from loguru import logger

from app.api.deps import get_current_user_id
from app.config import settings
from app.core.llm import get_llm_client
from app.core.prompts import FEYNMAN_CRITIQUE_PROMPT, FEYNMAN_SELECT_CONCEPT_PROMPT
from app.core.rag_engine import extract_citations, retrieve_context
from app.db.client import get_supabase
from app.db.schemas import (
    FeynmanCritiqueRequest,
    FeynmanPromptRequest,
    FeynmanPromptResponse,
)
from app.modes.feynman import FeynmanMode

router = APIRouter(prefix="/feynman", tags=["feynman"])

UserID = Annotated[uuid.UUID, Depends(get_current_user_id)]


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


@router.post("/prompt", response_model=FeynmanPromptResponse)
async def feynman_prompt(body: FeynmanPromptRequest, user_id: UserID) -> FeynmanPromptResponse:
    db = get_supabase()

    # 1. Get or create session
    if body.session_id:
        resp = (
            db.table("study_sessions")
            .select("id")
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
        session_id = str(resp.data["id"])
    else:
        resp = (
            db.table("study_sessions")
            .insert(
                {
                    "user_id": str(user_id),
                    "material_id": str(body.material_id),
                    "mode": "feynman",
                    "messages": [],
                }
            )
            .execute()
        )
        session_id = str(resp.data[0]["id"])

    # 2. Fetch chunks for the material (up to 10, sample 3)
    def _fetch_chunks() -> list[dict]:
        r = (
            db.table("material_chunks")
            .select("section_heading, content")
            .eq("material_id", str(body.material_id))
            .eq("user_id", str(user_id))
            .limit(20)
            .execute()
        )
        return r.data or []

    chunks = await asyncio.to_thread(_fetch_chunks)
    if not chunks:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": {
                    "code": "MATERIAL_NOT_INDEXED",
                    "message": "Material has no indexed chunks. Try reindexing.",
                    "details": {"material_id": str(body.material_id)},
                }
            },
        )

    # 3. Sample 3 chunks and pick best concept via LLM
    sample = random.sample(chunks, min(3, len(chunks)))
    topics = [
        c["section_heading"] or c["content"][:60].replace("\n", " ")
        for c in sample
    ]
    topics_str = "\n".join(f"- {t}" for t in topics)

    llm = get_llm_client()
    raw = await llm.complete(
        system="You are a helpful study assistant.",
        messages=[
            {"role": "user", "content": FEYNMAN_SELECT_CONCEPT_PROMPT.format(topics=topics_str)}
        ],
        temperature=0.3,
        max_tokens=128,
        json_mode=True,
    )

    try:
        parsed = json.loads(raw)
        concept = parsed.get("concept", topics[0])
        prompt_text = parsed.get(
            "prompt", f"Explain {concept} as if to a 10-year-old. No jargon."
        )
    except (json.JSONDecodeError, KeyError):
        concept = topics[0]
        prompt_text = f"Explain {concept} as if to a 10-year-old. No jargon."

    return FeynmanPromptResponse(
        concept=concept,
        prompt=prompt_text,
        session_id=uuid.UUID(session_id),
    )


@router.post("/critique", response_class=StreamingResponse)
async def feynman_critique(
    body: FeynmanCritiqueRequest, user_id: UserID
) -> StreamingResponse:
    db = get_supabase()

    # Load session
    resp = (
        db.table("study_sessions")
        .select("id, messages, material_id")
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
    session_data = resp.data
    prior_messages: list[dict] = session_data.get("messages") or []
    material_id_str: str | None = session_data.get("material_id")
    material_id = uuid.UUID(material_id_str) if material_id_str else None

    # RAG retrieval
    retrieved = []
    if material_id:
        try:
            retrieved = await retrieve_context(
                user_id=user_id,
                query=body.concept + " " + body.user_explanation,
                material_id=material_id,
                k=settings.MAX_CONTEXT_CHUNKS,
            )
        except Exception as exc:
            logger.warning(f"[feynman/critique] RAG retrieval failed: {exc}")

    from app.core.rag_engine import build_rag_context
    rag_ctx = build_rag_context(retrieved)
    system = FEYNMAN_CRITIQUE_PROMPT.format(concept=body.concept, rag_context=rag_ctx)

    llm_messages = [
        {"role": m["role"], "content": m["content"]} for m in prior_messages
    ]
    llm_messages.append({"role": "user", "content": body.user_explanation})

    llm = get_llm_client()
    handler = FeynmanMode()
    message_id = str(uuid.uuid4())

    async def event_generator():
        full_response = ""
        try:
            async for token in llm.stream_chat(
                system=system,
                messages=llm_messages,
                temperature=0.3,
                max_tokens=1024,
            ):
                full_response += token
                yield f"event: token\ndata: {json.dumps({'text': token})}\n\n"
        except Exception as exc:
            logger.error(f"[feynman/critique] LLM error: {exc}")
            yield f"event: error\ndata: {json.dumps({'code': 'LLM_ERROR', 'message': str(exc)})}\n\n"
            return

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

        try:
            extras = await handler.post_process(
                user_id=user_id,
                material_id=material_id,
                user_msg=body.user_explanation,
                assistant_msg=full_response,
                retrieved=retrieved,
            )
        except Exception as exc:
            logger.warning(f"[feynman/critique] post_process error: {exc}")
            extras = {}

        now = _now_iso()
        updated_messages = prior_messages + [
            {
                "role": "user",
                "content": body.user_explanation,
                "citations": [],
                "timestamp": now,
                "mode": "feynman",
            },
            {
                "id": message_id,
                "role": "assistant",
                "content": full_response,
                "citations": citations_data,
                "timestamp": now,
                "mode": "feynman",
            },
        ]
        try:
            await asyncio.to_thread(
                lambda: db.table("study_sessions")
                .update({"messages": updated_messages, "last_active_at": now})
                .eq("id", str(body.session_id))
                .execute()
            )
        except Exception as exc:
            logger.error(f"[feynman/critique] Failed to persist session: {exc}")

        done_data: dict = {"session_id": str(body.session_id), "message_id": message_id}
        if "score" in extras:
            done_data["score"] = extras["score"]
        if "gaps" in extras:
            done_data["gaps"] = extras["gaps"]
        if "weak_spots_created" in extras:
            done_data["weak_spots_created"] = [w["id"] for w in extras["weak_spots_created"]]
        yield f"event: done\ndata: {json.dumps(done_data)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )

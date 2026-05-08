from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response, status
from loguru import logger

from app.api.deps import get_current_user_id
from app.db.client import get_supabase
from app.db.schemas import Material, MaterialCreate, MaterialListResponse, MaterialUpdate
from app.utils.indexer import index_material

router = APIRouter(prefix="/materials", tags=["materials"])

UserID = Annotated[uuid.UUID, Depends(get_current_user_id)]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _not_found(material_id: uuid.UUID) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={
            "error": {
                "code": "MATERIAL_NOT_FOUND",
                "message": "Material not found",
                "details": {"material_id": str(material_id)},
            }
        },
    )


def _row_to_material(row: dict) -> Material:
    row.setdefault("is_indexed", False)
    row.setdefault("word_count", 0)
    row.setdefault("tags", [])
    return Material(**row)


# ── Background: chunk + embed ──────────────────────────────────────────────────

def _index_material(material_id: str, user_id: str) -> None:
    index_material(material_id, user_id)


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=MaterialListResponse)
async def list_materials(
    user_id: UserID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    search: str | None = Query(default=None),
) -> MaterialListResponse:
    db = get_supabase()

    query = (
        db.table("materials")
        .select("*", count="exact")
        .eq("user_id", str(user_id))
        .order("updated_at", desc=True)
        .range(offset, offset + limit - 1)
    )
    if search:
        query = query.ilike("title", f"%{search}%")

    resp = query.execute()
    items = [_row_to_material(r) for r in (resp.data or [])]
    total = resp.count or 0
    return MaterialListResponse(items=items, total=total)


@router.post("", response_model=Material, status_code=status.HTTP_201_CREATED)
async def create_material(
    body: MaterialCreate,
    user_id: UserID,
    background_tasks: BackgroundTasks,
) -> Material:
    db = get_supabase()

    resp = (
        db.table("materials")
        .insert({
            "user_id": str(user_id),
            "title": body.title,
            "markdown_content": body.markdown_content,
            "tags": body.tags,
            "is_indexed": False,
        })
        .execute()
    )
    row = resp.data[0]
    if body.markdown_content.strip():
        background_tasks.add_task(_index_material, row["id"], str(user_id))
    return _row_to_material(row)


@router.get("/{material_id}", response_model=Material)
async def get_material(material_id: uuid.UUID, user_id: UserID) -> Material:
    db = get_supabase()

    resp = (
        db.table("materials")
        .select("*")
        .eq("id", str(material_id))
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if resp is None or not resp.data:
        raise _not_found(material_id)
    return _row_to_material(resp.data)


@router.patch("/{material_id}", response_model=Material)
async def update_material(
    material_id: uuid.UUID,
    body: MaterialUpdate,
    user_id: UserID,
    background_tasks: BackgroundTasks,
) -> Material:
    db = get_supabase()

    # Verify ownership
    existing = (
        db.table("materials")
        .select("id, markdown_content")
        .eq("id", str(material_id))
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if existing is None or not existing.data:
        raise _not_found(material_id)

    patch: dict = {}
    if body.title is not None:
        patch["title"] = body.title
    if body.tags is not None:
        patch["tags"] = body.tags
    content_changed = False
    if body.markdown_content is not None:
        patch["markdown_content"] = body.markdown_content
        patch["is_indexed"] = False
        content_changed = body.markdown_content != existing.data["markdown_content"]

    if not patch:
        return _row_to_material(existing.data | {"user_id": str(user_id)})

    resp = (
        db.table("materials")
        .update(patch)
        .eq("id", str(material_id))
        .eq("user_id", str(user_id))
        .execute()
    )
    row = resp.data[0]
    if content_changed and row.get("markdown_content", "").strip():
        background_tasks.add_task(_index_material, row["id"], str(user_id))
    return _row_to_material(row)


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_material(material_id: uuid.UUID, user_id: UserID) -> Response:
    db = get_supabase()

    existing = (
        db.table("materials")
        .select("id")
        .eq("id", str(material_id))
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if existing is None or not existing.data:
        raise _not_found(material_id)

    db.table("materials").delete().eq("id", str(material_id)).execute()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{material_id}/reindex", status_code=status.HTTP_202_ACCEPTED)
async def reindex_material(
    material_id: uuid.UUID,
    user_id: UserID,
    background_tasks: BackgroundTasks,
) -> dict:
    db = get_supabase()

    existing = (
        db.table("materials")
        .select("id, markdown_content")
        .eq("id", str(material_id))
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if existing is None or not existing.data:
        raise _not_found(material_id)

    content = existing.data.get("markdown_content", "")
    estimated_chunks = max(1, len(content) // 400)
    background_tasks.add_task(_index_material, str(material_id), str(user_id))
    return {"status": "indexing", "estimated_chunks": estimated_chunks}

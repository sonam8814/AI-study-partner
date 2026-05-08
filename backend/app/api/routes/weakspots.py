from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.deps import get_current_user_id
from app.db.client import get_supabase
from app.db.schemas import WeakSpot, WeakSpotCreate, WeakSpotListResponse, WeakSpotUpdate
from app.modes.examiner import upsert_weak_spot

router = APIRouter(prefix="/weakspots", tags=["weakspots"])

UserID = Annotated[uuid.UUID, Depends(get_current_user_id)]


@router.get("", response_model=WeakSpotListResponse)
async def list_weak_spots(
    user_id: UserID,
    resolved: bool = Query(default=False),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> WeakSpotListResponse:
    db = get_supabase()
    resp = (
        db.table("weak_spots")
        .select("*", count="exact")
        .eq("user_id", str(user_id))
        .eq("resolved", resolved)
        .order("last_missed_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    items = [WeakSpot(**r) for r in (resp.data or [])]
    total = resp.count or 0
    return WeakSpotListResponse(items=items, total=total)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_weak_spot(
    body: WeakSpotCreate,
    user_id: UserID,
    response: Response,
) -> WeakSpot:
    row = await upsert_weak_spot(
        user_id=user_id,
        material_id=body.material_id,
        topic=body.topic,
        description=body.description or "",
    )
    # If miss_count > 1, it was an update (200); otherwise 201 (already set as default)
    if row.get("miss_count", 1) > 1:
        response.status_code = status.HTTP_200_OK
    row.setdefault("resolved_at", None)
    return WeakSpot(**row)


@router.patch("/{weak_spot_id}", response_model=WeakSpot)
async def update_weak_spot(
    weak_spot_id: uuid.UUID,
    body: WeakSpotUpdate,
    user_id: UserID,
) -> WeakSpot:
    db = get_supabase()

    existing = (
        db.table("weak_spots")
        .select("id")
        .eq("id", str(weak_spot_id))
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if existing is None or not existing.data:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "WEAK_SPOT_NOT_FOUND",
                    "message": "Weak spot not found",
                    "details": {"weak_spot_id": str(weak_spot_id)},
                }
            },
        )

    from datetime import UTC, datetime

    patch: dict = {"resolved": body.resolved}
    if body.resolved:
        patch["resolved_at"] = datetime.now(UTC).isoformat()

    resp = (
        db.table("weak_spots")
        .update(patch)
        .eq("id", str(weak_spot_id))
        .eq("user_id", str(user_id))
        .execute()
    )
    row = resp.data[0]
    row.setdefault("resolved_at", None)
    return WeakSpot(**row)

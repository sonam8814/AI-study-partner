from __future__ import annotations

import uuid
from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger

from app.api.deps import get_current_user_id
from app.db.client import get_supabase
from app.db.schemas import BookshelfRecordRequest, BookshelfRecordResponse, BookshelfStats

router = APIRouter(prefix="/bookshelf", tags=["bookshelf"])

UserID = Annotated[uuid.UUID, Depends(get_current_user_id)]


def _get_monthly_study_dates(db, user_id: str) -> list[str]:
    """Query study_sessions to find distinct dates the user studied this month."""
    today = date.today()
    month_start = today.replace(day=1)
    try:
        resp = (
            db.table("study_sessions")
            .select("started_at")
            .eq("user_id", user_id)
            .gte("started_at", month_start.isoformat())
            .lte("started_at", (today + timedelta(days=1)).isoformat())
            .execute()
        )
        if not resp.data:
            return []
        dates = set()
        for row in resp.data:
            dt_str = row.get("started_at", "")
            if dt_str:
                dates.add(dt_str[:10])
        return sorted(dates)
    except Exception as exc:
        logger.warning(f"[bookshelf] Failed to fetch monthly study dates: {exc}")
        return []


@router.get("", response_model=BookshelfStats)
async def get_bookshelf(user_id: UserID) -> BookshelfStats:
    db = get_supabase()
    resp = (
        db.table("garden_stats")
        .select("*")
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    if resp is None or not resp.data:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "BOOKSHELF_NOT_FOUND",
                    "message": "Bookshelf stats not found for this user",
                    "details": {},
                }
            },
        )

    monthly_dates = _get_monthly_study_dates(db, str(user_id))
    data = resp.data
    data["monthly_study_dates"] = monthly_dates
    return BookshelfStats(**data)


@router.post("/record", response_model=BookshelfRecordResponse)
async def record_study(body: BookshelfRecordRequest, user_id: UserID) -> BookshelfRecordResponse:
    db = get_supabase()

    # Call the record_study_day RPC (idempotent per day)
    resp = db.rpc(
        "record_study_day",
        {"p_user_id": str(user_id), "p_minutes": body.minutes_studied},
    ).execute()

    if not resp.data:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "BOOKSHELF_RPC_FAILED",
                    "message": "Failed to record study session",
                    "details": {},
                }
            },
        )

    row = resp.data[0]
    # Determine if a new plant just grew (stage reached 4 this call)
    prev_stage_resp = (
        db.table("garden_stats")
        .select("current_plant_stage")
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )
    current_stage = row.get("current_plant_stage", 0)
    # plant_just_grew = stage is now 4 and it wasn't before (best-effort)
    plant_just_grew = current_stage == 4 and row.get("is_new_day", False)

    return BookshelfRecordResponse(
        current_streak=row["current_streak"],
        longest_streak=row["longest_streak"],
        current_plant_stage=current_stage,
        is_new_day=row.get("is_new_day", False),
        plant_just_grew=plant_just_grew,
    )

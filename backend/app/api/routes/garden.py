from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user_id
from app.db.client import get_supabase
from app.db.schemas import GardenRecordRequest, GardenRecordResponse, GardenStats

router = APIRouter(prefix="/garden", tags=["garden"])

UserID = Annotated[uuid.UUID, Depends(get_current_user_id)]


@router.get("", response_model=GardenStats)
async def get_garden(user_id: UserID) -> GardenStats:
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
                    "code": "GARDEN_NOT_FOUND",
                    "message": "Garden stats not found for this user",
                    "details": {},
                }
            },
        )
    return GardenStats(**resp.data)


@router.post("/record", response_model=GardenRecordResponse)
async def record_study(body: GardenRecordRequest, user_id: UserID) -> GardenRecordResponse:
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
                    "code": "GARDEN_RPC_FAILED",
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

    return GardenRecordResponse(
        current_streak=row["current_streak"],
        longest_streak=row["longest_streak"],
        current_plant_stage=current_stage,
        is_new_day=row.get("is_new_day", False),
        plant_just_grew=plant_just_grew,
    )

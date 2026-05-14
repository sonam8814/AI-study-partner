from __future__ import annotations

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

Mode = Literal["peer", "tutor", "examiner", "feynman"]


# ── Materials ──────────────────────────────────────────────────────────────────

class Material(BaseModel):
    id: UUID
    user_id: UUID
    title: str = Field(min_length=1, max_length=200)
    markdown_content: str
    tags: list[str] = []
    word_count: int
    last_studied_at: datetime | None = None
    is_indexed: bool
    created_at: datetime
    updated_at: datetime


class MaterialCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    markdown_content: str = ""
    tags: list[str] = []


class MaterialUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    markdown_content: str | None = None
    tags: list[str] | None = None


class MaterialListResponse(BaseModel):
    items: list[Material]
    total: int


# ── Chat ───────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    material_id: UUID | None = None
    session_id: UUID | None = None
    mode: Mode
    message: str = Field(min_length=1, max_length=4000)
    stream: bool = True


class Citation(BaseModel):
    index: int = Field(ge=1)
    chunk_id: UUID
    material_id: UUID
    char_start: int
    char_end: int
    section: str | None = None
    similarity: float


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    citations: list[Citation] = []
    timestamp: datetime
    mode: Mode


class StudySession(BaseModel):
    id: UUID
    user_id: UUID
    material_id: UUID | None
    mode: Mode
    messages: list[dict]
    started_at: datetime
    last_active_at: datetime


# ── Feynman ────────────────────────────────────────────────────────────────────

class FeynmanPromptRequest(BaseModel):
    material_id: UUID
    session_id: UUID | None = None


class FeynmanPromptResponse(BaseModel):
    concept: str
    prompt: str
    session_id: UUID


class FeynmanCritiqueRequest(BaseModel):
    session_id: UUID
    concept: str
    user_explanation: str = Field(min_length=1, max_length=8000)


# ── Weak Spots ─────────────────────────────────────────────────────────────────

class WeakSpot(BaseModel):
    id: UUID
    user_id: UUID
    material_id: UUID | None
    topic: str
    description: str | None
    miss_count: int
    last_missed_at: datetime
    resolved: bool
    resolved_at: datetime | None
    created_at: datetime


class WeakSpotCreate(BaseModel):
    material_id: UUID | None = None
    topic: str = Field(min_length=1, max_length=200)
    description: str | None = None


class WeakSpotUpdate(BaseModel):
    resolved: bool


class WeakSpotListResponse(BaseModel):
    items: list[WeakSpot]
    total: int


# ── Bookshelf ──────────────────────────────────────────────────────────────────

class BookshelfStats(BaseModel):
    user_id: UUID
    current_streak: int
    longest_streak: int
    total_study_days: int
    total_minutes_studied: int
    last_study_date: date | None
    current_plant_stage: int = Field(ge=0, le=4)
    plants_grown_total: int
    garden_layout: list[dict]
    monthly_study_dates: list[str] = []
    updated_at: datetime


class BookshelfRecordRequest(BaseModel):
    minutes_studied: int = Field(default=0, ge=0)


class BookshelfRecordResponse(BaseModel):
    current_streak: int
    longest_streak: int
    current_plant_stage: int
    is_new_day: bool
    plant_just_grew: bool


# ── Errors ─────────────────────────────────────────────────────────────────────

class ApiError(BaseModel):
    code: str
    message: str
    details: dict = {}


class ApiErrorResponse(BaseModel):
    error: ApiError
    request_id: str

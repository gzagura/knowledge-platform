from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    provider: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    avatar_url: Optional[str] = None
    preferred_language: str
    ui_language: str
    preferred_reading_time: int
    theme: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    preferred_language: Optional[str] = None
    ui_language: Optional[str] = None
    preferred_reading_time: Optional[int] = Field(None, ge=1, le=60)
    theme: Optional[str] = None
    name: Optional[str] = None


class InterestsUpdate(BaseModel):
    interests: list[str] = Field(..., min_items=1)

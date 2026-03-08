from typing import Optional, Literal
from uuid import UUID
from pydantic import BaseModel


class ArticleCardResponse(BaseModel):
    id: UUID
    wikipedia_id: int
    title: str
    extract: str
    category: Optional[str] = None
    reading_time_minutes: int
    is_featured: bool
    image_url: Optional[str] = None
    language: str
    is_liked: bool = False
    is_bookmarked: bool = False
    fun_fact: Optional[str] = None

    class Config:
        from_attributes = True


class ArticleFullResponse(ArticleCardResponse):
    full_content: Optional[str] = None


class ArticleFeedbackRequest(BaseModel):
    feedback: Literal["like", "not_interested"]


class ShareRequest(BaseModel):
    platform: str

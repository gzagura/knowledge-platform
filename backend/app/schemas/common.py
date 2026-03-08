from typing import Optional, TypeVar, Generic
from pydantic import BaseModel, Field

T = TypeVar("T")


class CursorParams(BaseModel):
    cursor: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=100)


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    next_cursor: Optional[str] = None
    has_more: bool

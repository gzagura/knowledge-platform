from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Bookmark, ArticleCache
from app.schemas.article import ArticleCardResponse

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


class BookmarkRequest(BaseModel):
    article_id: UUID
    bookmarked: Optional[bool] = True


@router.get("")
async def list_bookmarks(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = UUID(current_user.get("sub"))

    stmt = (
        select(Bookmark)
        .where(Bookmark.user_id == user_id)
        .order_by(Bookmark.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    bookmarks = result.scalars().all()

    article_ids = [b.article_id for b in bookmarks]
    if article_ids:
        stmt = select(ArticleCache).where(ArticleCache.id.in_(article_ids))
        result = await db.execute(stmt)
        articles = result.scalars().all()
    else:
        articles = []

    items = [
        ArticleCardResponse(
            id=a.id,
            wikipedia_id=a.wikipedia_id,
            title=a.title,
            extract=a.extract,
            category=a.category,
            reading_time_minutes=a.reading_time_minutes,
            is_featured=a.is_featured,
            image_url=a.image_url,
            language=a.language,
            is_liked=False,
            is_bookmarked=True,
            fun_fact=None,
        )
        for a in articles
    ]

    return {"items": [i.model_dump() for i in items], "total": len(items)}


@router.post("")
async def add_bookmark(
    body: BookmarkRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Add or remove bookmark. Pass bookmarked=false to remove."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = UUID(current_user.get("sub"))
    article_id = body.article_id

    # Check article exists
    stmt = select(ArticleCache).where(ArticleCache.id == article_id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    # Check existing bookmark
    stmt = select(Bookmark).where(
        (Bookmark.user_id == user_id) & (Bookmark.article_id == article_id)
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    # Handle remove case
    if not body.bookmarked:
        if existing:
            await db.delete(existing)
            await db.commit()
        return {"bookmarked": False}

    # Add bookmark if not exists
    if existing:
        return {"bookmarked": True}

    db.add(Bookmark(user_id=user_id, article_id=article_id))
    await db.commit()
    return {"bookmarked": True}


@router.delete("/{article_id}")
async def remove_bookmark(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = UUID(current_user.get("sub"))
    stmt = select(Bookmark).where(
        (Bookmark.user_id == user_id) & (Bookmark.article_id == article_id)
    )
    result = await db.execute(stmt)
    bookmark = result.scalar_one_or_none()

    if not bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found",
        )

    await db.delete(bookmark)
    await db.commit()
    return {"bookmarked": False}

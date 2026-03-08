from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Bookmark, ArticleCache
from app.schemas.article import ArticleCardResponse

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("")
async def list_bookmarks(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """List user's bookmarks."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))

    # Get user's bookmarks
    stmt = (
        select(Bookmark)
        .where(Bookmark.user_id == user_id)
        .order_by(Bookmark.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    bookmarks = result.scalars().all()

    # Get article details
    article_ids = [b.article_id for b in bookmarks]
    if article_ids:
        stmt = select(ArticleCache).where(ArticleCache.id.in_(article_ids))
        result = await db.execute(stmt)
        articles = result.scalars().all()
    else:
        articles = []

    items = [
        ArticleCardResponse(
            id=article.id,
            wikipedia_id=article.wikipedia_id,
            title=article.title,
            extract=article.extract,
            category=article.category,
            reading_time_minutes=article.reading_time_minutes,
            is_featured=article.is_featured,
            image_url=article.image_url,
            language=article.language,
            is_liked=False,
            is_bookmarked=True,
            fun_fact=None,
        )
        for article in articles
    ]

    return {
        "items": items,
        "total": len(items),
    }


@router.post("")
async def add_bookmark(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Add article to bookmarks."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))

    # Check if article exists
    stmt = select(ArticleCache).where(ArticleCache.id == article_id)
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    # Check if already bookmarked
    stmt = select(Bookmark).where(
        (Bookmark.user_id == user_id) & (Bookmark.article_id == article_id)
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article already bookmarked",
        )

    # Add bookmark
    bookmark = Bookmark(user_id=user_id, article_id=article_id)
    db.add(bookmark)
    await db.commit()

    return {"message": "Article bookmarked", "bookmark_id": str(bookmark.id)}


@router.delete("/{article_id}")
async def remove_bookmark(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Remove article from bookmarks."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))

    # Find and delete bookmark
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

    return {"message": "Bookmark removed"}

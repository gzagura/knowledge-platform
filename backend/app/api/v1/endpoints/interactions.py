from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import ArticleCache, ArticleLike, ArticleFeedback, ArticleShare
from app.schemas.article import ShareRequest

router = APIRouter(prefix="/articles", tags=["interactions"])


async def get_article_or_404(article_id: UUID, db: AsyncSession) -> ArticleCache:
    stmt = select(ArticleCache).where(ArticleCache.id == article_id)
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


@router.post("/{article_id}/like")
async def toggle_like(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Toggle like — returns liked: true/false."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = UUID(current_user.get("sub"))
    await get_article_or_404(article_id, db)

    stmt = select(ArticleLike).where(
        (ArticleLike.user_id == user_id) & (ArticleLike.article_id == article_id)
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"liked": False}

    db.add(ArticleLike(user_id=user_id, article_id=article_id))
    await db.commit()
    return {"liked": True}


@router.delete("/{article_id}/like")
async def unlike_article(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = UUID(current_user.get("sub"))
    stmt = select(ArticleLike).where(
        (ArticleLike.user_id == user_id) & (ArticleLike.article_id == article_id)
    )
    result = await db.execute(stmt)
    like = result.scalar_one_or_none()
    if like:
        await db.delete(like)
        await db.commit()
    return {"liked": False}


@router.post("/{article_id}/not-interested")
async def mark_not_interested(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Mark as not interesting. No request body needed."""
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = UUID(current_user.get("sub"))
    await get_article_or_404(article_id, db)

    stmt = select(ArticleFeedback).where(
        (ArticleFeedback.user_id == user_id) & (ArticleFeedback.article_id == article_id)
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        existing.feedback = "not_interested"
        db.add(existing)
    else:
        db.add(ArticleFeedback(user_id=user_id, article_id=article_id, feedback="not_interested"))

    await db.commit()
    return {"message": "not_interested"}


@router.post("/{article_id}/share")
async def share_article(
    article_id: UUID,
    request: ShareRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = UUID(current_user.get("sub"))
    await get_article_or_404(article_id, db)

    share = ArticleShare(user_id=user_id, article_id=article_id, platform=request.platform)
    db.add(share)
    await db.commit()
    return {"share_id": str(share.id)}

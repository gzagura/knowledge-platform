from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import ArticleCache, ArticleLike, ArticleFeedback, ArticleShare
from app.schemas.article import ArticleFeedbackRequest, ShareRequest

router = APIRouter(prefix="/articles", tags=["interactions"])


async def get_article_or_404(article_id: UUID, db: AsyncSession) -> ArticleCache:
    """Helper to get article or raise 404."""
    stmt = select(ArticleCache).where(ArticleCache.id == article_id)
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )
    return article


@router.post("/{article_id}/like")
async def like_article(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Toggle like on article (or add like)."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))
    article = await get_article_or_404(article_id, db)

    # Check if already liked
    stmt = select(ArticleLike).where(
        (ArticleLike.user_id == user_id) & (ArticleLike.article_id == article_id)
    )
    result = await db.execute(stmt)
    existing_like = result.scalar_one_or_none()

    if existing_like:
        await db.delete(existing_like)
        await db.commit()
        return {"message": "Like removed"}

    # Add new like
    like = ArticleLike(user_id=user_id, article_id=article_id)
    db.add(like)
    await db.commit()

    return {"message": "Article liked"}


@router.delete("/{article_id}/like")
async def unlike_article(
    article_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Remove like from article."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))
    article = await get_article_or_404(article_id, db)

    # Find and delete like
    stmt = select(ArticleLike).where(
        (ArticleLike.user_id == user_id) & (ArticleLike.article_id == article_id)
    )
    result = await db.execute(stmt)
    like = result.scalar_one_or_none()

    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found",
        )

    await db.delete(like)
    await db.commit()

    return {"message": "Like removed"}


@router.post("/{article_id}/not-interested")
async def mark_not_interested(
    article_id: UUID,
    request: ArticleFeedbackRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Mark article as not interesting."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))
    article = await get_article_or_404(article_id, db)

    # Check if feedback already exists
    stmt = select(ArticleFeedback).where(
        (ArticleFeedback.user_id == user_id)
        & (ArticleFeedback.article_id == article_id)
    )
    result = await db.execute(stmt)
    existing_feedback = result.scalar_one_or_none()

    if existing_feedback:
        existing_feedback.feedback = request.feedback
        db.add(existing_feedback)
    else:
        feedback = ArticleFeedback(
            user_id=user_id,
            article_id=article_id,
            feedback=request.feedback,
        )
        db.add(feedback)

    await db.commit()

    return {"message": f"Feedback recorded: {request.feedback}"}


@router.post("/{article_id}/share")
async def share_article(
    article_id: UUID,
    request: ShareRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Record article share event."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))
    article = await get_article_or_404(article_id, db)

    # Record share
    share = ArticleShare(
        user_id=user_id,
        article_id=article_id,
        platform=request.platform,
    )
    db.add(share)
    await db.commit()

    return {
        "message": f"Article shared to {request.platform}",
        "share_id": str(share.id),
    }

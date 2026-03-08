from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import ArticleCache, ArticleLike, Bookmark
from app.schemas.article import ArticleCardResponse, ArticleFullResponse
from app.services.recommendation import RecommendationEngine
from app.services.wikipedia import WikipediaClient
from app.services.article_processor import calculate_reading_time, extract_fun_fact

router = APIRouter(prefix="/articles", tags=["articles"])

# Global Wikipedia client
wikipedia_client = WikipediaClient()


@router.get("/feed")
async def get_feed(
    mode: str = Query("explore", regex="^(explore|deepen)$"),
    reading_time: int = Query(5, ge=1, le=60),
    lang: str = Query("en", regex="^(en|uk|ru)$"),
    limit: int = Query(10, ge=1, le=100),
    cursor: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Get personalized article feed.
    Works for authenticated and anonymous users.
    """
    user_id = None
    if current_user:
        user_id = UUID(current_user.get("sub"))

    engine = RecommendationEngine()
    return await engine.get_feed(
        user_id=user_id,
        lang=lang,
        mode=mode,
        reading_time=reading_time,
        cursor=cursor,
        limit=limit,
        db=db,
    )


@router.get("/random")
async def get_random_articles(
    lang: str = Query("en", regex="^(en|uk|ru)$"),
    count: int = Query(5, ge=1, le=50),
) -> dict:
    """Get random Wikipedia articles."""
    articles = await wikipedia_client.get_random_articles(lang=lang, count=count)

    return {
        "items": articles,
        "total": len(articles),
    }


@router.get("/{article_id}", response_model=ArticleFullResponse)
async def get_article(
    article_id: UUID,
    current_user: Optional[dict] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get full article details."""
    stmt = select(ArticleCache).where(ArticleCache.id == article_id)
    result = await db.execute(stmt)
    article = result.scalar_one_or_none()

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    # Check if liked and bookmarked
    is_liked = False
    is_bookmarked = False
    if current_user:
        user_id = UUID(current_user.get("sub"))

        like_stmt = select(ArticleLike).where(
            (ArticleLike.user_id == user_id) & (ArticleLike.article_id == article_id)
        )
        like_result = await db.execute(like_stmt)
        is_liked = like_result.scalar_one_or_none() is not None

        bookmark_stmt = select(Bookmark).where(
            (Bookmark.user_id == user_id) & (Bookmark.article_id == article_id)
        )
        bookmark_result = await db.execute(bookmark_stmt)
        is_bookmarked = bookmark_result.scalar_one_or_none() is not None

    fun_fact = extract_fun_fact(article.extract)

    return ArticleFullResponse(
        id=article.id,
        wikipedia_id=article.wikipedia_id,
        title=article.title,
        extract=article.extract,
        full_content=article.full_content,
        category=article.category,
        reading_time_minutes=article.reading_time_minutes,
        is_featured=article.is_featured,
        image_url=article.image_url,
        language=article.language,
        is_liked=is_liked,
        is_bookmarked=is_bookmarked,
        fun_fact=fun_fact,
    )

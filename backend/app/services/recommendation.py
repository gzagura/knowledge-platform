import random
from uuid import UUID
from typing import Optional
from sqlalchemy import select, and_, not_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    ArticleCache,
    UserInterest,
    ReadingHistory,
    ArticleFeedback,
)
from app.schemas.common import PaginatedResponse
from app.schemas.article import ArticleCardResponse


class RecommendationEngine:
    """Recommendation engine for article feed."""

    async def get_feed(
        self,
        user_id: Optional[UUID],
        lang: str,
        mode: str = "explore",
        reading_time: int = 5,
        cursor: Optional[str] = None,
        limit: int = 10,
        db: AsyncSession = None,
    ) -> dict:
        """
        Get personalized article feed.

        Args:
            user_id: Current user ID (None for anonymous)
            lang: Language code (en, uk, ru)
            mode: "explore" (mix) or "deepen" (focused on interests)
            reading_time: Preferred reading time in minutes
            cursor: Pagination cursor
            limit: Number of articles to return
            db: Database session

        Returns:
            PaginatedResponse with article cards
        """
        if not db:
            return {"items": [], "next_cursor": None, "has_more": False}

        # Get user interests if authenticated
        user_interests = []
        if user_id:
            stmt = select(UserInterest.category_name).where(
                UserInterest.user_id == user_id
            )
            result = await db.execute(stmt)
            user_interests = [row[0] for row in result.fetchall()]

        # Get articles to exclude
        excluded_article_ids = set()
        if user_id:
            # Get already-read articles
            stmt = select(ReadingHistory.article_id).where(
                ReadingHistory.user_id == user_id
            )
            result = await db.execute(stmt)
            excluded_article_ids.update(row[0] for row in result.fetchall())

            # Get not-interested articles
            stmt = select(ArticleFeedback.article_id).where(
                and_(
                    ArticleFeedback.user_id == user_id,
                    ArticleFeedback.feedback == "not_interested",
                )
            )
            result = await db.execute(stmt)
            excluded_article_ids.update(row[0] for row in result.fetchall())

        # Build base query
        query = select(ArticleCache).where(ArticleCache.language == lang)

        if excluded_article_ids:
            query = query.where(not_(ArticleCache.id.in_(excluded_article_ids)))

        # Filter by reading time (±2 minutes tolerance)
        query = query.where(
            ArticleCache.reading_time_minutes.between(
                max(1, reading_time - 2), reading_time + 2
            )
        )

        # Filter by interests if available
        if user_interests:
            if mode == "explore":
                # 70% from interests, 30% random
                interest_query = query.where(
                    ArticleCache.category.in_(user_interests)
                ).order_by(ArticleCache.is_featured.desc(), func.random())

                random_query = query.where(
                    ~ArticleCache.category.in_(user_interests)
                ).order_by(ArticleCache.is_featured.desc(), func.random())

                result_interest = await db.execute(
                    interest_query.limit(int(limit * 0.7))
                )
                articles_interest = [row[0] for row in result_interest.fetchall()]

                result_random = await db.execute(
                    random_query.limit(int(limit * 0.3))
                )
                articles_random = [row[0] for row in result_random.fetchall()]

                articles = articles_interest + articles_random
            else:
                # mode == "deepen": 100% from interests
                query = query.where(ArticleCache.category.in_(user_interests))
                result = await db.execute(
                    query.order_by(ArticleCache.is_featured.desc(), func.random()).limit(
                        limit
                    )
                )
                articles = [row[0] for row in result.fetchall()]
        else:
            # No interests: return random articles
            result = await db.execute(
                query.order_by(ArticleCache.is_featured.desc(), func.random()).limit(
                    limit
                )
            )
            articles = [row[0] for row in result.fetchall()]

        # Get user's likes and bookmarks
        user_likes = set()
        user_bookmarks = set()
        if user_id:
            from app.models import ArticleLike, Bookmark

            stmt = select(ArticleLike.article_id).where(ArticleLike.user_id == user_id)
            result = await db.execute(stmt)
            user_likes = {row[0] for row in result.fetchall()}

            stmt = select(Bookmark.article_id).where(Bookmark.user_id == user_id)
            result = await db.execute(stmt)
            user_bookmarks = {row[0] for row in result.fetchall()}

        # Build response with article cards
        items = []
        for article in articles:
            card = ArticleCardResponse(
                id=article.id,
                wikipedia_id=article.wikipedia_id,
                title=article.title,
                extract=article.extract,
                category=article.category,
                reading_time_minutes=article.reading_time_minutes,
                is_featured=article.is_featured,
                image_url=article.image_url,
                language=article.language,
                is_liked=article.id in user_likes,
                is_bookmarked=article.id in user_bookmarks,
                fun_fact=None,  # Will be populated separately if needed
            )
            items.append(card)

        # Generate next cursor
        next_cursor = None
        has_more = False
        if len(articles) == limit:
            next_cursor = articles[-1].id.hex if articles else None
            has_more = True

        return {
            "items": items,
            "next_cursor": next_cursor,
            "has_more": has_more,
        }

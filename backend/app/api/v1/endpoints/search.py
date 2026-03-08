from fastapi import APIRouter, Query
from app.services.wikipedia import WikipediaClient

router = APIRouter(prefix="/search", tags=["search"])

# Global Wikipedia client
wikipedia_client = WikipediaClient()


@router.get("")
async def search_articles(
    q: str = Query(..., min_length=1, max_length=200),
    lang: str = Query("en", regex="^(en|uk|ru)$"),
    limit: int = Query(10, ge=1, le=50),
) -> dict:
    """Search Wikipedia articles."""
    articles = await wikipedia_client.search_articles(
        query=q,
        lang=lang,
        limit=limit,
    )

    return {
        "query": q,
        "items": articles,
        "total": len(articles),
        "language": lang,
    }

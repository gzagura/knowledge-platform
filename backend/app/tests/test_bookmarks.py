"""
Tests for the bookmark endpoints.

Covers:
- POST /api/v1/bookmarks    — authenticated user can add a bookmark (200, bookmarked=true)
- GET  /api/v1/bookmarks    — authenticated user can list bookmarks; added bookmark appears
- DELETE /api/v1/bookmarks/{article_id} — owner can delete their own bookmark (200)
- DELETE /api/v1/bookmarks/{article_id} — user B cannot delete user A's bookmark (404)
- POST /api/v1/bookmarks    — unauthenticated request returns 401
- GET  /api/v1/bookmarks    — unauthenticated request returns 401
- POST /api/v1/bookmarks    — bookmarking a non-existent article returns 404
- POST /api/v1/bookmarks (idempotent) — bookmarking the same article twice returns bookmarked=true

The bookmark endpoints require an article to exist in article_cache.  We seed
one article before each test via a session-scoped helper.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator

import httpx
import pytest
import pytest_asyncio
from sqlalchemy import text

from app.models.article import ArticleCache
from app.tests.conftest import TestSessionLocal, auth_headers, register_user

# FK-safe cleanup order: child rows before parent rows.
_CLEANUP_ORDER = [
    "bookmarks",
    "article_likes",
    "article_feedback",
    "reading_history",
    "article_shares",
    "user_interests",
    "article_cache",
    "users",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_article(index: int = 0) -> ArticleCache:
    return ArticleCache(
        id=uuid.uuid4(),
        wikipedia_id=9000 + index,
        title=f"Bookmark Test Article {index}",
        extract="Some extract text.",
        full_content=None,
        language="en",
        category="History",
        reading_time_minutes=5,
        is_featured=False,
        image_url=None,
    )


@pytest_asyncio.fixture()
async def seeded_article() -> AsyncGenerator[ArticleCache, None]:
    """
    Insert a single article and yield the ORM object.

    The session is closed before yielding so the StaticPool connection is
    free for endpoint requests made within the test body.
    """
    article = _make_article()
    async with TestSessionLocal() as session:
        session.add(article)
        await session.commit()
        # Capture the generated UUID while the session is still open.
        article_id = article.id
        article_title = article.title

    # Build a detached object to pass to the test (session is closed).
    detached = ArticleCache(
        id=article_id,
        wikipedia_id=9000,
        title=article_title,
        extract="Some extract text.",
        full_content=None,
        language="en",
        category="History",
        reading_time_minutes=5,
        is_featured=False,
        image_url=None,
    )
    yield detached

    async with TestSessionLocal() as session:
        for table in _CLEANUP_ORDER:
            await session.execute(text(f"DELETE FROM {table}"))
        await session.commit()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_add_bookmark_returns_bookmarked_true(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """An authenticated user can bookmark an article; response contains bookmarked=true."""
    token, _ = await register_user(async_client, email="bm_add@example.com")

    response = await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
        json={"article_id": str(seeded_article.id)},
    )
    assert response.status_code == 200, response.text
    assert response.json()["bookmarked"] is True


@pytest.mark.asyncio
async def test_list_bookmarks_contains_added_article(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """After bookmarking an article, it must appear in GET /api/v1/bookmarks."""
    token, _ = await register_user(async_client, email="bm_list@example.com")

    # Add bookmark
    add_resp = await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
        json={"article_id": str(seeded_article.id)},
    )
    assert add_resp.status_code == 200, add_resp.text

    # List bookmarks
    list_resp = await async_client.get(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
    )
    assert list_resp.status_code == 200, list_resp.text
    data = list_resp.json()
    assert "items" in data
    assert data["total"] >= 1
    article_ids_in_response = [item["id"] for item in data["items"]]
    assert str(seeded_article.id) in article_ids_in_response


@pytest.mark.asyncio
async def test_delete_own_bookmark_succeeds(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """An authenticated user can delete their own bookmark; response is 200 bookmarked=false."""
    token, _ = await register_user(async_client, email="bm_del@example.com")

    # Add
    await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
        json={"article_id": str(seeded_article.id)},
    )

    # Delete
    del_resp = await async_client.delete(
        f"/api/v1/bookmarks/{seeded_article.id}",
        headers=auth_headers(token),
    )
    assert del_resp.status_code == 200, del_resp.text
    assert del_resp.json()["bookmarked"] is False


@pytest.mark.asyncio
async def test_delete_after_delete_returns_404(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """Deleting the same bookmark twice must return 404 on the second attempt."""
    token, _ = await register_user(async_client, email="bm_del2@example.com")

    await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
        json={"article_id": str(seeded_article.id)},
    )
    first_del = await async_client.delete(
        f"/api/v1/bookmarks/{seeded_article.id}",
        headers=auth_headers(token),
    )
    assert first_del.status_code == 200

    second_del = await async_client.delete(
        f"/api/v1/bookmarks/{seeded_article.id}",
        headers=auth_headers(token),
    )
    assert second_del.status_code == 404, second_del.text


@pytest.mark.asyncio
async def test_delete_other_users_bookmark_returns_404(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """User B must not be able to delete a bookmark created by user A (HTTP 404)."""
    # User A creates a bookmark
    token_a, _ = await register_user(async_client, email="bm_userA@example.com")
    await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token_a),
        json={"article_id": str(seeded_article.id)},
    )

    # User B tries to delete user A's bookmark
    token_b, _ = await register_user(async_client, email="bm_userB@example.com")
    response = await async_client.delete(
        f"/api/v1/bookmarks/{seeded_article.id}",
        headers=auth_headers(token_b),
    )
    assert response.status_code == 404, response.text


@pytest.mark.asyncio
async def test_add_bookmark_unauthenticated_returns_401(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """An unauthenticated POST /api/v1/bookmarks must return HTTP 401."""
    response = await async_client.post(
        "/api/v1/bookmarks",
        json={"article_id": str(seeded_article.id)},
    )
    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_list_bookmarks_unauthenticated_returns_401(
    async_client: httpx.AsyncClient,
) -> None:
    """An unauthenticated GET /api/v1/bookmarks must return HTTP 401."""
    response = await async_client.get("/api/v1/bookmarks")
    assert response.status_code == 401, response.text


@pytest.mark.asyncio
async def test_bookmark_nonexistent_article_returns_404(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """Bookmarking an article_id that does not exist in article_cache must return 404."""
    token, _ = await register_user(async_client, email="bm_notfound@example.com")

    fake_article_id = str(uuid.uuid4())
    response = await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
        json={"article_id": fake_article_id},
    )
    assert response.status_code == 404, response.text


@pytest.mark.asyncio
async def test_add_bookmark_idempotent(
    async_client: httpx.AsyncClient,
    seeded_article: ArticleCache,
) -> None:
    """Bookmarking the same article twice must not raise an error; second call returns bookmarked=true."""
    token, _ = await register_user(async_client, email="bm_idem@example.com")

    r1 = await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
        json={"article_id": str(seeded_article.id)},
    )
    r2 = await async_client.post(
        "/api/v1/bookmarks",
        headers=auth_headers(token),
        json={"article_id": str(seeded_article.id)},
    )
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r2.json()["bookmarked"] is True

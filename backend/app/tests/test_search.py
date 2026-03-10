"""
Tests for the search endpoint.

Covers:
- GET /api/v1/search?q=science — returns HTTP 200 with { query, items, total, language }
- GET /api/v1/search?q=science&lang=en — lang parameter forwarded correctly
- GET /api/v1/search — missing q parameter returns HTTP 422
- GET /api/v1/search?q= — empty string returns HTTP 422 (min_length=1 on q)
- GET /api/v1/search?q=history&lang=fr — unsupported lang returns HTTP 422

The search endpoint delegates to WikipediaClient.search_articles() which makes
real HTTP calls to Wikipedia.  We patch it with a deterministic mock so the
tests are fast, isolated, and pass offline.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import httpx
import pytest

# Fake search results returned by the mocked WikipediaClient
_FAKE_RESULTS: list[dict] = [
    {"id": 101, "title": "Science", "extract": "Science is a systematic...", "language": "en"},
    {"id": 202, "title": "History", "extract": "History is the study of...", "language": "en"},
]


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_search_valid_query_returns_200_and_correct_shape(
    async_client: httpx.AsyncClient,
) -> None:
    """A valid ?q=science request must return HTTP 200 with the expected fields."""
    with patch(
        "app.api.v1.endpoints.search.wikipedia_client.search_articles",
        new_callable=AsyncMock,
        return_value=_FAKE_RESULTS,
    ):
        response = await async_client.get("/api/v1/search", params={"q": "science"})

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["query"] == "science"
    assert isinstance(data["items"], list)
    assert isinstance(data["total"], int)
    assert data["total"] == len(data["items"])
    assert "language" in data


@pytest.mark.asyncio
async def test_search_returns_items_from_wikipedia_client(
    async_client: httpx.AsyncClient,
) -> None:
    """The items in the response must match what WikipediaClient returns."""
    with patch(
        "app.api.v1.endpoints.search.wikipedia_client.search_articles",
        new_callable=AsyncMock,
        return_value=_FAKE_RESULTS,
    ):
        response = await async_client.get("/api/v1/search", params={"q": "history"})

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total"] == 2
    assert data["items"][0]["title"] == "Science"
    assert data["items"][1]["title"] == "History"


@pytest.mark.asyncio
async def test_search_default_language_is_en(
    async_client: httpx.AsyncClient,
) -> None:
    """When no lang is specified, the response language must default to 'en'."""
    with patch(
        "app.api.v1.endpoints.search.wikipedia_client.search_articles",
        new_callable=AsyncMock,
        return_value=_FAKE_RESULTS,
    ):
        response = await async_client.get("/api/v1/search", params={"q": "science"})

    assert response.status_code == 200, response.text
    assert response.json()["language"] == "en"


@pytest.mark.asyncio
async def test_search_lang_parameter_forwarded(
    async_client: httpx.AsyncClient,
) -> None:
    """The lang query parameter must be passed through and appear in the response."""
    with patch(
        "app.api.v1.endpoints.search.wikipedia_client.search_articles",
        new_callable=AsyncMock,
        return_value=[],
    ) as mock_search:
        response = await async_client.get(
            "/api/v1/search", params={"q": "nauka", "lang": "uk"}
        )

    assert response.status_code == 200, response.text
    assert response.json()["language"] == "uk"
    # The client was called with the correct lang
    mock_search.assert_awaited_once()
    call_kwargs = mock_search.call_args.kwargs
    assert call_kwargs.get("lang") == "uk"


@pytest.mark.asyncio
async def test_search_empty_results_still_valid(
    async_client: httpx.AsyncClient,
) -> None:
    """A valid query that returns no results must still return HTTP 200 with total=0."""
    with patch(
        "app.api.v1.endpoints.search.wikipedia_client.search_articles",
        new_callable=AsyncMock,
        return_value=[],
    ):
        response = await async_client.get("/api/v1/search", params={"q": "xyzzy12345"})

    assert response.status_code == 200, response.text
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_search_missing_q_returns_422(
    async_client: httpx.AsyncClient,
) -> None:
    """GET /api/v1/search without q must return HTTP 422."""
    response = await async_client.get("/api/v1/search")
    assert response.status_code == 422, response.text


@pytest.mark.asyncio
async def test_search_empty_string_q_returns_422(
    async_client: httpx.AsyncClient,
) -> None:
    """GET /api/v1/search?q= (empty string) must return HTTP 422 due to min_length=1."""
    response = await async_client.get("/api/v1/search", params={"q": ""})
    assert response.status_code == 422, response.text


@pytest.mark.asyncio
async def test_search_unsupported_lang_returns_422(
    async_client: httpx.AsyncClient,
) -> None:
    """An unsupported lang value (e.g. 'fr') must be rejected with HTTP 422."""
    response = await async_client.get("/api/v1/search", params={"q": "science", "lang": "fr"})
    assert response.status_code == 422, response.text

"""
Tests for the authentication endpoints.

Covers:
- POST /api/v1/auth/register — happy path: 201, access_token, user object
- POST /api/v1/auth/register — duplicate email returns 400
- POST /api/v1/auth/login   — valid credentials returns 200 with token and user
- POST /api/v1/auth/login   — same credentials twice returns the same user (no duplicate)
- POST /api/v1/auth/login   — wrong password returns 401
- POST /api/v1/auth/login   — missing email field returns 422 (Pydantic validation)
- GET  /api/v1/auth/me      — authenticated request returns user object
- GET  /api/v1/auth/me      — unauthenticated request returns 401
"""

from __future__ import annotations

import httpx
import pytest

from app.tests.conftest import auth_headers, register_user


@pytest.mark.asyncio
async def test_register_new_user_returns_token_and_user(
    async_client: httpx.AsyncClient,
) -> None:
    """A brand-new registration must return HTTP 201 with token and user fields."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "alice@example.com",
            "password": "password123",
            "name": "Alice",
        },
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["name"] == "Alice"
    assert "id" in data["user"]


@pytest.mark.asyncio
async def test_register_duplicate_email_returns_400(
    async_client: httpx.AsyncClient,
) -> None:
    """Registering with an already-used email must return HTTP 400."""
    payload = {
        "email": "bob@example.com",
        "password": "password123",
        "name": "Bob",
    }
    first = await async_client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = await async_client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 400


@pytest.mark.asyncio
async def test_login_valid_credentials_returns_token_and_user(
    async_client: httpx.AsyncClient,
) -> None:
    """Logging in with correct credentials must return HTTP 200 with token and user."""
    # First register so the user exists
    await register_user(async_client, email="carol@example.com", password="mypassword")

    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "carol@example.com", "password": "mypassword"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "carol@example.com"


@pytest.mark.asyncio
async def test_login_same_credentials_twice_returns_same_user(
    async_client: httpx.AsyncClient,
) -> None:
    """Two logins with the same credentials must return the same user ID — no duplicate row."""
    await register_user(async_client, email="dave@example.com", password="pass1234")

    r1 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "dave@example.com", "password": "pass1234"},
    )
    r2 = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "dave@example.com", "password": "pass1234"},
    )

    assert r1.status_code == 200
    assert r2.status_code == 200
    # Same user ID — no duplicate was created
    assert r1.json()["user"]["id"] == r2.json()["user"]["id"]


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(
    async_client: httpx.AsyncClient,
) -> None:
    """Logging in with an incorrect password must return HTTP 401."""
    await register_user(async_client, email="eve@example.com", password="correctpass")

    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "eve@example.com", "password": "wrongpass"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_missing_email_returns_422(
    async_client: httpx.AsyncClient,
) -> None:
    """A login body that omits the email field must be rejected with HTTP 422."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"password": "somepassword"},
    )
    assert response.status_code == 422
    # Pydantic validation error detail must mention the missing field
    detail = response.json()["detail"]
    assert any("email" in str(err).lower() for err in detail)


@pytest.mark.asyncio
async def test_login_missing_password_returns_422(
    async_client: httpx.AsyncClient,
) -> None:
    """A login body that omits the password field must be rejected with HTTP 422."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "frank@example.com"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_me_authenticated_returns_user(
    async_client: httpx.AsyncClient,
) -> None:
    """GET /auth/me with a valid token must return the current user object."""
    token, user = await register_user(async_client, email="grace@example.com")

    response = await async_client.get(
        "/api/v1/auth/me",
        headers=auth_headers(token),
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "grace@example.com"
    assert data["id"] == user["id"]


@pytest.mark.asyncio
async def test_get_me_unauthenticated_returns_401(
    async_client: httpx.AsyncClient,
) -> None:
    """GET /auth/me without a token must return HTTP 401."""
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 401

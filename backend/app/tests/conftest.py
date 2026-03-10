"""
Test infrastructure for the Knowledge Platform backend.

Strategy (DEC-002):
- SQLite in-memory via aiosqlite for speed and zero external dependencies.
- Base.metadata.create_all() / drop_all() are used instead of Alembic migrations.
- The get_db FastAPI dependency is overridden so all requests hit the test DB.
- The WikipediaClient is patched so search/feed tests never hit the real network.

SQLite dialect note: the ORM models declare UUID columns using
sqlalchemy.dialects.postgresql.UUID.  SQLAlchemy maps this to CHAR(32) on
SQLite automatically, so create_all() works without any model changes.
However func.random() used in RecommendationEngine is a PostgreSQL-ism;
SQLite uses RANDOM() instead.  SQLAlchemy's func.random() emits the correct
function for whichever dialect is active, so no patching is required there.
"""

from __future__ import annotations

import pytest
import pytest_asyncio
from collections.abc import AsyncGenerator
from typing import Any  # noqa: F401 — used in register_user return type annotation

import httpx
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

# ---------------------------------------------------------------------------
# Test database engine — shared in-memory SQLite for the test session
#
# StaticPool is required: without it, SQLite in-memory databases are per-
# connection, so tables created on one connection are invisible to another.
# StaticPool forces all async sessions to reuse the same underlying
# connection, making all operations see the same in-memory state.
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ---------------------------------------------------------------------------
# Session-scoped fixture: create all tables once, drop them after the session
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture(scope="session", autouse=True, loop_scope="session")
async def create_test_tables() -> AsyncGenerator[None, None]:
    """Create all ORM tables before any test runs; drop them at the end."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# ---------------------------------------------------------------------------
# Function-scoped fixture: one session per test, rolled back after each test
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture()
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provide an AsyncSession that is rolled back after each test.

    Using a nested transaction (SAVEPOINT) keeps tests fully isolated even
    when the code under test calls db.commit().  Note: SQLite does not support
    SAVEPOINT over aiosqlite in all configurations, so we use a simpler but
    still safe approach: open a new session per test and delete all rows from
    every table in teardown instead of relying on rollback.
    """
    async with TestSessionLocal() as session:
        yield session
        # Clean up all rows so each test starts with a fresh state
        for table in reversed(Base.metadata.sorted_tables):
            await session.execute(table.delete())
        await session.commit()


# ---------------------------------------------------------------------------
# Override the get_db dependency to use the test session
# ---------------------------------------------------------------------------


async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = _override_get_db


# ---------------------------------------------------------------------------
# AsyncClient fixture — used by all endpoint tests
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture()
async def async_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """
    httpx.AsyncClient backed by the FastAPI ASGI app.

    The lifespan context (which runs Alembic migrations) is disabled by
    passing lifespan="auto" to ASGITransport — the app's lifespan still runs
    but _run_migrations() will gracefully swallow errors against SQLite,
    which is what we want.
    """
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        yield client


# ---------------------------------------------------------------------------
# Shared helper: register a user and return (token, user_data)
# ---------------------------------------------------------------------------


async def register_user(
    client: httpx.AsyncClient,
    email: str = "test@example.com",
    password: str = "securepassword",
    name: str = "Test User",
) -> tuple[str, dict[str, Any]]:
    """Register a user and return the access token and user dict."""
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "name": name},
    )
    assert response.status_code == 201, response.text
    data = response.json()
    return data["access_token"], data["user"]


def auth_headers(token: str) -> dict[str, str]:
    """Return Authorization header dict for a given bearer token."""
    return {"Authorization": f"Bearer {token}"}

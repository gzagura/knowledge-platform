# Story Template

## What Is a Story?

A Story represents a slice of user-visible value — something a real user (or the system on their behalf) can do, see, or benefit from once the work is delivered. Stories are the primary unit of planned work in a sprint. They are distinct from:

- **Tasks** (TASK-XXX): internal implementation work tracked in tasks.json
- **Bugs** (BUG-XXX): defects discovered after a feature ships or during QA
- **Chores**: refactors, config changes, or tooling that has no direct user impact

A Story may produce one or more Tasks. It is written from the perspective of the end user or the system, not the developer.

---

## Story: STORY-003

### Title
Backend critical-path endpoints have automated test coverage that runs in CI

### Type
`feature`

### Priority
`high`

### Status
`ready`

When status is `blocked`, populate the `blocked_by` field below.

### Blocked By
—

### Sprint
`sprint-1`

---

### User Story Statement

> As the **development team**, we want automated tests covering the backend's critical-path endpoints, so that regressions introduced by any future change are caught before they reach production.

---

### Context and Background

The backend is structurally complete with 20 endpoints across 6 modules and an Alembic-managed schema. However, `app/tests/__init__.py` is the only file in the test directory — there is zero test coverage. Sprint 1 identified two confirmed contract bugs (STORY-001, STORY-002) that were only found through manual review, not by any automated check. With the fixes from those stories landing on `main`, a test suite is immediately necessary to prevent regression. This story establishes the minimum viable test baseline: authentication, the feed endpoint, search, and the bookmark round-trip. It does not aim for full coverage — that is a follow-on sprint goal.

---

### Scope

**In scope:**
- pytest + pytest-asyncio + httpx.AsyncClient test infrastructure setup (`conftest.py`, async test database, override of `get_db` dependency)
- Tests for the authentication flow: `POST /api/v1/auth/login` (success, duplicate user creation returns same user, malformed body returns 422)
- Tests for the feed endpoint: `GET /api/v1/articles/feed` (anonymous access, authenticated access, cursor pagination round-trip, invalid cursor, `mode` and `lang` parameter handling)
- Tests for the search endpoint: `GET /api/v1/search` (valid query, empty query, missing `q` parameter returns 422)
- Tests for the bookmark round-trip: `POST /api/v1/bookmarks`, `GET /api/v1/bookmarks`, `DELETE /api/v1/bookmarks/{id}` (including attempting to delete another user's bookmark returns 404)
- A `pyproject.toml` or `pytest.ini` configuration that runs the suite with `pytest` from the `backend/` directory
- All tests must pass with an in-memory SQLite database (via `aiosqlite`) or a test PostgreSQL instance — the choice is left to the backend developer with a note below

**Out of scope:**
- 100% endpoint coverage — this story targets critical path only
- Tests for the Wikipedia client (requires mocking the external HTTP client; planned for Sprint 2)
- Tests for the recommendation engine algorithm in isolation (planned for Sprint 2)
- Performance or load tests
- Frontend tests (STORY-004)

---

### Functional Requirements

1. Running `pytest` from the `backend/` directory executes all tests in `app/tests/` and exits 0 when all pass.
2. The test suite uses an isolated test database that is created fresh for each test session and torn down afterwards — it does not touch the development or production database.
3. The `get_db` FastAPI dependency is overridden in tests to use the test database session.
4. Authentication tests verify: a new user is created and a JWT is returned on first login; the same credentials on a second call return the same user (no duplicate); a body missing `email` returns HTTP 422.
5. Feed tests verify: an anonymous request returns `{ items, next_cursor, has_more }` with correct types; an authenticated request returns the same shape; passing `cursor=<next_cursor>` from the first response as the cursor in a second request succeeds (HTTP 200); an unrecognised `cursor` value returns HTTP 422 or an empty page gracefully (not a 500).
6. Search tests verify: `GET /api/v1/search?q=science` returns HTTP 200 with `{ query, items, total, language }`; `GET /api/v1/search` without `q` returns HTTP 422.
7. Bookmark tests verify: an authenticated user can add a bookmark, retrieve it in the list, and delete it; attempting to delete a bookmark belonging to a different user returns HTTP 404.
8. All test functions are `async def` and decorated with `@pytest.mark.asyncio` (or the asyncio mode is set to `auto` in config).

---

### API Contract (if applicable)

No new or changed endpoints. This story adds tests that exercise existing contracts.

---

### UI / UX Notes (if applicable)

Not applicable — this is a backend-only story with no user-facing changes.

---

### Acceptance Criteria

Each criterion must be independently verifiable.

- [ ] Given the test suite is run with `pytest` from `backend/`, when all tests pass, then the exit code is 0 and no warnings about unclosed sessions or event loops appear.
- [ ] Given the auth test for new user login, when `POST /api/v1/auth/login` is called with a valid body, then the response is HTTP 200 with `access_token`, `token_type: "bearer"`, and a `user` object containing the correct `email`.
- [ ] Given the feed test for anonymous access, when `GET /api/v1/articles/feed` is called without an Authorization header, then the response is HTTP 200 with `items` (list), `next_cursor` (string or null), and `has_more` (boolean).
- [ ] Given the feed cursor test, when the `next_cursor` from page 1 is passed as `cursor` in a second request, then the response is HTTP 200 and does not repeat articles from page 1.
- [ ] Given the search test for a valid query, when `GET /api/v1/search?q=history` is called, then the response is HTTP 200 with `query`, `items`, `total`, and `language` fields.
- [ ] Given the bookmark round-trip test, when a bookmark is created, listed, and then deleted by the same authenticated user, then each step returns the expected HTTP status (201 or 200, 200, 204 or 200).
- [ ] `[unhappy path]` Given the auth test for a malformed body, when `POST /api/v1/auth/login` is called with a missing `email` field, then the response is HTTP 422 with a validation error detail.
- [ ] `[unhappy path]` Given the search test for a missing query, when `GET /api/v1/search` is called without the `q` parameter, then the response is HTTP 422.
- [ ] `[unhappy path]` Given the bookmark ownership test, when user B attempts to delete a bookmark created by user A, then the response is HTTP 404.
- [ ] `[unhappy path]` Given the feed receives an invalid cursor string, when the request is processed, then the response is not HTTP 500 (either 422 or a graceful empty page is acceptable).

---

### Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| Performance | The full test suite must complete in under 60 seconds on a standard developer machine. |
| Security | The test database must use a separate `DATABASE_URL` (e.g., `TEST_DATABASE_URL` env var or an in-memory SQLite URI) so that tests can never affect the development database. |
| Rate limiting | Not applicable to tests. |
| Data retention | Test data is ephemeral — the test database is created and destroyed per session. No test data is retained. |

---

### Implementation Notes

**When this section is REQUIRED:** This story establishes new test infrastructure and exercises existing API endpoints. The database subsection is required because the test setup depends on the schema.

**Backend (FastAPI / SQLAlchemy):**
- Use `httpx.AsyncClient` with `app` passed as the transport (ASGI test client pattern), not a real HTTP server.
- Override `get_db` in `conftest.py` using `app.dependency_overrides[get_db] = override_get_db`.
- JWT tokens for authenticated tests can be obtained by calling the login endpoint within the test, or by calling `create_access_token` directly from `app/core/security.py`.

**Frontend (Next.js / TanStack Query):**
- Not applicable.

**Database:**
- Preferred approach: use an async SQLite in-memory database (`aiosqlite`) for speed and zero-dependency setup. Add `aiosqlite` to `[project.optional-dependencies] dev` in `pyproject.toml`.
- Alternative: use a real PostgreSQL test database via `TEST_DATABASE_URL` environment variable. This is more faithful to production but requires Docker or a local Postgres instance in CI.
- Run `Base.metadata.create_all()` in the session-scoped fixture before tests and `Base.metadata.drop_all()` in teardown.
- Do not use Alembic migrations in the test setup — use `create_all` for simplicity. Alembic migration testing is a separate concern.

---

### Tasks

| Task ID | Title | Owner | Status |
|---------|-------|-------|--------|
| TASK-008 | Set up pytest + pytest-asyncio test infrastructure and conftest.py | backend | backlog |
| TASK-009 | Write authentication endpoint tests | backend | backlog |
| TASK-010 | Write feed endpoint tests including cursor pagination | backend | backlog |
| TASK-011 | Write search endpoint tests | backend | backlog |
| TASK-012 | Write bookmark round-trip tests including ownership check | backend | backlog |

---

### QA Notes

Populated by QA when story moves to `in_review`. PM reviews before marking `done`.

- **Test environments used:**
- **Edge cases exercised:**
- **Bugs filed:**
- **Sign-off:** [ ] QA approved

---

### Definition of Done

- [ ] All acceptance criteria pass in the staging / local environment
- [ ] All linked Tasks (TASK-008 through TASK-012) are `done` in tasks.json
- [ ] QA has signed off (no open `critical` or `high` bugs linked to this story)
- [ ] PR has been reviewed by at least one other agent or the PM, and merged to main
- [ ] No new API endpoints introduced; API_GUIDE.md unchanged
- [ ] No TypeScript strict errors introduced (not applicable — backend only)
- [ ] No Pydantic validation errors or unhandled exceptions introduced (backend)
- [ ] tasks.json is updated: story status set to `done`, agent `current_task` cleared

---

### Metadata

| Field | Value |
|-------|-------|
| Story ID | STORY-003 |
| Created by | pm |
| Created at | 2026-03-09 |
| Updated at | 2026-03-09 |
| Estimated points | 8 |
| Related bug | — |
| Related decision | — |
| Blocked by | — |
| Blocked reason | — |

# Story Template

## What Is a Story?

A Story represents a slice of user-visible value — something a real user (or the system on their behalf) can do, see, or benefit from once the work is delivered. Stories are the primary unit of planned work in a sprint. They are distinct from:

- **Tasks** (TASK-XXX): internal implementation work tracked in tasks.json
- **Bugs** (BUG-XXX): defects discovered after a feature ships or during QA
- **Chores**: refactors, config changes, or tooling that has no direct user impact

A Story may produce one or more Tasks. It is written from the perspective of the end user or the system, not the developer.

---

## Story: STORY-004

### Title
Frontend critical user journeys have automated integration tests

### Type
`feature`

### Priority
`high`

### Status
`blocked`

When status is `blocked`, populate the `blocked_by` field below.

### Blocked By
STORY-001, STORY-002

### Sprint
`sprint-1`

---

### User Story Statement

> As the **development team**, we want automated integration tests for the frontend's critical user journeys, so that the corrected API integrations and core UI flows are protected from regression.

---

### Context and Background

The frontend is TypeScript strict-mode clean but has zero test coverage. The two contract fixes landing in STORY-001 and STORY-002 represent the first production-critical changes to the codebase, and they need to be guarded by tests immediately. This story establishes a Vitest unit/integration layer for the API hooks (which is where the bugs lived) and a minimal Playwright end-to-end layer for the two journeys that were broken: the infinite-scroll feed and the search flow. This story is blocked by STORY-001 and STORY-002 because tests should be written against the corrected behaviour, not the broken state.

---

### Scope

**In scope:**
- Vitest + `@testing-library/react` setup for hook and component testing
- Unit/integration tests for the corrected `useArticles` hook (or `useInfiniteQuery` feed hook): assert that `cursor` is used (not `skip`), that pages are accumulated correctly, and that `fetchNextPage` is called when `has_more` is true
- Unit/integration tests for the search hook: assert that the URL is `/search` (not `/articles/search`) and that an empty query suppresses the request
- Playwright end-to-end setup targeting a locally running full stack (frontend + backend)
- One Playwright test: the infinite-scroll feed journey (load feed, scroll to bottom, assert second page loads)
- One Playwright test: the search journey (navigate to search, type query, assert results appear)
- `vitest.config.ts` and Playwright config added to `frontend/`

**Out of scope:**
- Full component test coverage of all UI components
- Tests for authentication flows (STORY-005 covers auth; tests should follow in that story)
- Tests for bookmark, like, and dismiss interactions (Sprint 2)
- Visual regression testing
- Performance testing
- Testing against a mocked backend (all Playwright tests run against the real local backend to maximise confidence)

---

### Functional Requirements

1. Running `npm run test` from `frontend/` executes the Vitest suite and exits 0 when all pass.
2. Running `npm run test:e2e` from `frontend/` executes the Playwright suite against `http://localhost:3000` (requires the full stack to be running).
3. The feed hook test mocks the fetch layer and asserts: the first call contains no `cursor` parameter; the call after `fetchNextPage` contains `cursor=<value from previous response>`; a `skip` parameter is never present in any call.
4. The feed hook test asserts that `data.pages` is flattened into a single article list for rendering.
5. The search hook test mocks the fetch layer and asserts: a query of 1 character fires no request; a query of 2+ characters fires a request to `/search?q=...`; clearing the input fires no request.
6. The Playwright feed test: navigates to `/<locale>/feed`, waits for at least one article card to appear, scrolls to the bottom of the feed, and asserts that additional article cards appear (more than the initial batch).
7. The Playwright search test: navigates to `/<locale>/search`, types "history" into the search input, waits for the debounce, and asserts that at least one result card is rendered with a non-empty title.

---

### API Contract (if applicable)

Not applicable — no backend changes. Tests exercise the existing corrected frontend hooks.

---

### UI / UX Notes (if applicable)

Not applicable — no UI changes. This story adds test files only.

---

### Acceptance Criteria

Each criterion must be independently verifiable.

- [ ] Given the Vitest suite is run with `npm run test`, when all tests pass, then the exit code is 0.
- [ ] Given the feed hook test, when the hook is initialised, then the first fetch URL does not include a `skip` parameter and does include the correct path `/api/v1/articles/feed`.
- [ ] Given the feed hook test, when `fetchNextPage` is called after a successful first page response with `next_cursor: "abc"`, then the second fetch URL includes `cursor=abc`.
- [ ] Given the search hook test, when the query is 1 character, then no fetch is made.
- [ ] Given the search hook test, when the query is "history", then the fetch URL is `GET /api/v1/search?q=history` (not `/articles/search`).
- [ ] Given the Playwright feed test, when the page loads and the user scrolls to the bottom, then more article cards appear below the original batch within 5 seconds.
- [ ] Given the Playwright search test, when "history" is typed and the debounce elapses, then at least one result card with a non-empty title is visible.
- [ ] `[unhappy path]` Given the feed hook test, when the backend returns `has_more: false`, then `fetchNextPage` is not called again and the hook reports `hasNextPage: false`.
- [ ] `[unhappy path]` Given the Playwright search test, when the search input is cleared after results are shown, then the results area returns to the empty/prompt state.
- [ ] `[unhappy path]` Given the feed hook test simulates a network error on the second page, when the error occurs, then the hook exposes an error state and the first page's articles are preserved.

---

### Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| Performance | The Vitest suite must complete in under 30 seconds. Playwright tests are allowed up to 60 seconds total. |
| Rate limiting | Not applicable — Playwright tests run against a local environment with no rate limiting. |
| Data retention | No persistent test data. Playwright tests should not rely on pre-existing database state; the feed and search work with an anonymous session. |
| Browser support | Playwright tests run against Chromium (default). Firefox and WebKit are optional and can be added in Sprint 2. |

---

### Implementation Notes

**When this section is REQUIRED:** This story does not modify the database schema or introduce a new backend endpoint, but the Playwright setup depends on the corrected API contract from STORY-001 and STORY-002. The frontend subsection is required to guide test placement and tooling choices.

**Backend (FastAPI / SQLAlchemy):**
- No code changes. The Playwright tests assume the backend is running at `http://localhost:8000` and is seeded with at least a few articles in `article_cache`. If the local DB is empty, the feed will return an empty first page and the Playwright feed test will fail. Document the prerequisite in the test README.

**Frontend (Next.js / TanStack Query):**
- Add `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, and `msw` (Mock Service Worker) to `devDependencies`.
- Create `frontend/vitest.config.ts` with jsdom environment and path alias (`@/*` → `src/*`) matching `tsconfig.json`.
- Place hook tests in `src/hooks/__tests__/useArticles.test.ts` and `src/hooks/__tests__/useSearch.test.ts` (or equivalent hook file name).
- Use `msw` to intercept fetch calls in Vitest tests — do not mock `fetch` directly, as TanStack Query's internals depend on the full fetch lifecycle.
- Add `@playwright/test` to `devDependencies`. Create `frontend/playwright.config.ts` with `baseURL: 'http://localhost:3000'` and a `webServer` block that starts `next dev` automatically if not already running.
- Place Playwright tests in `frontend/e2e/feed.spec.ts` and `frontend/e2e/search.spec.ts`.

**Database:**
- No schema changes. Note: Playwright tests require the backend to have article data. If `article_cache` is empty, the recommendation engine returns an empty feed. This is a prerequisite, not a code change.

---

### Tasks

| Task ID | Title | Owner | Status |
|---------|-------|-------|--------|
| TASK-013 | Set up Vitest + Testing Library + MSW in frontend | frontend | backlog |
| TASK-014 | Write feed hook unit tests (cursor, no-skip, has_more behaviour) | frontend | backlog |
| TASK-015 | Write search hook unit tests (URL correctness, empty query suppression) | frontend | backlog |
| TASK-016 | Set up Playwright and write feed E2E test | frontend | backlog |
| TASK-017 | Write search E2E test | frontend | backlog |

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
- [ ] All linked Tasks (TASK-013 through TASK-017) are `done` in tasks.json
- [ ] QA has signed off (no open `critical` or `high` bugs linked to this story)
- [ ] PR has been reviewed by at least one other agent or the PM, and merged to main
- [ ] No new API endpoints introduced; API_GUIDE.md unchanged
- [ ] No TypeScript strict errors introduced (frontend)
- [ ] tasks.json is updated: story status set to `done`, agent `current_task` cleared

---

### Metadata

| Field | Value |
|-------|-------|
| Story ID | STORY-004 |
| Created by | pm |
| Created at | 2026-03-09 |
| Updated at | 2026-03-09 |
| Estimated points | 8 |
| Related bug | — |
| Related decision | — |
| Blocked by | STORY-001, STORY-002 |
| Blocked reason | Tests must be written against the corrected pagination and search URL behaviour. Writing them against the broken state would produce tests that pass on broken code. |

# Story Template

## What Is a Story?

A Story represents a slice of user-visible value — something a real user (or the system on their behalf) can do, see, or benefit from once the work is delivered. Stories are the primary unit of planned work in a sprint. They are distinct from:

- **Tasks** (TASK-XXX): internal implementation work tracked in tasks.json
- **Bugs** (BUG-XXX): defects discovered after a feature ships or during QA
- **Chores**: refactors, config changes, or tooling that has no direct user impact

A Story may produce one or more Tasks. It is written from the perspective of the end user or the system, not the developer.

---

## Story: STORY-002

### Title
User can search for articles and receive results from the correct backend endpoint

### Type
`improvement`

### Priority
`critical`

### Status
`ready`

When status is `blocked`, populate the `blocked_by` field below.

### Blocked By
—

### Sprint
`sprint-1`

---

### User Story Statement

> As an **anonymous visitor or authenticated user**, I want to type a search query and see relevant article results, so that I can find articles on topics I care about directly rather than relying only on the feed.

---

### Context and Background

The frontend search page (`src/app/[locale]/(main)/search/`) calls `GET /articles/search?q=...`. The backend search router is mounted at `/api/v1/search?q=...` — there is no `/articles/search` route. Every search request the frontend makes currently returns a 404, making search completely non-functional. This is a confirmed URL contract mismatch. It is a one-line change on the frontend side but must be tested end-to-end to ensure the query parameters (`q`, `lang`, `limit`) are also correctly forwarded.

---

### Scope

**In scope:**
- Correct the search API URL in the frontend from `/articles/search` to `/search` (resolving to `GET /api/v1/search`)
- Verify all query parameters (`q`, `lang`, `limit`) are correctly forwarded from the frontend search input
- Verify the response shape (`{ query, items, total, language }`) is correctly consumed by the search results component
- Update the frontend type definitions if the search response type does not match the backend schema
- Smoke-test the search flow end-to-end in a local environment

**Out of scope:**
- UI redesign of the search results page
- Adding filters (category, language selector) to the search UI — those are separate stories
- Backend search logic changes or Wikipedia API integration changes
- Debounce timing changes (existing debounce in `SearchInput.tsx` is acceptable)
- Pagination of search results (the backend returns up to 50 results in a single response; cursor pagination for search is a future enhancement)

---

### Functional Requirements

1. When a user types a query into the search input, the frontend calls `GET /api/v1/search?q=<query>&lang=<lang>&limit=<limit>`.
2. The `lang` parameter is derived from the current locale (next-intl routing) and defaults to `en` if the locale is not `uk` or `ru`.
3. The `limit` parameter defaults to 10 unless overridden.
4. Search results are rendered in the results grid using the `ArticleCard` component (or equivalent search result component) with title and extract visible.
5. The total result count from the response is displayed to the user (e.g., "42 results for 'quantum physics'").
6. If the query is empty or fewer than 2 characters, no request is made and the results area shows a prompt to keep typing.
7. The debounce delay of the search input is preserved (no request fires on every keystroke).

---

### API Contract (if applicable)

| Method | Path | Auth Required | Notes |
|--------|------|---------------|-------|
| GET | /api/v1/search | No | Frontend URL corrected from `/articles/search` to `/search`. No backend changes. |

Schema changes:
- Frontend only: correct the URL constant / hook call. No backend schema changes.

**Request/response example:**

```json
// Request
// GET /api/v1/search?q=quantum%20physics&lang=en&limit=10

// Response 200
{
  "query": "quantum physics",
  "items": [
    {
      "id": 12345,
      "title": "Quantum Mechanics",
      "extract": "Quantum mechanics is the fundamental theory of nature at the smallest scales...",
      "language": "en"
    },
    {
      "id": 67890,
      "title": "Quantum Field Theory",
      "extract": "In theoretical physics, quantum field theory is a framework...",
      "language": "en"
    }
  ],
  "total": 42,
  "language": "en"
}

// Response 422 — missing or invalid query parameter
{
  "detail": [
    {
      "loc": ["query", "q"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}

// Response 200 — no results
{
  "query": "xyzzy1234nonexistent",
  "items": [],
  "total": 0,
  "language": "en"
}
```

---

### UI / UX Notes (if applicable)

- Entry point: the search page accessible via the bottom tab bar (mobile/tablet) or left sidebar (desktop) at `/<locale>/search`.
- The `SearchInput.tsx` component already handles debouncing. No changes needed there.
- On a successful response with results, render each item from `response.items` in the results grid. Each item has `id`, `title`, `extract`, and `language` — note the `id` here is a `wikipedia_id` integer, not a UUID. The frontend must handle this: clicking a result should navigate to `GET /api/v1/articles/<uuid>` which requires the article to be cached first. For this sprint, navigating to the Wikipedia article directly (external link) is an acceptable interim behaviour if the UUID is not available.
- On zero results, show an empty-state illustration or message using the existing translation key pattern. Add `search.no_results` to EN/UK/RU if it does not exist.
- On a request error (network failure, 5xx), show a dismissible error snackbar using `Snackbar.tsx`.
- Responsive behaviour: unchanged from current layout.
- i18n keys to add if missing: `search.no_results`, `search.results_count` (e.g., "42 results for '{query}'").

---

### Acceptance Criteria

Each criterion must be independently verifiable.

- [ ] Given a user navigates to the search page and types "quantum physics", when the debounce period elapses, then a request is made to `GET /api/v1/search?q=quantum+physics&lang=en&limit=10` (not to `/articles/search`).
- [ ] Given the backend returns results, when the response arrives, then a list of article titles and extracts is rendered on the page.
- [ ] Given the response includes `total: 42`, when results are displayed, then the UI shows a result count string (e.g., "42 results").
- [ ] Given the user's current locale is `uk`, when a search is made, then the request includes `lang=uk`.
- [ ] `[unhappy path]` Given the search returns `total: 0` and an empty `items` array, when results are displayed, then an empty-state message is shown and no article cards are rendered.
- [ ] `[unhappy path]` Given the user clears the search input (query becomes empty), when the input is cleared, then no API request is made and the results area resets to the initial prompt state.
- [ ] `[unhappy path]` Given the backend is unreachable and the request fails with a network error, when the error occurs, then an error snackbar is shown and the user is not shown a blank page.
- [ ] `[unhappy path]` Given a query of 1 character is typed, when the input is observed, then no request is fired until the query is at least 2 characters long.
- [ ] Given the fix is applied, when QA performs a search for "history" in a local environment connected to the backend, then results are returned and rendered correctly.

---

### Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| Performance | Search response renders within 1 s of the debounce firing under normal network conditions. TanStack Query caches the result for the same query string to avoid redundant requests. |
| Security | No auth token required for search. Do not attach the Authorization header if the user is unauthenticated to avoid leaking tokens unnecessarily — the backend accepts the endpoint without auth. |
| Rate limiting | No rate limiting in this MVP. The debounce on the input (existing) is the primary guard against request flooding. |
| Data retention | Search queries are not persisted — they are sent directly to the Wikipedia API via the backend and no query log is stored. |
| i18n | Any new translation keys (`search.no_results`, `search.results_count`) must be present in `messages/en.json`, `messages/uk.json`, and `messages/ru.json`. |
| Browser support | Verified on Chrome 90+, Firefox 88+, Safari 14+, mobile Chrome, mobile Safari. |

---

### Implementation Notes

**When this section is REQUIRED:** This story does not change the database schema or introduce a new backend endpoint. However, the URL correction is a contract fix and the implementation note for the frontend is included to guide the exact location of the change.

**Backend (FastAPI / SQLAlchemy):**
- No code changes. Confirm the search router is registered at `router.include_router(search_router, prefix="/search")` in `app/api/v1/router.py` and that the full path resolves to `/api/v1/search`.

**Frontend (Next.js / TanStack Query):**
- Locate the search API call — likely in `src/hooks/useArticles.ts` or a dedicated `useSearch.ts` hook, and/or directly in `src/app/[locale]/(main)/search/page.tsx`.
- Change the fetch URL from `/articles/search` to `/search`. With the base URL set to `http://localhost:8000/api`, the full resolved URL becomes `http://localhost:8000/api/v1/search` — confirm the `/v1` prefix is applied by the `api.ts` client and not manually appended in the hook.
- Verify the search result type. The backend returns `{ query: string, items: Array<{ id: number, title: string, extract: string, language: string }>, total: number, language: string }`. Update `src/types/article.ts` if the current `SearchResult` type does not match.
- The search result `id` is a `wikipedia_id` (integer), not the internal UUID. Do not attempt to call `GET /api/v1/articles/<wikipedia_id>` — it will 404. Either link to the Wikipedia page directly or omit the click-through for now.

**Database:**
- No changes.

---

### Tasks

| Task ID | Title | Owner | Status |
|---------|-------|-------|--------|
| TASK-005 | Fix search API URL from /articles/search to /search | frontend | backlog |
| TASK-006 | Align SearchResult type definition to backend response schema | frontend | backlog |
| TASK-007 | Verify backend search router mount path end-to-end | backend | backlog |

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
- [ ] All linked Tasks (TASK-005 through TASK-007) are `done` in tasks.json
- [ ] QA has signed off (no open `critical` or `high` bugs linked to this story)
- [ ] PR has been reviewed by at least one other agent or the PM, and merged to main
- [ ] No new API endpoints introduced; API_GUIDE.md unchanged
- [ ] Any new i18n keys are present in EN, UK, and RU message files
- [ ] No TypeScript strict errors introduced (frontend)
- [ ] tasks.json is updated: story status set to `done`, agent `current_task` cleared

---

### Metadata

| Field | Value |
|-------|-------|
| Story ID | STORY-002 |
| Created by | pm |
| Created at | 2026-03-09 |
| Updated at | 2026-03-09 |
| Estimated points | 2 |
| Related bug | — |
| Related decision | — |
| Blocked by | — |
| Blocked reason | — |

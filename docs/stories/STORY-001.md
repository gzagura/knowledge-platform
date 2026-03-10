# Story Template

## What Is a Story?

A Story represents a slice of user-visible value — something a real user (or the system on their behalf) can do, see, or benefit from once the work is delivered. Stories are the primary unit of planned work in a sprint. They are distinct from:

- **Tasks** (TASK-XXX): internal implementation work tracked in tasks.json
- **Bugs** (BUG-XXX): defects discovered after a feature ships or during QA
- **Chores**: refactors, config changes, or tooling that has no direct user impact

A Story may produce one or more Tasks. It is written from the perspective of the end user or the system, not the developer.

---

## Story: STORY-001

### Title
User can scroll an infinite article feed that loads more articles on demand

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

> As an **anonymous visitor or authenticated user**, I want to scroll through an infinite feed of articles that continuously loads new content, so that I can discover knowledge without interruption.

---

### Context and Background

The frontend feed (`ArticleFeed.tsx`) calls `GET /articles/feed?skip=N&limit=10` using offset-based pagination. The backend feed endpoint (`GET /api/v1/articles/feed`) does not accept `skip` at all — it uses cursor-based pagination and returns `{ items, next_cursor, has_more }`. As a result, the feed fails silently after the first page: subsequent requests return an error or an empty result because `skip` is an unrecognised parameter. This is a confirmed contract mismatch that makes the core feature of the app non-functional. Fixing it is the highest-priority item in Sprint 1.

---

### Scope

**In scope:**
- Update the frontend API call in `useArticles.ts` (and any related hooks) to use `cursor`-based pagination instead of `skip`/`limit`
- Update `ArticleFeed.tsx` infinite scroll logic to store and forward `next_cursor` from each response
- Update the frontend type definitions in `src/types/article.ts` to reflect the cursor-paginated response shape: `{ items, next_cursor, has_more }`
- Remove or deprecate any frontend usage of `skip` against the feed endpoint
- Verify the backend `GET /api/v1/articles/feed` correctly accepts `cursor` (optional), `limit`, `mode`, `reading_time`, and `lang` and returns the documented shape

**Out of scope:**
- Changes to the backend recommendation algorithm or feed business logic
- Implementing a new backend pagination strategy (the backend cursor approach is correct and stays)
- Adding filters or sorting UI to the feed (separate story)
- Any changes to the `/articles/random` or `/articles/{id}` endpoints

---

### Functional Requirements

1. On first load the feed calls `GET /api/v1/articles/feed` with no `cursor` parameter and receives an array of articles plus `next_cursor` and `has_more`.
2. When the user scrolls to the bottom and `has_more` is `true`, the feed calls the endpoint again with `cursor=<next_cursor>` from the previous response.
3. New articles are appended below existing ones without replacing them and without a full-page reload.
4. When `has_more` is `false`, no further requests are made and a visible end-of-feed indicator is shown.
5. During each load-more request a loading skeleton or spinner is shown at the bottom of the feed.
6. The `mode` (`explore` | `deepen`), `reading_time`, and `lang` query parameters continue to be forwarded correctly on every page request, including cursor-paginated ones.
7. If the user is authenticated their JWT is included in the `Authorization` header on every feed request so personalisation works.

---

### API Contract (if applicable)

| Method | Path | Auth Required | Notes |
|--------|------|---------------|-------|
| GET | /api/v1/articles/feed | No (optional) | No change to backend. Frontend must align to this contract. |

Schema changes (frontend side only — no backend schema changes):
- Remove: `skip` query parameter usage
- Add: `cursor` query parameter (string, optional, from previous `next_cursor`)
- Response type updated from a plain array to `PaginatedFeedResponse`

**Request/response example:**

```json
// First page request (no cursor)
// GET /api/v1/articles/feed?mode=explore&reading_time=5&lang=en&limit=10

// Subsequent page request
// GET /api/v1/articles/feed?mode=explore&reading_time=5&lang=en&limit=10&cursor=550e8400-e29b-41d4-a716-446655440001

// Response 200
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "wikipedia_id": 12345,
      "title": "Quantum Mechanics",
      "extract": "Quantum mechanics is the fundamental theory of nature...",
      "category": "Science",
      "reading_time_minutes": 5,
      "is_featured": true,
      "image_url": "https://upload.wikimedia.org/...",
      "language": "en",
      "is_liked": false,
      "is_bookmarked": false,
      "fun_fact": "Quantum entanglement was called 'spooky action at a distance' by Einstein."
    }
  ],
  "next_cursor": "550e8400-e29b-41d4-a716-446655440002",
  "has_more": true
}

// Response 200 — last page
{
  "items": [...],
  "next_cursor": null,
  "has_more": false
}

// Response 422 — invalid cursor
{
  "detail": "Invalid cursor value"
}
```

---

### UI / UX Notes (if applicable)

- The Intersection Observer in `ArticleFeed.tsx` already fires when the user nears the bottom of the list. The trigger logic stays the same; only the data-fetching parameters change.
- TanStack Query's `useInfiniteQuery` is the correct hook for cursor-paginated feeds. Replace any `useQuery` usage on the feed with `useInfiniteQuery`, using `next_cursor` as the `pageParam`.
- During a load-more fetch, show the existing `Skeleton` component (`src/components/ui/Skeleton.tsx`) at the bottom of the feed — one skeleton card per expected article.
- When `has_more` is `false`, display a subtle end-of-feed message. Use an existing translation key if one exists, otherwise add `feed.end_of_feed` to EN/UK/RU message files.
- Behaviour is the same on mobile, tablet, and desktop — no layout changes required.
- No new i18n keys required beyond the optional `feed.end_of_feed` string.

---

### Acceptance Criteria

Each criterion must be independently verifiable.

- [ ] Given a user opens the feed for the first time, when the page loads, then at least one batch of articles is displayed without any console errors related to pagination parameters.
- [ ] Given a user has scrolled to the bottom of the first batch and `has_more` is `true`, when the Intersection Observer fires, then the next batch is fetched using `cursor=<next_cursor>` and appended below the existing articles.
- [ ] Given subsequent pages are loaded, when the user inspects network requests, then no request to the feed endpoint contains a `skip` parameter.
- [ ] Given `mode`, `reading_time`, and `lang` are set, when a cursor-paginated request is made, then all three parameters are included alongside `cursor` in the request URL.
- [ ] Given an authenticated user, when the feed loads any page, then the `Authorization: Bearer <token>` header is present on each request.
- [ ] `[unhappy path]` Given the backend returns `has_more: false`, when the user reaches the end of the feed, then no further fetch is triggered and an end-of-feed indicator is visible.
- [ ] `[unhappy path]` Given a load-more request fails with a network error, when the error occurs, then the existing articles remain visible, an error message is shown, and a retry affordance is available.
- [ ] `[unhappy path]` Given an invalid or expired cursor is sent, when the backend returns 422, then the frontend displays an error state and does not crash.
- [ ] Given the fix is applied, when QA runs the full infinite-scroll journey on mobile Chrome and desktop Chrome, then the feed scrolls through at least three pages of content without failure.

---

### Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| Performance | Each feed page request must complete in < 500 ms at p95 on a local dev environment. TanStack Query's stale-while-revalidate caching must be preserved. |
| Accessibility | The end-of-feed message and loading skeleton must be announced to screen readers via appropriate ARIA live regions (existing Skeleton component already handles this). |
| Rate limiting | No change — feed endpoint is unauthenticated-friendly and rate limiting is not implemented in this MVP. |
| Data retention | No new data is written by this story. |
| i18n | If a new `feed.end_of_feed` key is added, it must be present in `messages/en.json`, `messages/uk.json`, and `messages/ru.json`. |
| Browser support | Verified on Chrome 90+, Firefox 88+, Safari 14+, mobile Chrome, mobile Safari. |

---

### Implementation Notes

**When this section is REQUIRED:** This story modifies the frontend API call pattern and type definitions but does not touch the database schema or introduce a new backend endpoint. The backend subsection is included only for verification steps.

**Backend (FastAPI / SQLAlchemy):**
- No code changes expected. Verify that `GET /api/v1/articles/feed` in `app/api/v1/endpoints/articles.py` accepts `cursor: Optional[str] = None` and that the `RecommendationEngine` correctly uses it. If `skip` is accepted and silently ignored rather than rejected, confirm this causes no side-effect.

**Frontend (Next.js / TanStack Query):**
- In `src/hooks/useArticles.ts`: replace `useQuery` on the feed with `useInfiniteQuery`. The `getNextPageParam` callback should return `lastPage.next_cursor ?? undefined`.
- In `src/components/article/ArticleFeed.tsx`: flatten `data.pages` into a single article array for rendering. Pass the Intersection Observer callback to `fetchNextPage`.
- In `src/types/article.ts`: add or update `PaginatedFeedResponse` type: `{ items: ArticleCard[]; next_cursor: string | null; has_more: boolean }`.
- Remove the `skip` offset counter variable and any arithmetic around it.

**Database:**
- No changes.

---

### Tasks

| Task ID | Title | Owner | Status |
|---------|-------|-------|--------|
| TASK-001 | Update feed hook to useInfiniteQuery with cursor pagination | frontend | backlog |
| TASK-002 | Update ArticleFeed component to consume infinite query pages | frontend | backlog |
| TASK-003 | Update PaginatedFeedResponse type and remove skip parameter | frontend | backlog |
| TASK-004 | Verify backend feed endpoint cursor parameter handling | backend | backlog |

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
- [ ] All linked Tasks (TASK-001 through TASK-004) are `done` in tasks.json
- [ ] QA has signed off (no open `critical` or `high` bugs linked to this story)
- [ ] PR has been reviewed by at least one other agent or the PM, and merged to main
- [ ] No new API endpoints introduced; API_GUIDE.md unchanged
- [ ] If `feed.end_of_feed` i18n key was added, it is present in EN, UK, and RU message files
- [ ] No TypeScript strict errors introduced (frontend)
- [ ] No Pydantic validation errors or unhandled exceptions introduced (backend)
- [ ] tasks.json is updated: story status set to `done`, agent `current_task` cleared

---

### Metadata

| Field | Value |
|-------|-------|
| Story ID | STORY-001 |
| Created by | pm |
| Created at | 2026-03-09 |
| Updated at | 2026-03-09 |
| Estimated points | 5 |
| Related bug | — |
| Related decision | — |
| Blocked by | — |
| Blocked reason | — |

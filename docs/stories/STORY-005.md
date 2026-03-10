# Story Template

## What Is a Story?

A Story represents a slice of user-visible value — something a real user (or the system on their behalf) can do, see, or benefit from once the work is delivered. Stories are the primary unit of planned work in a sprint. They are distinct from:

- **Tasks** (TASK-XXX): internal implementation work tracked in tasks.json
- **Bugs** (BUG-XXX): defects discovered after a feature ships or during QA
- **Chores**: refactors, config changes, or tooling that has no direct user impact

A Story may produce one or more Tasks. It is written from the perspective of the end user or the system, not the developer.

---

## Story: STORY-005

### Title
User can log in, receive a JWT, and access personalised features end-to-end

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

> As an **anonymous visitor**, I want to log in with my email so that I receive a personalised article feed and can save bookmarks and likes that persist across sessions.

---

### Context and Background

Authentication is a prerequisite for every other user-facing story in Sprint 1. STORY-001 fixes the feed and STORY-002 fixes search, but both rely on a valid JWT being present in the `Authorization` header for personalised results — if the auth flow is broken, those fixes deliver nothing to authenticated users. The frontend architecture document lists `/auth/me` as the current-user endpoint, but the backend exposes `GET /api/v1/users/me`. If this mismatch is real, every call to fetch the current user silently fails with a 404, the `Authorization` header is never populated correctly for subsequent requests, and the entire authenticated surface of the app — personalised feed, bookmarks, likes, profile — is non-functional. Token refresh (`POST /api/v1/auth/refresh`) and protected-route redirect behaviour have also never been validated against the real backend. This story must be worked in parallel with STORY-001 and STORY-002, not after them, so that the full authenticated end-to-end journey can be verified as a unit before Sprint 1 closes.

---

### Scope

**In scope:**
- Verify and correct the frontend "get current user" API call from `/auth/me` to `/api/v1/users/me` if the mismatch is confirmed
- Verify that a successful login stores the JWT in `localStorage` under a consistent key and that subsequent API calls include `Authorization: Bearer <token>` in the header
- Verify that `POST /api/v1/auth/refresh` is called proactively when the token is within 5 minutes of expiry (or on a 401 response), and that the new token replaces the old one in storage
- Verify that an unauthenticated user visiting a protected route (`/saved`, `/profile`, `/settings`) is redirected to the login page
- Validate the onboarding wizard's final step (auth step) submits to the correct login endpoint and correctly stores the token before redirecting to the feed
- Add Vitest tests for `useAuth.ts` covering the login, token storage, and 401-refresh flows

**Out of scope:**
- OAuth (Google, GitHub) — noted as "coming soon" in the frontend architecture; this remains out of scope
- Password reset or account deletion flows
- Email verification
- Session management beyond JWT (no server-side sessions)
- Changes to the JWT expiry duration (currently 24 hours, set in backend config)
- UI redesign of the login or signup pages

---

### Functional Requirements

1. When a user submits the login form with a valid email and name, the frontend calls `POST /api/v1/auth/login` with body `{ email, name, provider: "local" }` and stores the returned `access_token` in `localStorage`.
2. After successful login, the user is redirected to `/<locale>/feed`.
3. All subsequent API requests include `Authorization: Bearer <access_token>` in the header, sourced from `localStorage`.
4. The frontend calls `GET /api/v1/users/me` (not `/auth/me`) to fetch the current user profile and populate the profile page and header avatar.
5. When the API returns HTTP 401 on any request, the frontend calls `POST /api/v1/auth/refresh` with the current token and retries the original request with the new token.
6. If the refresh call also returns 401 (token fully expired or revoked), the user is logged out (token removed from `localStorage`) and redirected to the login page.
7. An unauthenticated user navigating directly to `/saved`, `/profile`, or `/settings` is redirected to `/<locale>/login`.
8. The onboarding wizard's auth step calls the same `POST /api/v1/auth/login` endpoint and stores the token identically to the standalone login page.

---

### API Contract (if applicable)

| Method | Path | Auth Required | Notes |
|--------|------|---------------|-------|
| POST | /api/v1/auth/login | No | No change. Frontend must send `{ email, name, provider: "local" }`. |
| POST | /api/v1/auth/refresh | Yes (expiring token) | No change. Frontend calls this on 401 before logging the user out. |
| GET | /api/v1/users/me | Yes | Frontend may currently call `/auth/me` — must be corrected to this path. |

Schema changes:
- No backend schema changes. Frontend `useAuth.ts` may need the `currentUser` fetch URL corrected.

**Request/response example:**

```json
// POST /api/v1/auth/login — Request
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "provider": "local"
}

// POST /api/v1/auth/login — Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar_url": null,
    "preferred_language": "en",
    "ui_language": "en",
    "preferred_reading_time": 5,
    "theme": "auto",
    "created_at": "2026-03-09T10:00:00"
  }
}

// GET /api/v1/users/me — Response 200
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar_url": null,
  "preferred_language": "en",
  "ui_language": "en",
  "preferred_reading_time": 5,
  "theme": "auto",
  "created_at": "2026-03-09T10:00:00"
}

// GET /api/v1/users/me — Response 401 (missing or invalid token)
{
  "detail": "Not authenticated"
}

// POST /api/v1/auth/refresh — Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...new...",
  "token_type": "bearer"
}
```

---

### UI / UX Notes (if applicable)

- Login page (`src/app/[locale]/(auth)/login/page.tsx`): no layout changes. Verify the form submission handler calls the correct endpoint and handles both success and error states.
- On successful login, use `next/navigation`'s `router.push` to navigate to `/<locale>/feed` — do not use a hard `window.location` redirect, which would break next-intl locale routing.
- On a failed login (e.g., network error or unexpected 500 from the backend), display an error message within the form. Use the existing `Snackbar.tsx` component or an inline form error depending on what is already implemented.
- Protected routes: the middleware in `src/middleware.ts` is the correct place to enforce authentication redirects. Check whether `useAuth.ts` exposes an `isAuthenticated` boolean that can be read in a client-side layout guard, or whether the middleware handles it at the edge.
- No new i18n keys are expected. If an error message is added ("Login failed. Please try again."), add it as `auth.login_error` in EN/UK/RU.

---

### Acceptance Criteria

Each criterion must be independently verifiable.

- [ ] Given a user on the login page submits a valid email and name, when the form is submitted, then `POST /api/v1/auth/login` is called with `{ email, name, provider: "local" }` and the returned `access_token` is stored in `localStorage`.
- [ ] Given a successful login, when the token is stored, then subsequent API calls include `Authorization: Bearer <token>` in the request headers.
- [ ] Given a logged-in user, when the profile page or header fetches the current user, then the request goes to `GET /api/v1/users/me` (not `/auth/me`) and the user's name and email are displayed correctly.
- [ ] Given a logged-in user whose token returns 401 on an API call, when the 401 is received, then the frontend calls `POST /api/v1/auth/refresh` and retries the original request with the new token transparently.
- [ ] Given an unauthenticated user navigates directly to `/<locale>/saved`, when the page loads, then the user is redirected to `/<locale>/login`.
- [ ] Given the onboarding wizard's auth step, when a user completes the step with a valid email, then the same login endpoint is called and the token is stored with the same `localStorage` key as the standalone login page.
- [ ] `[unhappy path]` Given the login form is submitted with no email value, when the form validation runs, then the request is not sent and an inline validation message is shown.
- [ ] `[unhappy path]` Given a logged-in user's token has fully expired and the refresh call returns 401, when the refresh fails, then the token is removed from `localStorage` and the user is redirected to `/<locale>/login`.
- [ ] `[unhappy path]` Given the backend is unreachable during login, when the network error occurs, then an error message is displayed in the login form and the user is not redirected.
- [ ] Given the fix is applied, when QA performs a full login-to-feed journey in a local environment, then the feed loads with personalised articles (the `is_liked` and `is_bookmarked` fields reflect the user's real data).

---

### Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| Security | The JWT must be stored in `localStorage` (existing approach). Tokens must never be logged to the browser console or included in error reports. The `Authorization` header must only be attached to requests to the configured `NEXT_PUBLIC_API_URL` origin, not to third-party URLs. |
| Rate limiting | The backend has no rate limiting on auth endpoints in this MVP. The frontend must not retry login automatically on failure — user action is required to retry. |
| Data retention | JWTs are stored in `localStorage` for up to 24 hours (matching the backend expiry). On logout or expiry, the token is removed from `localStorage` immediately. |
| i18n | Any new error string (`auth.login_error`) must be present in EN, UK, and RU message files. |
| Browser support | `localStorage` is available in all supported browsers. Verified on Chrome 90+, Firefox 88+, Safari 14+, mobile Chrome, mobile Safari. |

---

### Implementation Notes

**When this section is REQUIRED:** This story does not change the database schema and does not introduce a new backend endpoint. The backend subsection is included only for verification. The frontend subsection is required because the potential `/auth/me` URL mismatch must be located and corrected precisely.

**Backend (FastAPI / SQLAlchemy):**
- No code changes expected. Confirm `GET /api/v1/users/me` in `app/api/v1/endpoints/users.py` is correctly mounted and requires a valid JWT via the `get_current_user` dependency.
- Confirm `POST /api/v1/auth/refresh` in `app/api/v1/endpoints/auth.py` accepts a Bearer token and returns a new `access_token`.

**Frontend (Next.js / TanStack Query):**
- Open `src/hooks/useAuth.ts` and locate the "get current user" fetch call. If it calls `/auth/me`, change it to `/api/v1/users/me` (or `/users/me` if the base URL already includes `/api/v1`). Match the path to how other hooks construct their URLs via `src/lib/api.ts`.
- Locate the 401 interceptor in `src/lib/api.ts`. If no interceptor exists, add one: on a 401 response, attempt `POST /api/v1/auth/refresh`; if the refresh succeeds, update `localStorage` and retry; if it fails, clear `localStorage` and redirect to `/<locale>/login`.
- The `localStorage` key for the token must be a single constant defined in one place (e.g., `TOKEN_KEY = "kp_access_token"` in `src/lib/api.ts`) and referenced everywhere. Do not use different string literals in different files.

**Database:**
- No changes.

---

### Tasks

| Task ID | Title | Owner | Status |
|---------|-------|-------|--------|
| TASK-018 | Verify and correct current-user endpoint URL in useAuth.ts | frontend | backlog |
| TASK-019 | Implement 401 intercept and token refresh logic in api.ts | frontend | backlog |
| TASK-020 | Verify protected route redirects work for /saved, /profile, /settings | frontend | backlog |
| TASK-021 | Verify onboarding wizard auth step uses correct endpoint and token storage key | frontend | backlog |
| TASK-022 | Write Vitest tests for useAuth login, token storage, and refresh flows | frontend | backlog |
| TASK-023 | Verify backend /users/me and /auth/refresh endpoints against real JWT | backend | backlog |

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
- [ ] All linked Tasks (TASK-018 through TASK-023) are `done` in tasks.json
- [ ] QA has signed off (no open `critical` or `high` bugs linked to this story)
- [ ] PR has been reviewed by at least one other agent or the PM, and merged to main
- [ ] No new API endpoints introduced; API_GUIDE.md unchanged
- [ ] Any new i18n keys are present in EN, UK, and RU message files
- [ ] No TypeScript strict errors introduced (frontend)
- [ ] No Pydantic validation errors or unhandled exceptions introduced (backend)
- [ ] tasks.json is updated: story status set to `done`, agent `current_task` cleared

---

### Metadata

| Field | Value |
|-------|-------|
| Story ID | STORY-005 |
| Created by | pm |
| Created at | 2026-03-09 |
| Updated at | 2026-03-09 (priority raised from medium to critical; context updated to reflect auth as a prerequisite for STORY-001 and STORY-002) |
| Estimated points | 5 |
| Related bug | — |
| Related decision | — |
| Blocked by | — |
| Blocked reason | — |

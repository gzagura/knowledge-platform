# Story Template

## What Is a Story?

A Story represents a slice of user-visible value — something a real user (or the system on their behalf) can do, see, or benefit from once the work is delivered. Stories are the primary unit of planned work in a sprint. They are distinct from:

- **Tasks** (TASK-XXX): internal implementation work tracked in tasks.json
- **Bugs** (BUG-XXX): defects discovered after a feature ships or during QA
- **Chores**: refactors, config changes, or tooling that has no direct user impact

A Story may produce one or more Tasks. It is written from the perspective of the end user or the system, not the developer.

---

## Story: STORY-XXX

### Title
A short, active-voice label.
Example: "User can bookmark an article from the feed"

### Type
`feature` | `improvement` | `spike`

- **feature**: net-new capability
- **improvement**: meaningful enhancement to an existing capability
- **spike**: time-boxed research or proof-of-concept; produces a decision, not shippable code

### Priority
`critical` | `high` | `medium` | `low`

### Status
`draft` | `ready` | `in_progress` | `in_review` | `done` | `blocked`

Status flow: `draft` -> `ready` (PM signs off) -> `in_progress` -> `in_review` (QA validates) -> `done`

When status is `blocked`, populate the `blocked_by` field below.

### Blocked By
The Story ID (STORY-XXX) or Task ID (TASK-XXX) that is preventing progress. Set to `—` when not blocked.

### Sprint
The sprint id this story is planned in.
Example: `sprint-2`

---

### User Story Statement

> As a **[role]**, I want to **[action]**, so that **[outcome/value]**.

Roles for this project: `anonymous visitor` | `authenticated user` | `system` | `admin`

---

### Context and Background

2-4 sentences explaining why this story exists now. Reference any prior decision (DEC-XXX), bug (BUG-XXX), or user feedback that motivated it. If this is a follow-up to another story, name it.

---

### Scope

**In scope:**
- Bullet list of what this story explicitly covers.

**Out of scope:**
- Bullet list of what is intentionally excluded. Be specific — this prevents scope creep mid-sprint.

---

### Functional Requirements

Numbered list of concrete behaviors the system must exhibit when this story is done. Written in plain language, testable by QA.

1. ...
2. ...
3. ...

---

### API Contract (if applicable)

List any new or changed endpoints this story introduces or modifies. Keep this brief — full detail lives in the backend code and API_GUIDE.md.

| Method | Path | Auth Required | Notes |
|--------|------|---------------|-------|
| POST   | /api/v1/... | Yes | ... |

Schema changes (new fields, renamed fields, removed fields):
- ...

**Request/response example:**

```json
// Request
{
  "field_name": "value"
}

// Response 200
{
  "id": "uuid",
  "field_name": "value",
  "created_at": "2026-01-01T00:00:00Z"
}

// Response 4XX
{
  "detail": "Human-readable error message"
}
```

---

### UI / UX Notes (if applicable)

Describe the expected user interaction at a behaviour level, not a pixel level. Reference existing components (shadcn/ui, Framer Motion patterns) where relevant. Link to a Figma frame or screenshot if one exists.

- Where does the entry point appear in the UI?
- What feedback does the user receive on success / error?
- Any animation or transition expectations?
- Responsive behavior (mobile / tablet / desktop differences, if any)?
- i18n: list any new translation keys needed (EN/UK/RU).

---

### Acceptance Criteria

Each criterion must be independently verifiable. Written as: "Given [context], when [action], then [outcome]."

At least one AC must cover an unhappy path — for example: an error state, unauthorized access, empty state, duplicate action, or invalid input. Mark unhappy path ACs with `[unhappy path]` for clarity.

- [ ] Given ..., when ..., then ...
- [ ] Given ..., when ..., then ...
- [ ] `[unhappy path]` Given an unauthenticated user, when ..., then the system returns 401 / redirects to login (as applicable).
- [ ] `[unhappy path]` Given a network error, when ..., then the user sees a descriptive error state and can retry.
- [ ] `[unhappy path]` Given invalid or missing input, when ..., then the API returns 422 with a descriptive validation message.

---

### Non-Functional Requirements

Only include rows that apply to this story. Delete the rest.

| Concern | Requirement |
|---------|-------------|
| Performance | ... (e.g., endpoint responds in < 300 ms at p95 under normal load) |
| Accessibility | ... (e.g., new interactive elements meet WCAG 2.1 AA) |
| Security | ... (e.g., endpoint requires valid JWT; user can only modify their own data) |
| Rate limiting | ... (e.g., endpoint is covered by the existing rate limiter; or: new limit of N requests/minute per user applies) |
| Data retention | ... (e.g., records created by this feature are retained for X days; or: soft-delete only, no hard purge) |
| i18n | ... (e.g., all user-facing strings are translation-keyed; no hardcoded EN text) |
| Browser support | ... (e.g., tested on Chrome, Firefox, Safari; mobile Chrome and Safari) |

---

### Implementation Notes

**When this section is REQUIRED:** Any story that introduces or modifies a database schema (new table, new column, index change, migration) or defines a new API endpoint must complete the relevant subsections below. For all other stories this section is optional but encouraged.

**Backend (FastAPI / SQLAlchemy):**
- ...

**Frontend (Next.js / TanStack Query):**
- ...

**Database:**
- ...

---

### Tasks

List the TASK-XXX ids created in tasks.json to deliver this story. Populated by PM when story moves to `ready`.

| Task ID | Title | Owner | Status |
|---------|-------|-------|--------|
| TASK-XXX | ... | backend / frontend / qa | backlog |

---

### QA Notes

Populated by QA when story moves to `in_review`. PM reviews before marking `done`.

- **Test environments used:**
- **Edge cases exercised:**
- **Bugs filed:** BUG-XXX (link any bugs found during validation)
- **Sign-off:** [ ] QA approved

---

### Definition of Done

A story is `done` only when ALL of the following are true:

- [ ] All acceptance criteria pass in the staging / local environment
- [ ] All linked Tasks are `done` in tasks.json
- [ ] QA has signed off (no open `critical` or `high` bugs linked to this story)
- [ ] PR has been reviewed by at least one other agent or the PM, and merged to main
- [ ] New API endpoints are documented in API_GUIDE.md
- [ ] New UI strings have translation keys for EN, UK, and RU
- [ ] No TypeScript strict errors introduced (frontend)
- [ ] No Pydantic validation errors or unhandled exceptions introduced (backend)
- [ ] tasks.json is updated: story status set to `done`, agent `current_task` cleared

---

### Metadata

| Field | Value |
|-------|-------|
| Story ID | STORY-XXX |
| Created by | pm |
| Created at | YYYY-MM-DD |
| Updated at | YYYY-MM-DD |
| Estimated points | 1 / 2 / 3 / 5 / 8 / 13 (Fibonacci; reflects complexity, not duration) |
| Related bug | BUG-XXX or — |
| Related decision | DEC-XXX or — |
| Blocked by | STORY-XXX / TASK-XXX or — |
| Blocked reason | — |

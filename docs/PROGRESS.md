# Project Progress

_Last updated: 2026-03-09_

---

## What Has Been Done

### 1. Story Template — `docs/STORY_TEMPLATE.md`

Defined the standard format for all Stories in this project. Reviewed and scored by Claude (judge) twice, reaching a final score of **96/100**.

Template includes:
- User Story statement (role / action / outcome)
- Scope (in / out)
- Functional requirements
- API contract with request/response examples
- Acceptance criteria with mandatory unhappy-path coverage
- Non-functional requirements (performance, security, rate limiting, data retention, i18n)
- Implementation notes (required for DB or API changes)
- Definition of Done checklist
- Metadata (Fibonacci story points, blocked_by, decisions)

---

### 2. Sprint 1 — `tasks.json` + `docs/stories/`

Sprint goal: **Make the app usable end-to-end** — fix all known API contract mismatches and establish a minimum test baseline on both sides of the stack.

Sprint priority reviewed and scored by Claude (judge). Reached **94/100** after one iteration (auth story re-prioritized from medium → critical).

#### Stories

| ID | Title | Priority | Points | Status |
|---|---|---|---|---|
| STORY-001 | Feed pagination contract fix | critical | 5 | ready |
| STORY-002 | Search URL fix | critical | 2 | ready |
| STORY-003 | Backend test baseline | high | 8 | ready |
| STORY-004 | Frontend test baseline | high | 8 | blocked (on 001, 002) |
| STORY-005 | Auth end-to-end validation | critical | 5 | ready |

**Total: 28 story points**

#### Known bugs being fixed in Sprint 1

| Bug | Impact |
|---|---|
| Feed pagination: frontend sends `skip=N`, backend expects `cursor` | Feed broken past page 1 for all users |
| Search URL mismatch: frontend calls `/articles/search`, backend at `/search` | Every search request returns 404 |
| Auth URL mismatch: frontend calls `/auth/me`, backend exposes `/users/me` | All authenticated features potentially broken |

#### Decisions logged

| ID | Decision |
|---|---|
| DEC-001 | Fix pagination on the frontend only — backend cursor approach is correct |
| DEC-002 | Use SQLite in-memory for backend tests in Sprint 1; PostgreSQL container in Sprint 2 if needed |
| DEC-003 | Block STORY-004 on STORY-001 + STORY-002 — tests against broken behaviour carry no value |

---

## File Index

```
docs/
├── PROGRESS.md              ← this file
├── STORY_TEMPLATE.md        ← approved story template (score 96/100)
└── stories/
    ├── STORY-001.md         ← Feed pagination fix (critical)
    ├── STORY-002.md         ← Search URL fix (critical)
    ├── STORY-003.md         ← Backend test baseline (high)
    ├── STORY-004.md         ← Frontend test baseline (high, blocked)
    └── STORY-005.md         ← Auth validation (critical)

tasks.json                   ← sprint + story + task tracking
```

---

## What Is Not Started Yet

- No code has been written or modified this session
- No tests exist (backend or frontend)
- No agents have been assigned tasks
- Sprint 1 is planned and ready — work can begin immediately on STORY-001, STORY-002, STORY-003, and STORY-005 in parallel

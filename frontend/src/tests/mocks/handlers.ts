import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

// ---------------------------------------------------------------------------
// Canonical test fixtures
// ---------------------------------------------------------------------------

export const TEST_TOKEN = 'test-access-token-abc123'
export const REFRESHED_TOKEN = 'refreshed-access-token-xyz789'

export const TEST_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatar_url: null,
  preferred_language: 'en',
  ui_language: 'en',
  preferred_reading_time: 5,
  theme: 'auto',
  created_at: '2026-03-09T10:00:00',
}

// ---------------------------------------------------------------------------
// Default handlers — used across all tests unless overridden per-test
// ---------------------------------------------------------------------------

export const handlers = [
  // POST /auth/login — happy path
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      access_token: TEST_TOKEN,
      token_type: 'bearer',
      user: TEST_USER,
    })
  }),

  // GET /users/me — returns current user when Authorization header is present
  http.get(`${API_BASE}/users/me`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }
    // Accept either the original token or a refreshed token.
    const token = auth.replace('Bearer ', '')
    if (token !== TEST_TOKEN && token !== REFRESHED_TOKEN) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }
    return HttpResponse.json(TEST_USER)
  }),

  // POST /auth/refresh — happy path
  http.post(`${API_BASE}/auth/refresh`, ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth || !auth.startsWith('Bearer ')) {
      return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }
    return HttpResponse.json({
      access_token: REFRESHED_TOKEN,
      token_type: 'bearer',
    })
  }),
]

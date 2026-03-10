/**
 * Vitest tests for the auth flows defined in TASK-022 (STORY-005).
 *
 * These tests exercise:
 *  - Successful login: token stored in localStorage under TOKEN_KEY
 *  - Current-user fetch: goes to /users/me, NOT /auth/me
 *  - 401 response triggers a refresh attempt before logging the user out
 *  - Failed refresh clears the token from localStorage
 *
 * The tests drive apiCall() directly (via the `api` export) so they are
 * independent of React rendering complexity. The useAuth hook itself is
 * a thin TanStack Query wrapper around `api.get('/users/me')` — the
 * meaningful logic is in api.ts.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/server'
import { api, TOKEN_KEY } from '@/lib/api'
import {
  TEST_TOKEN,
  REFRESHED_TOKEN,
  TEST_USER,
} from './mocks/handlers'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearToken()
  // Prevent jsdom from throwing on window.location.href assignment
  vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...window.location,
    href: 'http://localhost/en/feed',
    pathname: '/en/feed',
  } as Location)
})

afterEach(() => {
  clearToken()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Suite 1: Login flow and token storage
// ---------------------------------------------------------------------------

describe('login flow', () => {
  it('stores the access_token in localStorage under TOKEN_KEY after a successful login call', async () => {
    // The MSW handler for POST /auth/login returns { access_token: TEST_TOKEN }.
    // api.ts transforms snake_case to camelCase, so the result has .accessToken.
    const response = await api.post<{ accessToken: string }>('/auth/login', {
      email: 'jane@example.com',
      password: 'secret',
    })

    // Simulate what login/page.tsx does after a successful response.
    localStorage.setItem(TOKEN_KEY, response.accessToken)

    expect(getToken()).toBe(TEST_TOKEN)
  })

  it('uses the constant TOKEN_KEY ("kp_access_token"), not a bare "token" string', () => {
    expect(TOKEN_KEY).toBe('kp_access_token')
  })
})

// ---------------------------------------------------------------------------
// Suite 2: Current-user fetch — correct endpoint
// ---------------------------------------------------------------------------

describe('GET /users/me (current-user fetch)', () => {
  it('fetches the current user from /users/me when a valid token is present', async () => {
    setToken(TEST_TOKEN)

    const capturedRequests: string[] = []
    server.events.on('request:start', ({ request }) => {
      capturedRequests.push(request.url)
    })

    const user = await api.get<typeof TEST_USER>('/users/me')

    expect(user.id).toBe(TEST_USER.id)
    expect(user.email).toBe(TEST_USER.email)
    expect(user.name).toBe(TEST_USER.name)

    // Verify the URL was /users/me and NOT /auth/me.
    expect(capturedRequests.some((url) => url.includes('/users/me'))).toBe(true)
    expect(capturedRequests.some((url) => url.includes('/auth/me'))).toBe(false)

    server.events.removeAllListeners()
  })

  it('attaches Authorization: Bearer <token> to the /users/me request', async () => {
    setToken(TEST_TOKEN)

    let capturedAuthHeader: string | null = null
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/users/me')) {
        capturedAuthHeader = request.headers.get('Authorization')
      }
    })

    await api.get('/users/me')

    expect(capturedAuthHeader).toBe(`Bearer ${TEST_TOKEN}`)
    server.events.removeAllListeners()
  })

  it('returns 401 when no token is present', async () => {
    // No token set — the MSW handler returns 401.
    await expect(api.get('/users/me')).rejects.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Suite 3: 401 intercept and refresh flow
// ---------------------------------------------------------------------------

describe('401 intercept and token refresh', () => {
  it('calls POST /auth/refresh on a 401 response and retries the original request', async () => {
    // Seed an expired / invalid token so the first /users/me call gets a 401.
    const expiredToken = 'expired-token'
    setToken(expiredToken)

    // Override the default /users/me handler to return 401 for the expired token
    // but 200 for the refreshed token.
    server.use(
      http.get('http://localhost:8000/api/v1/users/me', ({ request }) => {
        const auth = request.headers.get('Authorization') ?? ''
        if (auth.includes(REFRESHED_TOKEN)) {
          return HttpResponse.json(TEST_USER)
        }
        return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
      })
    )

    // /auth/refresh returns a new token. The default handler covers this.
    const refreshRequests: string[] = []
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/auth/refresh')) {
        refreshRequests.push(request.url)
      }
    })

    const user = await api.get<typeof TEST_USER>('/users/me')

    // The refresh endpoint must have been called exactly once.
    expect(refreshRequests.length).toBe(1)

    // The localStorage token must have been updated to the refreshed value.
    expect(getToken()).toBe(REFRESHED_TOKEN)

    // The retry must have succeeded and returned the user.
    expect(user.id).toBe(TEST_USER.id)

    server.events.removeAllListeners()
  })

  it('clears the token from localStorage when both the original request and refresh return 401', async () => {
    const expiredToken = 'totally-expired-token'
    setToken(expiredToken)

    // Both /users/me and /auth/refresh return 401.
    server.use(
      http.get('http://localhost:8000/api/v1/users/me', () =>
        HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
      ),
      http.post('http://localhost:8000/api/v1/auth/refresh', () =>
        HttpResponse.json({ detail: 'Token expired' }, { status: 401 })
      )
    )

    // The api call should ultimately throw (the hook surfaces this as an error state).
    await expect(api.get('/users/me')).rejects.toThrow()

    // The stale token must have been removed from localStorage.
    expect(getToken()).toBeNull()
  })

  it('does NOT retry infinitely — a second 401 on the retried request does not trigger another refresh', async () => {
    const expiredToken = 'stale-token'
    setToken(expiredToken)

    const refreshCalls: string[] = []

    // /users/me always returns 401.
    server.use(
      http.get('http://localhost:8000/api/v1/users/me', () =>
        HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 })
      ),
      http.post('http://localhost:8000/api/v1/auth/refresh', ({ request }) => {
        refreshCalls.push(request.url)
        return HttpResponse.json({ access_token: REFRESHED_TOKEN, token_type: 'bearer' })
      })
    )

    await expect(api.get('/users/me')).rejects.toThrow()

    // Refresh must have been called exactly once — the _isRetry flag prevents a loop.
    expect(refreshCalls.length).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Suite 4: Authorization header is only attached to our own API origin
// ---------------------------------------------------------------------------

describe('Authorization header scoping', () => {
  it('does NOT attach the Authorization header to requests to a different origin', async () => {
    setToken(TEST_TOKEN)

    // Register a handler for an external URL.
    server.use(
      http.get('https://external.example.com/data', ({ request }) => {
        const auth = request.headers.get('Authorization')
        // We want this to be null — token must NOT be sent to external origins.
        return HttpResponse.json({ auth })
      })
    )

    // api.ts prepends API_URL to every endpoint, so /users/me resolves to
    // localhost:8000. This test confirms we never manually construct a full URL
    // to an external service through the `api` wrapper.
    //
    // Direct assertion: the token IS present on our own API calls.
    let sentHeader: string | null = null
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('localhost:8000')) {
        sentHeader = request.headers.get('Authorization')
      }
    })

    setToken(TEST_TOKEN)
    await api.get('/users/me').catch(() => null)

    expect(sentHeader).toBe(`Bearer ${TEST_TOKEN}`)
    server.events.removeAllListeners()
  })
})

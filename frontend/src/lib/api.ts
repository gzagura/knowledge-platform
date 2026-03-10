const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Single authoritative key for the JWT in localStorage.
// Every file that reads or writes the token MUST import and use this constant.
export const TOKEN_KEY = 'kp_access_token'

// Convert snake_case keys to camelCase recursively
function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(transformKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        toCamel(k),
        transformKeys(v),
      ])
    )
  }
  return obj
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
  _isRetry?: boolean
}

async function apiCall<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Only attach the Authorization header to requests aimed at our own API origin.
  const url = `${API_URL}${endpoint}`

  const { _isRetry, ...fetchOptions } = options
  const response = await fetch(url, { ...fetchOptions, headers })

  if (response.status === 401 && typeof window !== 'undefined') {
    if (!_isRetry) {
      // Attempt a silent token refresh before giving up.
      const currentToken = localStorage.getItem(TOKEN_KEY)
      if (currentToken) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentToken}`,
            },
          })

          if (refreshResponse.ok) {
            const refreshData = (await refreshResponse.json()) as {
              access_token: string
            }
            localStorage.setItem(TOKEN_KEY, refreshData.access_token)
            // Retry the original request with the new token.
            return apiCall<T>(endpoint, { ...options, _isRetry: true })
          }
        } catch {
          // Refresh request itself failed (network error). Fall through to logout.
        }
      }
    }

    // Either this was already a retry, there was no token, or refresh failed.
    // Clear the stale token and auth cookie, then redirect the user to login.
    localStorage.removeItem(TOKEN_KEY)
    document.cookie = 'kp_auth=; path=/; max-age=0; SameSite=Lax'
    // Determine the current locale from the pathname so we produce a
    // locale-aware redirect URL (e.g. /en/login) instead of a bare /login.
    const pathParts = window.location.pathname.split('/')
    const locale = ['en', 'uk', 'ru'].includes(pathParts[1] ?? '')
      ? pathParts[1]
      : 'en'
    window.location.href = `/${locale}/login`
    throw new Error('Session expired. Please log in again.')
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText)
    throw new Error(`API Error ${response.status}: ${errorText}`)
  }

  if (response.status === 204) return undefined as T

  const json = await response.json()
  return transformKeys(json) as T
}

export const api = {
  get: <T,>(endpoint: string) => apiCall<T>(endpoint, { method: 'GET' }),
  post: <T,>(endpoint: string, data?: unknown) =>
    apiCall<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T,>(endpoint: string, data?: unknown) =>
    apiCall<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
  patch: <T,>(endpoint: string, data?: unknown) =>
    apiCall<T>(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
  delete: <T,>(endpoint: string) => apiCall<T>(endpoint, { method: 'DELETE' }),
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

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
}

async function apiCall<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
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

import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/saved', '/profile', '/settings']
const SUPPORTED_LOCALES = ['en', 'uk', 'ru'] as const
const DEFAULT_LOCALE = 'en'

const handleI18nRouting = createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
})

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Determine the current locale from the path segment, e.g. /en/saved -> 'en'
  const pathParts = pathname.split('/')
  const locale = SUPPORTED_LOCALES.includes(pathParts[1] as typeof SUPPORTED_LOCALES[number])
    ? pathParts[1]
    : DEFAULT_LOCALE

  // Strip the locale prefix to get the bare path, e.g. /en/saved -> /saved
  const barePath = pathParts.slice(2).join('/')
  const isProtected = PROTECTED_PATHS.some(
    (p) => `/${barePath}` === p || `/${barePath}`.startsWith(`${p}/`)
  )

  if (isProtected) {
    // The JWT lives in localStorage which is inaccessible from middleware (edge runtime).
    // We rely on a cookie written by the client as a lightweight auth signal.
    // The cookie is named 'kp_auth' and is set to '1' by the login flow.
    // This provides a fast edge-level redirect without exposing the token to the server.
    const authCookie = request.cookies.get('kp_auth')
    if (!authCookie || !authCookie.value) {
      const loginUrl = new URL(`/${locale}/login`, request.url)
      // Preserve the originally requested URL so login can redirect back after success.
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

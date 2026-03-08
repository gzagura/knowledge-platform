import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'

const handleI18nRouting = createMiddleware({
  locales: ['en', 'uk', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export function middleware(request: NextRequest) {
  return handleI18nRouting(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}

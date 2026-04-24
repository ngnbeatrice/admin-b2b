import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { locales, defaultLocale } from '@/constants/i18n'
import { routing } from '@/lib/routing'

const handleI18nRouting = createMiddleware(routing)

/** Public paths that don't require authentication (after locale prefix). */
const PUBLIC_PATHS = ['/login']

function extractLocale(pathname: string): string {
  const segment = pathname.split('/')[1]
  return (locales as readonly string[]).includes(segment) ? segment : defaultLocale
}

function isPublicPath(pathname: string): boolean {
  // Strip locale prefix (e.g. /en/login → /login)
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')
  return PUBLIC_PATHS.some((p) => withoutLocale === p || withoutLocale.startsWith(p + '/'))
}

function hasSessionCookie(req: NextRequest): boolean {
  // Auth.js v5 uses __Secure- prefix in production, no prefix in development
  return req.cookies.has('authjs.session-token') || req.cookies.has('__Secure-authjs.session-token')
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always run i18n routing first
  const i18nResponse = handleI18nRouting(req)

  const authenticated = hasSessionCookie(req)
  const locale = extractLocale(pathname)

  // Authenticated users hitting a public path (e.g. /login) → redirect to home
  if (isPublicPath(pathname) && authenticated) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url))
  }

  // Skip further auth checks for public paths
  if (isPublicPath(pathname)) {
    return i18nResponse
  }

  // Unauthenticated users hitting a protected path → redirect to login
  if (!authenticated) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url))
  }

  return i18nResponse
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
}

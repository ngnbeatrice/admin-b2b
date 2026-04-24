import { type NextRequest, NextResponse } from 'next/server'
import { describe, it, expect, vi } from 'vitest'

import { proxy } from './proxy'

// Mock next-intl middleware — just passes through
vi.mock('next-intl/middleware', () => ({
  default: () => () => NextResponse.next(),
}))

// Mock routing config
vi.mock('@/lib/routing', () => ({ routing: {} }))

function makeRequest(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  const url = `http://localhost${pathname}`
  const nextUrl = new URL(url) as NextRequest['nextUrl']

  return {
    nextUrl,
    url,
    cookies: {
      has: (name: string) => name in cookies,
      get: (name: string) => (name in cookies ? { name, value: cookies[name] } : undefined),
    },
  } as unknown as NextRequest
}

const SESSION_COOKIE = { 'authjs.session-token': 'abc123' }

describe('proxy — unauthenticated user', () => {
  it('redirects "/" to "/en/login"', () => {
    const res = proxy(makeRequest('/'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/en/login')
  })

  it('redirects "/en" to "/en/login"', () => {
    const res = proxy(makeRequest('/en'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/en/login')
  })

  it('redirects "/en/unknown" to "/en/login"', () => {
    const res = proxy(makeRequest('/en/unknown'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/en/login')
  })

  it('allows "/en/login" through without redirect', () => {
    const res = proxy(makeRequest('/en/login'))
    expect(res.status).not.toBe(307)
  })

  it('allows "/fr/login" through without redirect', () => {
    const res = proxy(makeRequest('/fr/login'))
    expect(res.status).not.toBe(307)
  })
})

describe('proxy — authenticated user', () => {
  it('redirects "/en/login" to "/en" (home)', () => {
    const res = proxy(makeRequest('/en/login', SESSION_COOKIE))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/en$/)
  })

  it('redirects "/fr/login" to "/fr" (home)', () => {
    const res = proxy(makeRequest('/fr/login', SESSION_COOKIE))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/fr$/)
  })

  it('allows "/en" through without redirect', () => {
    const res = proxy(makeRequest('/en', SESSION_COOKIE))
    expect(res.status).not.toBe(307)
  })

  it('allows "/en/unknown" through without redirect', () => {
    const res = proxy(makeRequest('/en/unknown', SESSION_COOKIE))
    expect(res.status).not.toBe(307)
  })
})

describe('proxy — __Secure- cookie (production)', () => {
  it('treats __Secure-authjs.session-token as authenticated', () => {
    const res = proxy(makeRequest('/en/login', { '__Secure-authjs.session-token': 'xyz' }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/en$/)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { LogoutUserUseCase } from './LogoutUserUseCase'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSignOut = vi.fn()
vi.mock('next-auth/react', () => ({ signOut: (...args: unknown[]) => mockSignOut(...args) }))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LogoutUserUseCase', () => {
  beforeEach(() => {
    mockSignOut.mockClear()
    mockSignOut.mockResolvedValue(undefined)
  })

  it('calls signOut', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/en/dashboard', origin: 'http://localhost' },
      writable: true,
    })

    await new LogoutUserUseCase().execute()

    expect(mockSignOut).toHaveBeenCalledOnce()
  })

  it('redirects to the login page of the current locale', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/en/dashboard', origin: 'http://localhost' },
      writable: true,
    })

    await new LogoutUserUseCase().execute()

    expect(mockSignOut).toHaveBeenCalledWith({
      callbackUrl: 'http://localhost/en/login',
    })
  })

  it('uses the fr locale when on a French path', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/fr/settings', origin: 'http://localhost' },
      writable: true,
    })

    await new LogoutUserUseCase().execute()

    expect(mockSignOut).toHaveBeenCalledWith({
      callbackUrl: 'http://localhost/fr/login',
    })
  })

  it('falls back to "en" when the path has no locale segment', async () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/', origin: 'http://localhost' },
      writable: true,
    })

    await new LogoutUserUseCase().execute()

    expect(mockSignOut).toHaveBeenCalledWith({
      callbackUrl: 'http://localhost/en/login',
    })
  })
})

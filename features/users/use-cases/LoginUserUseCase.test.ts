import bcrypt from 'bcryptjs'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the env module BEFORE importing LoginUserUseCase
vi.mock('@/lib/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NEXTAUTH_URL: 'http://localhost:3000',
    NEXTAUTH_SECRET: 'test-secret-key-for-testing-only',
    SHOPIFY_STORE_URL: 'https://test.myshopify.com',
    SHOPIFY_CLIENT_ID: 'test-client-id',
    SHOPIFY_CLIENT_SECRET: 'test-client-secret',
    MAX_LOGIN_ATTEMPTS: 3,
  },
}))

import { DatabaseError, InvalidCredentialsError, LoginUserUseCase } from './LoginUserUseCase'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRepository(overrides: Partial<ReturnType<typeof makeDefaultRepo>> = {}) {
  return { ...makeDefaultRepo(), ...overrides }
}

function makeDefaultRepo() {
  return {
    findByEmailWithPassword: vi.fn(),
    incrementFailedLoginAttempts: vi.fn(),
    resetFailedLoginAttempts: vi.fn(),
    blockUser: vi.fn(),
  }
}

const HASHED_PASSWORD = bcrypt.hashSync('correct-password', 10)

const VALID_USER = {
  id: 'user-1',
  email: 'admin@example.com',
  password: HASHED_PASSWORD,
  failedLoginAttempts: 0,
  blockedAt: null,
  blockedBy: null,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginUserUseCase', () => {
  let repo: ReturnType<typeof makeRepository>
  let useCase: LoginUserUseCase

  beforeEach(() => {
    repo = makeRepository()
    useCase = new LoginUserUseCase(repo as never)
  })

  it('returns a LoginViewModel on valid credentials', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(VALID_USER)

    const result = await useCase.execute('admin@example.com', 'correct-password')

    expect(result).toEqual({ id: 'user-1', email: 'admin@example.com' })
  })

  it('throws InvalidCredentialsError when email is not found', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(null)

    await expect(useCase.execute('unknown@example.com', 'any-password')).rejects.toThrow(
      InvalidCredentialsError
    )
  })

  it('throws InvalidCredentialsError when password is wrong', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(VALID_USER)

    await expect(useCase.execute('admin@example.com', 'wrong-password')).rejects.toThrow(
      InvalidCredentialsError
    )
  })

  it('does not expose which field was wrong (same error for both cases)', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(null)
    const errorForBadEmail = await useCase.execute('x@x.com', 'pass').catch((e: Error) => e.message)

    repo.findByEmailWithPassword.mockResolvedValue(VALID_USER)
    const errorForBadPassword = await useCase
      .execute('admin@example.com', 'wrong')
      .catch((e: Error) => e.message)

    expect(errorForBadEmail).toBe(errorForBadPassword)
  })

  it('never returns the password hash in the view model', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(VALID_USER)

    const result = await useCase.execute('admin@example.com', 'correct-password')

    expect(result).not.toHaveProperty('password')
  })
})

describe('LoginUserUseCase — database errors', () => {
  let repo: ReturnType<typeof makeRepository>
  let useCase: LoginUserUseCase

  beforeEach(() => {
    repo = makeRepository()
    useCase = new LoginUserUseCase(repo as never)
  })

  it('throws DatabaseError when the repository rejects', async () => {
    repo.findByEmailWithPassword.mockRejectedValue(new Error('Connection refused'))

    await expect(useCase.execute('admin@example.com', 'password')).rejects.toThrow(DatabaseError)
  })

  it('throws DatabaseError on timeout (10s)', async () => {
    vi.useFakeTimers()

    // Never resolves — simulates a hanging DB query
    repo.findByEmailWithPassword.mockReturnValue(new Promise(() => {}))

    const promise = useCase.execute('admin@example.com', 'password')
    vi.advanceTimersByTime(10_000)

    await expect(promise).rejects.toThrow(DatabaseError)

    vi.useRealTimers()
  })

  it('does not throw DatabaseError for invalid credentials (only InvalidCredentialsError)', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(null)

    await expect(useCase.execute('admin@example.com', 'password')).rejects.toThrow(
      InvalidCredentialsError
    )
  })
})

describe('LoginUserUseCase — account blocking', () => {
  let repo: ReturnType<typeof makeRepository>
  let useCase: LoginUserUseCase

  beforeEach(() => {
    repo = makeRepository()
    useCase = new LoginUserUseCase(repo as never)
  })

  it('increments failed login attempts on wrong password', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(VALID_USER)

    await expect(useCase.execute('admin@example.com', 'wrong-password')).rejects.toThrow(
      InvalidCredentialsError
    )

    expect(repo.incrementFailedLoginAttempts).toHaveBeenCalledWith('user-1')
  })

  it('blocks user after 3 failed attempts', async () => {
    const userWith2Attempts = { ...VALID_USER, failedLoginAttempts: 2 }
    repo.findByEmailWithPassword.mockResolvedValue(userWith2Attempts)

    await expect(useCase.execute('admin@example.com', 'wrong-password')).rejects.toThrow(
      InvalidCredentialsError
    )

    expect(repo.incrementFailedLoginAttempts).toHaveBeenCalledWith('user-1')
    expect(repo.blockUser).toHaveBeenCalledWith('user-1', 'SYSTEM')
  })

  it('resets failed attempts on successful login', async () => {
    const userWith2Attempts = { ...VALID_USER, failedLoginAttempts: 2 }
    repo.findByEmailWithPassword.mockResolvedValue(userWith2Attempts)

    await useCase.execute('admin@example.com', 'correct-password')

    expect(repo.resetFailedLoginAttempts).toHaveBeenCalledWith('user-1')
  })

  it('does not reset attempts if already at 0', async () => {
    repo.findByEmailWithPassword.mockResolvedValue(VALID_USER)

    await useCase.execute('admin@example.com', 'correct-password')

    expect(repo.resetFailedLoginAttempts).not.toHaveBeenCalled()
  })

  it('throws AccountBlockedError when account is blocked', async () => {
    const blockedUser = {
      ...VALID_USER,
      blockedAt: new Date(),
      blockedBy: 'SYSTEM',
    }
    repo.findByEmailWithPassword.mockResolvedValue(blockedUser)

    await expect(useCase.execute('admin@example.com', 'correct-password')).rejects.toThrow(
      'Account is blocked due to too many failed login attempts'
    )
  })
})

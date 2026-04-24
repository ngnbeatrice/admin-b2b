import { describe, it, expect, vi } from 'vitest'

import type { UserEntity } from '../repository'

import { GetUserDetailsUseCase, UserNotFoundError } from './GetUserDetailsUseCase'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ENTITY: UserEntity = {
  id: 'user-1',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-15T00:00:00Z'),
  groups: [
    {
      group: {
        id: 'group-1',
        name: 'Admins',
        scopes: [
          { scope: { id: 'scope-1', name: 'users:read' } },
          { scope: { id: 'scope-2', name: 'users:write' } },
        ],
      },
    },
    {
      group: {
        id: 'group-2',
        name: 'Editors',
        scopes: [{ scope: { id: 'scope-3', name: 'content:write' } }],
      },
    },
  ],
}

function makeRepo(entity: UserEntity | null = ENTITY) {
  return { findById: vi.fn().mockResolvedValue(entity) }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GetUserDetailsUseCase', () => {
  it('returns a view model for an existing user', async () => {
    const useCase = new GetUserDetailsUseCase(makeRepo() as never)
    const result = await useCase.execute('user-1')

    expect(result.id).toBe('user-1')
    expect(result.email).toBe('alice@example.com')
  })

  it('throws UserNotFoundError when the user does not exist', async () => {
    const useCase = new GetUserDetailsUseCase(makeRepo(null) as never)

    await expect(useCase.execute('unknown-id')).rejects.toThrow(UserNotFoundError)
  })

  it('includes the user id in the UserNotFoundError message', async () => {
    const useCase = new GetUserDetailsUseCase(makeRepo(null) as never)

    await expect(useCase.execute('missing-123')).rejects.toThrow('missing-123')
  })

  it('includes all groups with their scopes', async () => {
    const useCase = new GetUserDetailsUseCase(makeRepo() as never)
    const result = await useCase.execute('user-1')

    expect(result.groups).toHaveLength(2)
    expect(result.groups[0].name).toBe('Admins')
    expect(result.groups[0].scopes).toEqual([
      { id: 'scope-1', name: 'users:read' },
      { id: 'scope-2', name: 'users:write' },
    ])
    expect(result.groups[1].name).toBe('Editors')
    expect(result.groups[1].scopes).toEqual([{ id: 'scope-3', name: 'content:write' }])
  })

  it('returns empty groups array for a user with no groups', async () => {
    const entityNoGroups: UserEntity = { ...ENTITY, groups: [] }
    const useCase = new GetUserDetailsUseCase(makeRepo(entityNoGroups) as never)
    const result = await useCase.execute('user-1')

    expect(result.groups).toEqual([])
  })

  it('formats createdAt as a long date string', async () => {
    const useCase = new GetUserDetailsUseCase(makeRepo() as never)
    const result = await useCase.execute('user-1', 'en')

    // dateStyle: 'long' produces e.g. "January 15, 2024"
    expect(result.createdAt).toMatch(/2024/)
    expect(typeof result.createdAt).toBe('string')
  })

  it('passes the locale to the mapper', async () => {
    const repo = makeRepo()
    const enResult = await new GetUserDetailsUseCase(repo as never).execute('user-1', 'en')
    const frResult = await new GetUserDetailsUseCase(repo as never).execute('user-1', 'fr')

    expect(enResult.createdAt).not.toBe(frResult.createdAt)
  })

  it('never exposes the password field', async () => {
    const useCase = new GetUserDetailsUseCase(makeRepo() as never)
    const result = await useCase.execute('user-1')

    expect(result).not.toHaveProperty('password')
  })

  it('calls findById with the correct user id', async () => {
    const repo = makeRepo()
    const useCase = new GetUserDetailsUseCase(repo as never)
    await useCase.execute('user-1')

    expect(repo.findById).toHaveBeenCalledWith('user-1')
  })
})

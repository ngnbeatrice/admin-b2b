import { describe, it, expect, vi } from 'vitest'

import type { UserEntity } from '../repository'

import { GetAllUsersUseCase } from './GetAllUsersUseCase'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ENTITY_WITH_GROUPS: UserEntity = {
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
  ],
}

const ENTITY_NO_GROUPS: UserEntity = {
  id: 'user-2',
  email: 'bob@example.com',
  createdAt: new Date('2024-03-10T00:00:00Z'),
  groups: [],
}

function makeRepo(entities: UserEntity[] = []) {
  return { findAll: vi.fn().mockResolvedValue(entities) }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GetAllUsersUseCase', () => {
  it('returns an empty array when there are no users', async () => {
    const useCase = new GetAllUsersUseCase(makeRepo() as never)
    expect(await useCase.execute()).toEqual([])
  })

  it('maps entities to view models', async () => {
    const useCase = new GetAllUsersUseCase(makeRepo([ENTITY_WITH_GROUPS]) as never)
    const result = await useCase.execute()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('user-1')
    expect(result[0].email).toBe('alice@example.com')
  })

  it('includes group names in the view model', async () => {
    const useCase = new GetAllUsersUseCase(makeRepo([ENTITY_WITH_GROUPS]) as never)
    const [user] = await useCase.execute()

    expect(user.groups).toEqual(['Admins'])
  })

  it('includes deduplicated scope names in the view model', async () => {
    const useCase = new GetAllUsersUseCase(makeRepo([ENTITY_WITH_GROUPS]) as never)
    const [user] = await useCase.execute()

    expect(user.scopes).toEqual(['users:read', 'users:write'])
  })

  it('returns empty groups and scopes for a user with no groups', async () => {
    const useCase = new GetAllUsersUseCase(makeRepo([ENTITY_NO_GROUPS]) as never)
    const [user] = await useCase.execute()

    expect(user.groups).toEqual([])
    expect(user.scopes).toEqual([])
  })

  it('formats createdAt using the provided locale', async () => {
    const useCase = new GetAllUsersUseCase(makeRepo([ENTITY_WITH_GROUPS]) as never)
    const [enUser] = await useCase.execute('en')
    const [frUser] = await new GetAllUsersUseCase(makeRepo([ENTITY_WITH_GROUPS]) as never).execute(
      'fr'
    )

    // Both should be non-empty strings but formatted differently
    expect(typeof enUser.createdAt).toBe('string')
    expect(enUser.createdAt).not.toBe(frUser.createdAt)
  })

  it('returns multiple users preserving order from repository', async () => {
    const useCase = new GetAllUsersUseCase(
      makeRepo([ENTITY_WITH_GROUPS, ENTITY_NO_GROUPS]) as never
    )
    const result = await useCase.execute()

    expect(result[0].id).toBe('user-1')
    expect(result[1].id).toBe('user-2')
  })

  it('never exposes the password field', async () => {
    const useCase = new GetAllUsersUseCase(makeRepo([ENTITY_WITH_GROUPS]) as never)
    const [user] = await useCase.execute()

    expect(user).not.toHaveProperty('password')
  })
})

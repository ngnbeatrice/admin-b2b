import { prisma } from '@/lib/prisma'

import type { UserEntity } from './entity/UserEntity'

export class UserRepository {
  async findAll(): Promise<UserEntity[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        failedLoginAttempts: true,
        blockedAt: true,
        blockedBy: true,
        createdAt: true,
        groups: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
                scopes: {
                  select: {
                    scope: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        groups: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
                scopes: {
                  select: {
                    scope: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  /** Fetches user with password hash and security fields — only use for authentication. */
  async findByEmailWithPassword(email: string): Promise<{
    id: string
    email: string
    password: string
    failedLoginAttempts: number
    blockedAt: Date | null
    blockedBy: string | null
  } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        failedLoginAttempts: true,
        blockedAt: true,
        blockedBy: true,
      },
    })
  }

  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
    })
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0 },
    })
  }

  async blockUser(userId: string, blockedBy: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        blockedAt: new Date(),
        blockedBy,
      },
    })
  }

  async findById(id: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        groups: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
                scopes: {
                  select: {
                    scope: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
  }
}

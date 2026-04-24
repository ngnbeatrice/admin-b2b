import { prisma } from '@/lib/prisma'

import type { UserEntity } from './entity/UserEntity'

export class UserRepository {
  async findAll(): Promise<UserEntity[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
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

  /** Fetches user with password hash — only use for authentication. */
  async findByEmailWithPassword(
    email: string
  ): Promise<{ id: string; email: string; password: string } | null> {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    })
  }

  async findById(id: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
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

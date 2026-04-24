import { prisma } from '@/lib/prisma'

import type { CollectionEntity } from './entity/CollectionEntity'

export class CollectionRepository {
  async findAll(): Promise<CollectionEntity[]> {
    return prisma.collection.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        colors: {
          select: {
            color: {
              select: {
                id: true,
                name: true,
                imagePath: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

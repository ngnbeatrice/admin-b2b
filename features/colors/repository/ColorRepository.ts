import { prisma } from '@/lib/prisma'

import type { ColorEntity } from './entity/ColorEntity'

export class ColorRepository {
  async findAll(): Promise<ColorEntity[]> {
    return prisma.color.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imagePath: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })
  }
}

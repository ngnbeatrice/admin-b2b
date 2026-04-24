import { prisma } from '@/lib/prisma'

import type { NewProductEntity } from './entity/NewProductEntity'

export class NewProductRepository {
  async findAll(): Promise<NewProductEntity[]> {
    return prisma.product.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        imagePath: true,
        createdAt: true,
        variants: {
          select: {
            id: true,
            title: true,
            sku: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        collections: {
          select: {
            collection: {
              select: {
                id: true,
                name: true,
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
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

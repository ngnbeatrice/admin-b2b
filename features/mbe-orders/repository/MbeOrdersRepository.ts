import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'

import type { MbeOrdersEntity } from './entity/MbeOrdersEntity'

export interface FindMbeOrdersFilters {
  dateFrom?: Date
  dateTo?: Date
  sku?: string
  trackingNumberMbe?: string
  recipientCompanyName?: string
}

export class MbeOrdersRepository {
  /**
   * Find MBE orders with optional filters
   * @param filters - Optional filters (dateFrom, dateTo, sku, trackingNumberMbe, recipientCompanyName)
   * @returns List of orders matching the criteria
   */
  async findAllByFilters(filters?: FindMbeOrdersFilters): Promise<MbeOrdersEntity[]> {
    const where: Prisma.MbeOrderWhereInput = {}

    // Add date range filter if provided
    if (filters?.dateFrom || filters?.dateTo) {
      where.creationTime = {}
      if (filters.dateFrom) {
        where.creationTime.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.creationTime.lte = filters.dateTo
      }
    }

    // Add optional filters
    if (filters?.sku) {
      where.products = {
        some: {
          sku: {
            contains: filters.sku,
            mode: 'insensitive',
          },
        },
      }
    }

    if (filters?.trackingNumberMbe) {
      where.trackingNumberMbe = {
        contains: filters.trackingNumberMbe,
        mode: 'insensitive',
      }
    }

    if (filters?.recipientCompanyName) {
      where.recipientCompanyName = {
        contains: filters.recipientCompanyName,
        mode: 'insensitive',
      }
    }

    return prisma.mbeOrder.findMany({
      where,
      include: {
        products: true,
      },
      orderBy: {
        creationTime: 'desc',
      },
    })
  }

  /**
   * Save or update multiple orders independently (no transaction, no rollback)
   * Uses upsert to create new orders or update existing ones based on the 'id' field
   * Products are replaced entirely - all existing products are deleted and new ones are created
   * If an order fails to save, attempts to save a minimal error record with id and num = "[original_num] - SYNC ERROR"
   * Each order is processed independently - failures don't affect other orders
   * Returns all successfully saved entities (including error records)
   */
  async saveMany(
    entities: Omit<MbeOrdersEntity, 'mbeOrdersId' | 'createdAt' | 'updatedAt'>[]
  ): Promise<MbeOrdersEntity[]> {
    const savedEntities: MbeOrdersEntity[] = []

    for (const entity of entities) {
      try {
        const { products, ...orderData } = entity

        console.log(
          `Save or update MBE order in database ${orderData.num}, ${orderData.creationTime}`
        )
        // Upsert the order (create if doesn't exist, update if exists)
        const upsertedOrder = await prisma.mbeOrder.upsert({
          where: { id: orderData.id },
          create: {
            ...orderData,
            recipient: orderData.recipient as Prisma.InputJsonValue,
          },
          update: {
            ...orderData,
            recipient: orderData.recipient as Prisma.InputJsonValue,
          },
        })

        // Delete all existing products for this order first
        await prisma.mbeOrdersProduct.deleteMany({
          where: { orderId: upsertedOrder.id },
        })

        // Then create all products from the incoming entity
        if (products && products.length > 0) {
          await prisma.mbeOrdersProduct.createMany({
            data: products.map((product) => ({
              orderId: upsertedOrder.id,
              productId: product.productId,
              sku: product.sku,
              description: product.description,
              quantity: product.quantity,
            })),
          })
        }

        // Fetch the complete order with products to return
        const savedOrder = await prisma.mbeOrder.findUniqueOrThrow({
          where: { id: upsertedOrder.id },
          include: { products: true },
        })

        savedEntities.push(savedOrder as MbeOrdersEntity)
      } catch (error) {
        console.error(`Failed to save order ${entity.id}, attempting to save error record:`, error)

        // Try to save a minimal error record
        try {
          const errorRecord = await prisma.mbeOrder.upsert({
            where: { id: entity.id },
            create: {
              id: entity.id,
              num: `${entity.num ?? entity.id} - SYNC ERROR`,
              deposit: null,
              departmentId: null,
              date: null,
              reason: null,
              transport: null,
              portShipment: null,
              note: null,
              operator: null,
              shippingPackages: null,
              trackingNumber: null,
              trackingNumberMbe: null,
              state: null,
              stateDescription: null,
              workingState: null,
              workingStateDescription: null,
              creationTime: entity.creationTime,
              recipientCompanyName: null,
              recipient: Prisma.JsonNull,
            },
            update: {
              num: `${entity.num ?? entity.id} - SYNC ERROR`,
            },
            include: { products: true },
          })

          savedEntities.push(errorRecord as MbeOrdersEntity)
        } catch (fallbackError) {
          console.error(`Failed to save error record for order ${entity.id}:`, fallbackError)
          // Continue processing other orders even if this one completely fails
        }
      }
    }

    console.log(`Save or update MBE order finished`)
    return savedEntities
  }

  /**
   * Find an MBE order by its ID
   * @param orderId - The ID of the order to find
   * @returns The order entity or null if not found
   */
  async findById(orderId: string): Promise<MbeOrdersEntity | null> {
    return prisma.mbeOrder.findUnique({
      where: { id: orderId },
      include: { products: true },
    }) as Promise<MbeOrdersEntity | null>
  }

  /**
   * Delete an MBE order by its ID
   * Cascading delete will automatically remove associated products
   * @param orderId - The ID of the order to delete
   * @returns The deleted order entity
   */
  async deleteById(orderId: string): Promise<MbeOrdersEntity> {
    return prisma.mbeOrder.delete({
      where: { id: orderId },
      include: { products: true },
    }) as Promise<MbeOrdersEntity>
  }
}

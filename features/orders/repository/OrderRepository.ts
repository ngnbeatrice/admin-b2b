import { prisma } from '@/lib/prisma'

import type { OrderEntity } from './entity/OrderEntity'
import type { OrderItemEntity } from './entity/OrderItemEntity'

export interface CreateOrderData {
  customerEmail: string
  totalQuantity: number
  totalAmount: number
  status: string
  createdBy: string | null
  items: Array<{
    productId: string
    productTitle: string
    productImageUrl: string | null
    variantId: string
    variantTitle: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
}

export interface OrderWithItemsEntity extends OrderEntity {
  items: OrderItemEntity[]
}

export class OrderRepository {
  async findAll(): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        customerEmail: true,
        totalQuantity: true,
        totalAmount: true,
        paid: true,
        status: true,
        createdAt: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    }))
  }

  async findById(id: string): Promise<OrderWithItemsEntity | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        customerEmail: true,
        totalQuantity: true,
        totalAmount: true,
        paid: true,
        status: true,
        createdAt: true,
        createdBy: true,
        items: {
          select: {
            id: true,
            orderId: true,
            productId: true,
            productTitle: true,
            productImageUrl: true,
            variantId: true,
            variantTitle: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!order) return null

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }
  }

  async create(data: CreateOrderData): Promise<OrderEntity> {
    const order = await prisma.order.create({
      data: {
        customerEmail: data.customerEmail,
        totalQuantity: data.totalQuantity,
        totalAmount: data.totalAmount,
        status: data.status,
        createdBy: data.createdBy,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productTitle: item.productTitle,
            productImageUrl: item.productImageUrl,
            variantId: item.variantId,
            variantTitle: item.variantTitle,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      select: {
        id: true,
        customerEmail: true,
        totalQuantity: true,
        totalAmount: true,
        paid: true,
        status: true,
        createdAt: true,
        createdBy: true,
      },
    })

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
    }
  }
}

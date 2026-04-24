import type { OrderRepository } from '../repository'

import type { SendOrderRequest } from './SendOrderRequest'

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(request: SendOrderRequest, createdBy: string | null): Promise<void> {
    await this.orderRepository.create({
      customerEmail: request.customerEmail,
      totalQuantity: request.totalQuantity,
      totalAmount: request.totalAmount,
      status: 'Sent order',
      createdBy,
      items: request.items.map((item) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        productImageUrl: item.productImage,
        variantId: item.variantId,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.quantity * item.price,
      })),
    })
  }
}

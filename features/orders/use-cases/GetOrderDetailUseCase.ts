import type { OrderRepository } from '../repository'

import { OrderMapper } from './mapper/OrderMapper'
import type { GetOrderDetailViewModel } from './user-view/GetOrderDetailViewModel'

export class GetOrderDetailUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string): Promise<GetOrderDetailViewModel | null> {
    const entity = await this.orderRepository.findById(orderId)
    if (!entity) return null
    return OrderMapper.toGetOrderDetailViewModel(entity)
  }
}

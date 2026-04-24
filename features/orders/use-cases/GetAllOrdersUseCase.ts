import type { OrderRepository } from '../repository'

import { OrderMapper } from './mapper/OrderMapper'
import type { GetAllOrdersViewModel } from './user-view/GetAllOrdersViewModel'

export class GetAllOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<GetAllOrdersViewModel[]> {
    const entities = await this.orderRepository.findAll()
    return entities.map(OrderMapper.toGetAllOrdersViewModel)
  }
}

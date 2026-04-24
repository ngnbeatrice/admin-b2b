import type { NewProductRepository } from '../repository'

import { NewProductMapper } from './mapper/NewProductMapper'
import type { GetAllNewProductsViewModel } from './user-view/GetAllNewProductsViewModel'

export class GetAllNewProductsUseCase {
  constructor(private readonly newProductRepository: NewProductRepository) {}

  async execute(locale?: string): Promise<GetAllNewProductsViewModel[]> {
    const entities = await this.newProductRepository.findAll()
    const domain = entities.map(NewProductMapper.toDomain)
    return domain.map((p) => NewProductMapper.toGetAllViewModel(p, locale))
  }
}

import type { CollectionRepository } from '../repository'

import { CollectionMapper } from './mapper/CollectionMapper'
import type { GetAllCollectionsViewModel } from './user-view/GetAllCollectionsViewModel'

export class GetAllCollectionsUseCase {
  constructor(private readonly collectionRepository: CollectionRepository) {}

  async execute(locale?: string): Promise<GetAllCollectionsViewModel[]> {
    const entities = await this.collectionRepository.findAll()
    const domain = entities.map(CollectionMapper.toDomain)
    return domain.map((c) => CollectionMapper.toGetAllViewModel(c, locale))
  }
}

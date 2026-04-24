import { getStorageUrl } from '@/lib/storage'

import type { CollectionEntity } from '../../repository'
import { Collection } from '../domain/Collection'
import type { GetAllCollectionsViewModel } from '../user-view/GetAllCollectionsViewModel'

export class CollectionMapper {
  /** Entity (DB row) → Domain object */
  static toDomain(entity: CollectionEntity): Collection {
    return new Collection(
      entity.id,
      entity.name,
      entity.description,
      entity.createdAt,
      entity.colors.map((cc) => ({
        id: cc.color.id,
        name: cc.color.name,
        imagePath: cc.color.imagePath,
      }))
    )
  }

  /** Domain object → GetAllCollections view model */
  static toGetAllViewModel(domain: Collection, locale = 'en'): GetAllCollectionsViewModel {
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      createdAt: domain.createdAt.toLocaleDateString(locale, { dateStyle: 'medium' }),
      colors: domain.colors.map((c) => ({
        id: c.id,
        name: c.name,
        imageUrl: getStorageUrl(c.imagePath),
      })),
    }
  }
}

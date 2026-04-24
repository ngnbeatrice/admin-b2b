import { getStorageUrl } from '@/lib/storage'

import type { NewProductEntity } from '../../repository'
import { NewProduct } from '../domain/NewProduct'
import type { GetAllNewProductsViewModel } from '../user-view/GetAllNewProductsViewModel'

export class NewProductMapper {
  /** Entity (DB row) → Domain object */
  static toDomain(entity: NewProductEntity): NewProduct {
    return new NewProduct(
      entity.id,
      entity.title,
      entity.description,
      entity.priceCents,
      entity.imagePath,
      entity.createdAt,
      entity.variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
      })),
      entity.collections.map((pc) => ({
        id: pc.collection.id,
        name: pc.collection.name,
        colors: pc.collection.colors.map((cc) => ({
          id: cc.color.id,
          name: cc.color.name,
          imagePath: cc.color.imagePath,
        })),
      }))
    )
  }

  /** Domain object → GetAllNewProducts view model */
  static toGetAllViewModel(domain: NewProduct, locale = 'en'): GetAllNewProductsViewModel {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      price: domain.priceFormatted,
      imageUrl: getStorageUrl(domain.imagePath),
      createdAt: domain.createdAt.toLocaleDateString(locale, { dateStyle: 'medium' }),
      skus: domain.variants.map((v) => ({ title: v.title, sku: v.sku })),
      collections: domain.collections.map((c) => ({
        id: c.id,
        name: c.name,
        colors: c.colors.map((col) => ({
          id: col.id,
          name: col.name,
          imageUrl: getStorageUrl(col.imagePath),
        })),
      })),
    }
  }
}

import type { ShopifyProductDTO, ShopifyProductDetailDTO } from '../../client/dto/ShopifyProductDTO'
import { Product, ProductDetail } from '../domain/Product'
import type { GetAllProductsForCreateOrderViewModel } from '../user-view/GetAllProductsForCreateOrderViewModel'
import type { GetAllProductsViewModel } from '../user-view/GetAllProductsViewModel'
import type { GetProductDetailsViewModel } from '../user-view/GetProductDetailsViewModel'

/** Extracts the numeric ID from a Shopify GID (e.g. "gid://shopify/Product/123" → "123") */
function extractNumericId(gid: string): string {
  return gid.split('/').pop() ?? gid
}

export class ProductMapper {
  /** Shopify list DTO → Domain object */
  static toDomain(dto: ShopifyProductDTO): Product {
    return new Product(
      dto.id,
      dto.title,
      dto.tags,
      dto.featuredImage?.url ?? null,
      dto.featuredImage?.altText ?? null,
      dto.collections.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle ?? '',
        descriptionHtml: node.descriptionHtml ?? '',
      })),
      dto.variants.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        sku: node.sku,
        inventoryQuantity: node.inventoryQuantity,
        price: node.price,
        imageUrl: node.image?.url ?? null,
      }))
    )
  }

  /** Shopify detail DTO → Domain object */
  static toDetailDomain(dto: ShopifyProductDetailDTO): ProductDetail {
    return new ProductDetail(
      dto.id,
      dto.title,
      dto.productType,
      dto.description,
      dto.descriptionHtml,
      dto.tags,
      dto.options,
      dto.featuredImage?.url ?? null,
      dto.featuredImage?.altText ?? null,
      dto.collections.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle ?? '',
        descriptionHtml: node.descriptionHtml ?? '',
      })),
      dto.variants.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        sku: node.sku,
        barcode: node.barcode,
        selectedOptions: node.selectedOptions,
        inventoryLevels: node.inventoryItem.inventoryLevels.edges.map(({ node: level }) => ({
          locationName: level.location.name,
          availableQuantity: level.quantities.find((q) => q.name === 'available')?.quantity ?? 0,
        })),
      }))
    )
  }

  /** Domain → GetAllProducts view model */
  static toGetAllViewModel(domain: Product): GetAllProductsViewModel {
    return {
      id: domain.id,
      numericId: extractNumericId(domain.id),
      title: domain.title,
      tags: domain.tags,
      featuredImageUrl: domain.featuredImageUrl,
      featuredImageAlt: domain.featuredImageAlt,
      collections: domain.collections.map((c) => ({ id: c.id, title: c.title })),
      totalInventory: domain.totalInventory,
      inStock: domain.inStock,
      variants: domain.variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        inventoryQuantity: v.inventoryQuantity,
        price: v.price,
        imageUrl: v.imageUrl,
      })),
    }
  }

  /** Domain → GetAllProductsForCreateOrder view model */
  static toGetAllForCreateOrderViewModel(domain: Product): GetAllProductsForCreateOrderViewModel {
    return {
      id: domain.id,
      numericId: extractNumericId(domain.id),
      title: domain.title,
      tags: domain.tags,
      featuredImageUrl: domain.featuredImageUrl,
      featuredImageAlt: domain.featuredImageAlt,
      collections: domain.collections.map((c) => ({ id: c.id, title: c.title })),
      totalInventory: domain.totalInventory,
      inStock: domain.inStock,
      variants: domain.variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        inventoryQuantity: v.inventoryQuantity,
        price: v.price,
        imageUrl: v.imageUrl,
      })),
    }
  }

  /** Domain → GetProductDetails view model */
  static toGetDetailsViewModel(domain: ProductDetail): GetProductDetailsViewModel {
    return {
      id: domain.id,
      title: domain.title,
      productType: domain.productType,
      description: domain.description,
      descriptionHtml: domain.descriptionHtml,
      tags: domain.tags,
      options: domain.options,
      featuredImageUrl: domain.featuredImageUrl,
      featuredImageAlt: domain.featuredImageAlt,
      collections: domain.collections.map((c) => ({ id: c.id, title: c.title, handle: c.handle })),
      variants: domain.variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        barcode: v.barcode,
        selectedOptions: v.selectedOptions,
        inventoryLevels: v.inventoryLevels,
        totalAvailable: v.inventoryLevels.reduce((s, l) => s + l.availableQuantity, 0),
      })),
      totalInventory: domain.totalInventory,
      inStock: domain.inStock,
    }
  }
}

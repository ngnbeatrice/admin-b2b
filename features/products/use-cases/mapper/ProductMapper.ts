import type { ShopifyProductDTO, ShopifyProductDetailDTO } from '../../client/dto/ShopifyProductDTO'
import type { MbeProductVariant } from '../../service/types/MbeProductVariant'
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
      dto.status,
      dto.tags,
      dto.featuredImage?.url ?? null,
      dto.featuredImage?.altText ?? null,
      dto.collections.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle ?? '',
        descriptionHtml: node.descriptionHtml ?? '',
      })),
      dto.variants.edges.map(({ node }) => {
        // Extract on_hand quantity from the new inventoryItem structure
        const onHandQuantity =
          node.inventoryItem.inventoryLevels.edges[0]?.node.quantities.find(
            (q) => q.name === 'on_hand'
          )?.quantity ?? 0

        return {
          id: node.id,
          title: node.title,
          sku: node.sku,
          inventoryQuantity: onHandQuantity,
          price: node.price,
          imageUrl: node.image?.url ?? null,
        }
      })
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
        imageUrl: node.image?.url ?? null,
        inventoryLevels: node.inventoryItem.inventoryLevels.edges.map(({ node: level }) => ({
          locationName: level.location.name,
          committedQuantity: level.quantities.find((q) => q.name === 'committed')?.quantity ?? 0,
          availableQuantity: level.quantities.find((q) => q.name === 'available')?.quantity ?? 0,
          onHandQuantity: level.quantities.find((q) => q.name === 'on_hand')?.quantity ?? 0,
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
      status: domain.status,
      tags: domain.tags,
      featuredImageUrl: domain.featuredImageUrl,
      featuredImageAlt: domain.featuredImageAlt,
      collections: domain.collections.map((c) => ({ id: c.id, title: c.title })),
      totalInventory: domain.totalInventory,
      inStock: domain.inStock,
      variants: domain.variants.map((v) => ({
        id: v.id,
        shopifyTitle: v.title,
        shopifySku: v.sku,
        shopifyInventoryQuantity: v.inventoryQuantity,
        shopifyPrice: v.price,
        shopifyImageUrl: v.imageUrl,
        mbeDescription: null,
        mbeStock: null,
        mbeCustomerOrder: null,
        mbeDisponibility: null,
      })),
    }
  }

  /** Domain → GetAllProducts view model with MBE data merged */
  static toGetAllViewModelWithMbe(
    domain: Product,
    mbeVariants: MbeProductVariant[]
  ): GetAllProductsViewModel {
    // Create a map of SKU → MBE data for fast lookup
    const mbeMap = new Map<string, MbeProductVariant>()
    mbeVariants.forEach((mbeVariant) => {
      mbeMap.set(mbeVariant.sku, mbeVariant)
    })

    return {
      id: domain.id,
      numericId: extractNumericId(domain.id),
      title: domain.title,
      status: domain.status,
      tags: domain.tags,
      featuredImageUrl: domain.featuredImageUrl,
      featuredImageAlt: domain.featuredImageAlt,
      collections: domain.collections.map((c) => ({ id: c.id, title: c.title })),
      totalInventory: domain.totalInventory,
      inStock: domain.inStock,
      variants: domain.variants.map((v) => {
        const mbeData = mbeMap.get(v.sku)
        return {
          id: v.id,
          shopifyTitle: v.title,
          shopifySku: v.sku,
          shopifyInventoryQuantity: v.inventoryQuantity,
          shopifyPrice: v.price,
          shopifyImageUrl: v.imageUrl,
          mbeDescription: mbeData?.description ?? null,
          mbeStock: mbeData?.stock ?? null,
          mbeCustomerOrder: mbeData?.customer_order ?? null,
          mbeDisponibility: mbeData?.disponibility ?? null,
        }
      }),
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
        shopifyTitle: v.title,
        shopifySku: v.sku,
        shopifyInventoryQuantity: v.inventoryQuantity,
        shopifyPrice: v.price,
        shopifyImageUrl: v.imageUrl,
      })),
    }
  }

  /** Domain → GetProductDetails view model */
  static toGetDetailsViewModel(
    domain: ProductDetail,
    mbeVariants: MbeProductVariant[] = []
  ): GetProductDetailsViewModel {
    // Create a map of SKU → MBE data for fast lookup
    const mbeMap = new Map<string, MbeProductVariant>()
    mbeVariants.forEach((mbeVariant) => {
      mbeMap.set(mbeVariant.sku, mbeVariant)
    })

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
      variants: domain.variants.map((v) => {
        const mbeData = mbeMap.get(v.sku)
        return {
          id: v.id,
          title: v.title,
          sku: v.sku,
          barcode: v.barcode,
          selectedOptions: v.selectedOptions,
          imageUrl: v.imageUrl,
          inventoryLevels: v.inventoryLevels,
          totalCommitted: v.inventoryLevels.reduce((s, l) => s + l.committedQuantity, 0),
          totalAvailable: v.inventoryLevels.reduce((s, l) => s + l.availableQuantity, 0),
          totalOnHand: v.inventoryLevels.reduce((s, l) => s + l.onHandQuantity, 0),
          mbeStock: mbeData?.stock ?? null,
          mbeCustomerOrder: mbeData?.customer_order ?? null,
          mbeDisponibility: mbeData?.disponibility ?? null,
        }
      }),
      totalInventory: domain.totalInventory,
      inStock: domain.inStock,
    }
  }
}

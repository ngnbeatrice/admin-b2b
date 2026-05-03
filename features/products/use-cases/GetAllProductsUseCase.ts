import { MbeClient } from '../client/MbeClient'
import type { ShopifyClient } from '../client/ShopifyClient'
import { GetAllMbeProductVariantService } from '../service/GetAllMbeProductVariantService'
import type { MbeProductVariant } from '../service/types/MbeProductVariant'

import { ProductMapper } from './mapper/ProductMapper'
import type { GetAllProductsViewModel } from './user-view/GetAllProductsViewModel'

/**
 * Fetches the total product count from Shopify, then retrieves all products.
 * Simultaneously fetches MBE warehouse data and merges it with Shopify products.
 * Maps Shopify DTOs → Domain → ViewModel before returning.
 */
export class GetAllProductsUseCase {
  constructor(
    private readonly shopifyClient: ShopifyClient,
    private readonly mbeClient: MbeClient
  ) {}

  async execute(): Promise<{
    products: GetAllProductsViewModel[]
    total: number
    orphanedMbeVariants: MbeProductVariant[]
    mbeDataAvailable: boolean
  }> {
    const countResponse = await this.shopifyClient.getProductsCount()
    const total = countResponse.data.productsCount.count

    if (total === 0) {
      return { products: [], total: 0, orphanedMbeVariants: [], mbeDataAvailable: false }
    }

    // Fetch Shopify products (required) and MBE warehouse data (optional) in parallel
    const [productsResponse, mbeResult] = await Promise.all([
      this.shopifyClient.getProducts(total),
      this.fetchMbeDataSafely(),
    ])

    const mbeVariants = mbeResult.variants
    const mbeDataAvailable = mbeResult.success

    // Collect all Shopify SKUs
    const shopifySkus = new Set<string>()
    productsResponse.data.products.edges.forEach(({ node }) => {
      node.variants.edges.forEach(({ node: variant }) => {
        if (variant.sku) shopifySkus.add(variant.sku)
      })
    })

    // Find MBE variants that don't exist in Shopify (only if MBE data is available)
    const orphanedMbeVariants = mbeDataAvailable
      ? mbeVariants.filter((mbeVariant) => !shopifySkus.has(mbeVariant.sku))
      : []

    // Map Shopify products to domain and merge with MBE data (if available)
    const products = productsResponse.data.products.edges
      .map(({ node }) => ProductMapper.toDomain(node))
      .map((domain) => ProductMapper.toGetAllViewModelWithMbe(domain, mbeVariants))

    return { products, total, orphanedMbeVariants, mbeDataAvailable }
  }

  /**
   * Attempts to fetch MBE data. If it fails, logs the error and returns empty data.
   * This ensures Shopify products can still be displayed even if MBE is unavailable.
   */
  private async fetchMbeDataSafely(): Promise<{
    variants: MbeProductVariant[]
    success: boolean
  }> {
    try {
      const variants = await new GetAllMbeProductVariantService(this.mbeClient).getAll()
      return { variants, success: true }
    } catch (error) {
      console.error('Failed to fetch MBE data, continuing with Shopify data only:', error)
      return { variants: [], success: false }
    }
  }
}

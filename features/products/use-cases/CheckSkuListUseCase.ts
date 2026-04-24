import type { ShopifyClient } from '../client/ShopifyClient'

export interface SkuCheckResult {
  sku: string
  exists: boolean
}

/**
 * Checks a list of SKUs against Shopify and returns existence status for each.
 */
export class CheckSkuListUseCase {
  constructor(private readonly shopifyClient: ShopifyClient) {}

  async execute(skus: string[]): Promise<SkuCheckResult[]> {
    if (skus.length === 0) return []

    const response = await this.shopifyClient.checkSkus(skus)

    if (!response.data?.productVariants) {
      // Log for debugging — Shopify may have returned errors
      console.error('[CheckSkuListUseCase] Unexpected Shopify response:', JSON.stringify(response))
      return skus.map((sku) => ({ sku, exists: false }))
    }

    const edges = response.data.productVariants.edges
    const foundSkus = new Set(edges.map(({ node }: { node: { sku: string } }) => node.sku))

    return skus.map((sku) => ({ sku, exists: foundSkus.has(sku) }))
  }
}

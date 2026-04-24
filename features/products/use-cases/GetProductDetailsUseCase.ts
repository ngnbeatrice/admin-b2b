import type { ShopifyClient } from '../client/ShopifyClient'

import { ProductMapper } from './mapper/ProductMapper'
import type { GetProductDetailsViewModel } from './user-view/GetProductDetailsViewModel'

/**
 * Fetches full product details from Shopify by numeric ID.
 * Reconstructs the Shopify GID before calling the API.
 */
export class GetProductDetailsUseCase {
  constructor(private readonly shopifyClient: ShopifyClient) {}

  async execute(numericId: string): Promise<GetProductDetailsViewModel | null> {
    const gid = `gid://shopify/Product/${numericId}`
    const response = await this.shopifyClient.getProductDetail(gid)

    if (!response.data.product) return null

    const domain = ProductMapper.toDetailDomain(response.data.product)
    return ProductMapper.toGetDetailsViewModel(domain)
  }
}

import type { ShopifyClient } from '../client/ShopifyClient'

import { ProductMapper } from './mapper/ProductMapper'
import type { GetAllProductsForCreateOrderViewModel } from './user-view/GetAllProductsForCreateOrderViewModel'

/**
 * Fetches all products for the create order page.
 * Maps Shopify DTOs → Domain → ViewModel before returning.
 */
export class GetAllProductsForCreateOrderUseCase {
  constructor(private readonly shopifyClient: ShopifyClient) {}

  async execute(): Promise<{
    products: GetAllProductsForCreateOrderViewModel[]
    total: number
  }> {
    const countResponse = await this.shopifyClient.getProductsCount()
    const total = countResponse.data.productsCount.count

    if (total === 0) return { products: [], total: 0 }

    const productsResponse = await this.shopifyClient.getProducts(total)
    const products = productsResponse.data.products.edges
      .map(({ node }) => ProductMapper.toDomain(node))
      .map(ProductMapper.toGetAllForCreateOrderViewModel)

    return { products, total }
  }
}

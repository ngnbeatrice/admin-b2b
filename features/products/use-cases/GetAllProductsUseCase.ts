import type { ShopifyClient } from '../client/ShopifyClient'

import { ProductMapper } from './mapper/ProductMapper'
import type { GetAllProductsViewModel } from './user-view/GetAllProductsViewModel'

/**
 * Fetches the total product count from Shopify, then retrieves all products.
 * Maps Shopify DTOs → Domain → ViewModel before returning.
 */
export class GetAllProductsUseCase {
  constructor(private readonly shopifyClient: ShopifyClient) {}

  async execute(): Promise<{ products: GetAllProductsViewModel[]; total: number }> {
    const countResponse = await this.shopifyClient.getProductsCount()
    const total = countResponse.data.productsCount.count

    if (total === 0) return { products: [], total: 0 }

    const productsResponse = await this.shopifyClient.getProducts(total)
    const products = productsResponse.data.products.edges
      .map(({ node }) => ProductMapper.toDomain(node))
      .map(ProductMapper.toGetAllViewModel)

    return { products, total }
  }
}

import type { ShopifyClient } from '../client/ShopifyClient'
import type { GetAllMbeProductVariantService } from '../service/GetAllMbeProductVariantService'

import { ProductMapper } from './mapper/ProductMapper'
import type { GetProductDetailsViewModel } from './user-view/GetProductDetailsViewModel'

/**
 * Fetches full product details from Shopify by numeric ID.
 * Reconstructs the Shopify GID before calling the API.
 */
export class GetProductDetailsUseCase {
  constructor(
    private readonly shopifyClient: ShopifyClient,
    private readonly mbeService: GetAllMbeProductVariantService
  ) {}

  async execute(numericId: string): Promise<GetProductDetailsViewModel | null> {
    const gid = `gid://shopify/Product/${numericId}`
    const response = await this.shopifyClient.getProductDetail(gid)

    if (!response.data.product) return null

    const domain = ProductMapper.toDetailDomain(response.data.product)

    // Extract SKU list from variants
    const skuList = domain.variants.map((v) => v.sku).filter((sku) => sku !== null && sku !== '')

    // Fetch MBE data for these SKUs
    const mbeVariants = await this.mbeService.getAllBySkuList(skuList)

    return ProductMapper.toGetDetailsViewModel(domain, mbeVariants)
  }
}

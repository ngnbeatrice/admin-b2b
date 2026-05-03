import type { ShopifyClient } from '@/features/products/client/ShopifyClient'

import type { MbeClient } from '../client/MbeClient'
import { MbeOrderMapper } from '../mapper/MbeOrderMapper'
import type { MbeOrdersRepository } from '../repository/MbeOrdersRepository'

import type { GetMbeOrderDetailViewModel } from './user-view/GetMbeOrderDetailViewModel'

export interface UpdateMbeOrderResult {
  order: GetMbeOrderDetailViewModel | null
  error?: string
}

/**
 * Updates a single MBE order by fetching it from the MBE API and upserting it to the database
 * Returns the updated order view model and any error that occurred
 */
export class UpdateMbeOrderUseCase {
  constructor(
    private readonly mbeClient: MbeClient,
    private readonly mbeOrdersRepository: MbeOrdersRepository,
    private readonly shopifyClient: ShopifyClient
  ) {}

  private async enhanceWithShopifyData(
    viewModel: GetMbeOrderDetailViewModel,
    skus: string[]
  ): Promise<void> {
    if (skus.length === 0) return

    try {
      const shopifyProducts = await this.shopifyClient.getSkuProducts(skus)
      const skuMap = new Map(shopifyProducts.map((sp) => [sp.sku, sp]))

      viewModel.products = viewModel.products.map((product) => ({
        ...product,
        shopify_product_id: product.sku ? (skuMap.get(product.sku)?.productId ?? null) : null,
        shopify_image_url: product.sku ? (skuMap.get(product.sku)?.imageUrl ?? null) : null,
      }))
    } catch (shopifyError) {
      console.warn('Failed to fetch Shopify data for order products:', shopifyError)
    }
  }

  async execute(orderId: string): Promise<UpdateMbeOrderResult> {
    try {
      // Try to fetch the order from MBE API
      let response
      try {
        response = await this.mbeClient.getOrders({
          id: orderId,
        })
      } catch (mbeError) {
        console.warn(
          `Failed to fetch order ${orderId} from MBE API, falling back to database:`,
          mbeError
        )

        // Fallback: get order from database
        const savedEntity = await this.mbeOrdersRepository.findById(orderId)

        if (!savedEntity) {
          return {
            order: null,
            error: `Order with id ${orderId} not found in MBE API or database.`,
          }
        }

        // Map entity to detail view model
        const viewModel = MbeOrderMapper.mapEntityToDetailViewModel(savedEntity)

        // Enhance with Shopify data
        const skus = savedEntity.products
          .map((p) => p.sku)
          .filter((sku): sku is string => sku !== null && sku !== '')
        await this.enhanceWithShopifyData(viewModel, skus)

        return {
          order: viewModel,
          error: 'Unable to fetch fresh data from MBE API. Displaying cached data from database.',
        }
      }

      // Check if we got a response
      if (!response.response || response.response.length === 0) {
        // Order not found in MBE API - delete it from our database
        try {
          await this.mbeOrdersRepository.deleteById(orderId)
        } catch (deleteError) {
          console.error(`Failed to delete order ${orderId} from database:`, deleteError)
          // Continue with the error message even if delete fails
        }

        return {
          order: null,
          error: `Order with id ${orderId} not found in MBE API. Order deleted from database.`,
        }
      }

      // Get the first (and should be only) order from the response
      const orderDTO = response.response[0]

      // Map DTO to domain object
      const domainOrder = MbeOrderMapper.toDomain(orderDTO)

      // Map domain to entity
      const entity = MbeOrderMapper.mapDomainToEntity(domainOrder)

      // Save/update the order in the database using saveMany (which handles upsert)
      const savedEntities = await this.mbeOrdersRepository.saveMany([entity])

      // Check if the order was saved successfully
      if (savedEntities.length === 0) {
        return {
          order: null,
          error: 'Order could not be saved to database',
        }
      }

      // Get the saved entity (first and only item in the array)
      const savedEntity = savedEntities[0]

      // Map entity to detail view model
      const viewModel = MbeOrderMapper.mapEntityToDetailViewModel(savedEntity)

      // Enhance with Shopify data
      const skus = savedEntity.products
        .map((p) => p.sku)
        .filter((sku): sku is string => sku !== null && sku !== '')
      await this.enhanceWithShopifyData(viewModel, skus)

      return {
        order: viewModel,
      }
    } catch (error) {
      console.error(`Failed to update MBE order ${orderId}:`, error)
      return {
        order: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}

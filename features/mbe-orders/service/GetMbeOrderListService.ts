import type { MbeOrderDTO } from '../client/dto/MbeOrderDTO'
import type { MbeClient } from '../client/MbeClient'
import type { MbeOrder } from '../domain/MbeOrder'
import { MbeOrderMapper } from '../mapper/MbeOrderMapper'

export interface GetMbeOrderListParams {
  id?: string
  date_from?: string
  date_to?: string
  state?: 0 | 1 | 2 | 3
  sku?: string
  fetchShopifyOrders?: boolean
}

export class GetMbeOrderListService {
  constructor(private readonly mbeClient: MbeClient) {}

  async searchByFilters(params: GetMbeOrderListParams): Promise<MbeOrder[]> {
    const { fetchShopifyOrders = true, ...apiParams } = params

    // First call to get total record count (max page_size is 10)
    const firstResponse = await this.mbeClient.getOrders({
      ...apiParams,
      page_number: 1,
      page_size: 10,
    })

    const totalRecords = firstResponse.tot_record
    const allOrders: MbeOrderDTO[] = [...firstResponse.response]

    console.log(`${totalRecords} MBE records to fetch from MBE API`)

    // If more than 10 records, fetch remaining pages simultaneously
    if (totalRecords > 10) {
      const totalPages = Math.ceil(totalRecords / 10)
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)

      const remainingResponses = await Promise.all(
        remainingPages.map((pageNumber) =>
          this.mbeClient.getOrders({
            ...apiParams,
            page_number: pageNumber,
            page_size: 10,
          })
        )
      )

      remainingResponses.forEach((response: typeof firstResponse) => {
        allOrders.push(...response.response)
      })
    }

    // Map DTOs to domain objects
    let orders = allOrders.map((dto) => MbeOrderMapper.toDomain(dto))

    // Filter out Shopify orders (num starting with "#") if fetchShopifyOrders is false
    if (!fetchShopifyOrders) {
      orders = orders.filter((order) => order.num && !order.num.startsWith('#'))
    }

    console.log(`All MBE orders fetched`)
    return orders
  }
}

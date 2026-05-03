import { APP_PROPERTY_KEYS, type ApplicationPropertiesService } from '@/features/app-properties'

import { MbeOrderMapper } from '../mapper/MbeOrderMapper'
import type { MbeOrdersRepository } from '../repository/MbeOrdersRepository'
import type {
  GetMbeOrderListParams,
  GetMbeOrderListService,
} from '../service/GetMbeOrderListService'

import type { GetAllMbeOrdersResult } from './user-view/GetAllMbeOrdersViewModel'

/**
 * Fetches all MBE orders and maps them to view models.
 * Orders are sorted by creation_time in descending order (newest first).
 * By default, excludes Shopify orders (orders with num starting with "#").
 */
export class GetAllMbeOrdersUseCase {
  constructor(
    private readonly getMbeOrderListService: GetMbeOrderListService,
    private readonly mbeOrdersRepository: MbeOrdersRepository,
    private readonly applicationPropertiesService: ApplicationPropertiesService
  ) {}

  async execute(params: GetMbeOrderListParams & { sku?: string }): Promise<GetAllMbeOrdersResult> {
    // Capture current datetime at the start for synchronization tracking
    const currentDateTime = new Date()
    let savedCount = 0
    let syncError: string | undefined

    // If only SKU filter is provided (no dates), skip sync and query directly by SKU
    if (params.sku && !params.date_from && !params.date_to) {
      const dbOrders = await this.mbeOrdersRepository.findAllByFilters({
        sku: params.sku,
      })

      return MbeOrderMapper.mapEntitiesToGetAllResult(
        dbOrders,
        savedCount,
        currentDateTime,
        syncError
      )
    }

    // Try to sync new orders from MBE API
    try {
      const lastMbeOrderSyncDateTime = await this.applicationPropertiesService.getValue(
        APP_PROPERTY_KEYS.MBE_ORDERS_LAST_SYNC_DATETIME
      )

      // Use lastMbeOrderSyncDateTime as date_from, current datetime as date_to
      const dateFrom =
        lastMbeOrderSyncDateTime instanceof Date
          ? lastMbeOrderSyncDateTime.toISOString().split('T')[0]
          : params.date_from
      const dateTo = currentDateTime.toISOString().split('T')[0]

      const orders = await this.getMbeOrderListService.searchByFilters({
        ...params,
        date_from: dateFrom,
        date_to: dateTo,
        fetchShopifyOrders: false,
      })

      // Sort by creation_time ASC (oldest first for processing)
      const sortedOrders = orders.sort((a, b) => {
        const dateA = new Date(a.creation_time).getTime()
        const dateB = new Date(b.creation_time).getTime()
        return dateA - dateB
      })

      // Filter out orders before or equal to lastMbeOrderSyncDateTime
      const filteredOrders =
        lastMbeOrderSyncDateTime instanceof Date
          ? sortedOrders.filter((order) => {
              const orderCreationTime = new Date(order.creation_time).getTime()
              const syncTime = lastMbeOrderSyncDateTime.getTime()
              return orderCreationTime > syncTime
            })
          : sortedOrders

      // Map domain objects to entities
      const entities = filteredOrders.map((order) => MbeOrderMapper.mapDomainToEntity(order))

      // Save filtered orders to database in a transaction
      await this.mbeOrdersRepository.saveMany(entities)
      savedCount = filteredOrders.length

      // Update the last synchronization datetime to current datetime (fire and forget)
      this.applicationPropertiesService.setValue(
        APP_PROPERTY_KEYS.MBE_ORDERS_LAST_SYNC_DATETIME,
        currentDateTime.toISOString()
      )
    } catch (error) {
      console.error('Failed to sync MBE orders:', error)
      syncError = `Error when syncing MBE data: ${error}`
      // Continue execution to return existing data from database
    }

    // Fetch orders from database using the original date range from params
    const { startOfDay, endOfDay } = this.calculateDateRange(params, currentDateTime)

    const dbOrders = await this.mbeOrdersRepository.findAllByFilters({
      dateFrom: startOfDay,
      dateTo: endOfDay,
    })

    // Map entities to result with unique SKU list
    return MbeOrderMapper.mapEntitiesToGetAllResult(
      dbOrders,
      savedCount,
      currentDateTime,
      syncError
    )
  }

  /**
   * Calculates the date range for querying orders from the database.
   * Defaults to 1 month of data if no dates provided.
   * Returns start of day for date_from and end of day for date_to.
   */
  private calculateDateRange(
    params: GetMbeOrderListParams,
    currentDateTime: Date
  ): { startOfDay: Date; endOfDay: Date } {
    // Default to 1 month of data if no dates provided
    const oneMonthAgo = new Date(currentDateTime)
    oneMonthAgo.setMonth(currentDateTime.getMonth() - 1)

    const queryDateFrom = params.date_from ?? oneMonthAgo
    const queryDateTo = params.date_to ?? currentDateTime

    // Set queryDateFrom to start of day (00:00:00.000)
    const startOfDay = new Date(queryDateFrom)
    startOfDay.setHours(0, 0, 0, 0)

    // Set queryDateTo to end of day (23:59:59.999)
    const endOfDay = new Date(queryDateTo)
    endOfDay.setHours(23, 59, 59, 999)

    return { startOfDay, endOfDay }
  }
}

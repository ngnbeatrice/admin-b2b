import { env } from '@/lib/env'

import type { MbeOrdersResponseDTO } from './dto/MbeOrderDTO'

export interface GetMbeOrdersParams {
  /** Order ID (optional) */
  id?: string
  /** Start date in yyyy-mm-dd format (optional) */
  date_from?: string
  /** End date in yyyy-mm-dd format (optional) */
  date_to?: string
  /** Page number (default: 1) */
  page_number?: number
  /** Page size, max 10 (default: 10) */
  page_size?: number
  /** Order state: 0 (Draft), 1 (Confirmed), 2 (Deleted), 3 (Fulfilled) (optional) */
  state?: 0 | 1 | 2 | 3
}

export class MbeClient {
  /**
   * Get MBE orders from the /document endpoint
   * @param params - Query parameters for filtering orders
   * @returns Orders data with pagination info
   */
  async getOrders(params: GetMbeOrdersParams): Promise<MbeOrdersResponseDTO> {
    if (!env.MBE_API_HOST) {
      throw new Error('MBE_API_HOST environment variable is not configured')
    }
    if (!env.MBE_API_KEY) {
      throw new Error('MBE_API_KEY environment variable is not configured')
    }

    const url = new URL(`${env.MBE_API_HOST}/prod/document/get`)

    // Add query parameters
    if (params.id) url.searchParams.set('id', params.id)
    url.searchParams.set('type', 'OC') // Always set type to 'OC' for orders
    if (params.date_from) url.searchParams.set('date_from', params.date_from)
    if (params.date_to) url.searchParams.set('date_to', params.date_to)

    // Always set pagination params with defaults (max page_size is 10)
    const pageNumber = params.page_number ?? 1
    const pageSize = params.page_size ?? 10
    url.searchParams.set('page_number', pageNumber.toString())
    url.searchParams.set('page_size', Math.min(pageSize, 10).toString())

    if (params.state !== undefined) url.searchParams.set('state', params.state.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept-encoding': 'gzip,deflate',
        connection: 'Keep-Alive',
        'x-api-key': env.MBE_API_KEY,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`MBE API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

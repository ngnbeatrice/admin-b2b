import { env } from '@/lib/env'

import type { MbeWarehouseDataDTO } from './dto/MbeWarehouseDataDTO'

export class MbeClient {
  /**
   * Get all warehouse data from MBE API
   * @param pageNumber - Page number (default: 1)
   * @param pageSize - Page size, max 100 (default: 100)
   * @returns Warehouse data with pagination info
   */
  async getAllWarehouseData(
    pageNumber: number = 1,
    pageSize: number = 100
  ): Promise<MbeWarehouseDataDTO> {
    if (!env.MBE_API_HOST) {
      throw new Error('MBE_API_HOST environment variable is not configured')
    }
    if (!env.MBE_API_KEY) {
      throw new Error('MBE_API_KEY environment variable is not configured')
    }

    const url = new URL(`${env.MBE_API_HOST}/prod/warehouse`)
    url.searchParams.set('page_number', pageNumber.toString())
    url.searchParams.set('page_size', Math.min(pageSize, 100).toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept-encoding': 'gzip,deflate',
        connection: 'Keep-Alive',
        'x-api-key': env.MBE_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`MBE API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

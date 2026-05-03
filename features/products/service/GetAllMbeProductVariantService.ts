import { MbeClient } from '../client/MbeClient'
import { ProductVariantMapper } from '../use-cases/mapper/ProductVariantMapper'

import type { MbeProductVariant } from './types/MbeProductVariant'

export class GetAllMbeProductVariantService {
  constructor(private readonly mbeClient: MbeClient) {}

  async getAll(): Promise<MbeProductVariant[]> {
    const pageSize = 100

    // First call to get total record count
    const firstResponse = await this.mbeClient.getAllWarehouseData(1, pageSize)
    const allItems: MbeWarehouseItemDTO[] = [...firstResponse.response]

    const totalRecords = firstResponse.tot_record
    const totalPages = Math.ceil(totalRecords / pageSize)

    // If there are more pages, fetch them all simultaneously
    if (totalPages > 1) {
      const remainingPageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)

      const remainingResponses = await Promise.all(
        remainingPageNumbers.map((pageNumber) =>
          this.mbeClient.getAllWarehouseData(pageNumber, pageSize)
        )
      )

      // Merge all responses
      remainingResponses.forEach((response) => {
        allItems.push(...response.response)
      })
    }

    // Map to MbeProductVariant
    return allItems.map((item) => ProductVariantMapper.toMbeProductVariant(item))
  }

  async getAllBySkuList(skuList: string[]): Promise<MbeProductVariant[]> {
    if (skuList.length === 0) {
      return []
    }

    const pageSize = 100
    const skuSet = new Set(skuList)
    const foundVariants: MbeProductVariant[] = []
    const foundSkus = new Set<string>()

    // First call to get total record count
    const firstResponse = await this.mbeClient.getAllWarehouseData(1, pageSize)
    const totalRecords = firstResponse.tot_record
    const totalPages = Math.ceil(totalRecords / pageSize)

    // Process first page
    for (const item of firstResponse.response) {
      if (skuSet.has(item.sku)) {
        foundVariants.push(ProductVariantMapper.toMbeProductVariant(item))
        foundSkus.add(item.sku)
      }
    }

    // If all SKUs found, return early
    if (foundSkus.size === skuList.length) {
      return foundVariants
    }

    // Continue fetching pages until all SKUs are found or no more pages
    for (let page = 2; page <= totalPages; page++) {
      const response = await this.mbeClient.getAllWarehouseData(page, pageSize)

      for (const item of response.response) {
        if (skuSet.has(item.sku) && !foundSkus.has(item.sku)) {
          foundVariants.push(ProductVariantMapper.toMbeProductVariant(item))
          foundSkus.add(item.sku)
        }
      }

      // If all SKUs found, stop fetching
      if (foundSkus.size === skuList.length) {
        break
      }
    }

    return foundVariants
  }
}

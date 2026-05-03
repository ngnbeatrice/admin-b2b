import type { MbeOrderState } from '../../domain/MbeOrderState'

export interface GetAllMbeOrdersViewModel {
  id: string
  num: string
  company_name: string
  creation_time: string
  tracking_number_mbe: string | null
  state: MbeOrderState | null
  state_description: string
  total_products: number
  products_sku: string[]
}

export interface GetAllMbeOrdersResult {
  orders: GetAllMbeOrdersViewModel[]
  savedCount: number
  lastSyncDate: Date
  syncError?: string
  product_sku_unique_list: string[]
}

import type { MbeOrderState } from '../../domain/MbeOrderState'

export interface MbeOrderProductViewModel {
  product_id: string
  sku: string | null
  description: string | null
  quantity: number
  shopify_product_id: string | null
  shopify_image_url: string | null
}

export interface GetMbeOrderDetailViewModel {
  id: string
  num: string
  deposit: string | null
  department_id: string | null
  date: string | null
  reason: string | null
  transport: string | null
  port_shipment: string | null
  note: string | null
  operator: string | null
  shipping_packages: number | null
  tracking_number: string | null
  tracking_number_mbe: string | null
  state: MbeOrderState | null
  state_description: string
  working_state: string | null
  working_state_description: string | null
  creation_time: string
  company_name: string | null
  total_products: number
  products: MbeOrderProductViewModel[]
}

export interface MbeWarehouseDataDTO {
  code: boolean
  message: string
  tot_record: number
  page_number: string
  page_size: string
  response: MbeWarehouseItemDTO[]
}

export interface MbeWarehouseItemDTO {
  id: string
  sku: string
  is_lot_item: number
  is_lot_exired_date_item: number
  ean: string
  brand: string
  description: string
  location: string | null
  stock: number
  min_stock: number
  purchase_order: number
  customer_order: number
  loading: number
  unloading: number
  transfer_out: number
  transfer_in: number
  inv_out: number
  inv_in: number
}

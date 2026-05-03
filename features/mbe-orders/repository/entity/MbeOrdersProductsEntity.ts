/** Raw shape returned by MbeOrdersRepository for products — mirrors the DB row */
export interface MbeOrdersProductsEntity {
  mbeOrdersProductsId: number
  orderId: string
  productId: string
  sku: string | null
  description: string | null
  quantity: number
  createdAt: Date | null
  updatedAt: Date | null
}

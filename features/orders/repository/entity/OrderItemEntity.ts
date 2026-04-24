export interface OrderItemEntity {
  id: string
  orderId: string
  productId: string
  productTitle: string
  productImageUrl: string | null
  variantId: string
  variantTitle: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

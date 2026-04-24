export interface OrderItemRequest {
  productId: string
  productTitle: string
  productImage: string | null
  variantId: string
  variantTitle: string
  quantity: number
  price: number
}

export interface SendOrderRequest {
  customerEmail: string
  emailLanguage: 'en' | 'fr'
  items: OrderItemRequest[]
  totalQuantity: number
  totalAmount: number
}

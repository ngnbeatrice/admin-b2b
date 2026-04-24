export interface OrderItemViewModel {
  id: string
  productId: string
  productTitle: string
  productImageUrl: string | null
  variantId: string
  variantTitle: string
  quantity: number
  unitPrice: string
  totalPrice: string
}

export interface GetOrderDetailViewModel {
  id: string
  customerEmail: string
  totalQuantity: number
  totalAmount: string
  paid: boolean
  status: string
  createdAt: string
  createdBy: string | null
  items: OrderItemViewModel[]
}

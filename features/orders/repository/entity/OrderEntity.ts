export interface OrderEntity {
  id: string
  customerEmail: string
  totalQuantity: number
  totalAmount: number
  paid: boolean
  status: string
  createdAt: Date
  createdBy: string | null
}

export interface GetAllOrdersViewModel {
  id: string
  customerEmail: string
  totalQuantity: number
  totalAmount: string
  paid: boolean
  status: string
  createdAt: string
  createdBy: string | null
}

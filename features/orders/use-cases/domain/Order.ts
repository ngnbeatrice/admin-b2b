export interface OrderItem {
  productId: string
  productTitle: string
  productImage: string | null
  variantId: string
  variantTitle: string
  quantity: number
  price: number
  total: number
}

export class Order {
  constructor(
    readonly customerEmail: string,
    readonly emailLanguage: 'en' | 'fr',
    readonly items: OrderItem[],
    readonly totalQuantity: number,
    readonly totalAmount: number,
    readonly orderDate: Date
  ) {}

  get formattedTotal(): string {
    return new Intl.NumberFormat(this.emailLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(this.totalAmount)
  }

  get formattedDate(): string {
    return this.orderDate.toLocaleDateString(this.emailLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

export interface NewProductCollection {
  id: string
  name: string
  colors: Array<{
    id: string
    name: string
    imagePath: string | null
  }>
}

export interface NewProductVariant {
  id: string
  title: string
  sku: string | null
}

/** Domain object — business logic lives here */
export class NewProduct {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string | null,
    readonly priceCents: number,
    readonly imagePath: string | null,
    readonly createdAt: Date,
    readonly variants: NewProductVariant[],
    readonly collections: NewProductCollection[]
  ) {}

  /** Price formatted as decimal (e.g. 29900 → 299.00) */
  get priceFormatted(): string {
    return (this.priceCents / 100).toFixed(2)
  }

  get collectionNames(): string[] {
    return this.collections.map((c) => c.name)
  }
}

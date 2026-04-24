export interface ProductCollection {
  id: string
  title: string
  handle: string
  descriptionHtml: string
}

export interface ProductVariant {
  id: string
  title: string
  sku: string
  inventoryQuantity: number
  price: string
  imageUrl: string | null
}

export interface ProductVariantDetail {
  id: string
  title: string
  sku: string
  barcode: string | null
  selectedOptions: { name: string; value: string }[]
  inventoryLevels: { locationName: string; availableQuantity: number }[]
}

/** Domain object for the products list */
export class Product {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly tags: string[],
    readonly featuredImageUrl: string | null,
    readonly featuredImageAlt: string | null,
    readonly collections: ProductCollection[],
    readonly variants: ProductVariant[]
  ) {}

  get totalInventory(): number {
    return this.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0)
  }

  get inStock(): boolean {
    return this.totalInventory > 0
  }
}

/** Domain object for the product detail page */
export class ProductDetail {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly productType: string,
    readonly description: string,
    readonly descriptionHtml: string,
    readonly tags: string[],
    readonly options: { name: string; values: string[] }[],
    readonly featuredImageUrl: string | null,
    readonly featuredImageAlt: string | null,
    readonly collections: ProductCollection[],
    readonly variants: ProductVariantDetail[]
  ) {}

  get totalInventory(): number {
    return this.variants.reduce(
      (sum, v) => sum + v.inventoryLevels.reduce((s, l) => s + l.availableQuantity, 0),
      0
    )
  }

  get inStock(): boolean {
    return this.totalInventory > 0
  }
}

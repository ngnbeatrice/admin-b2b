export interface ProductVariantForCreateOrderViewModel {
  id: string
  title: string
  sku: string
  inventoryQuantity: number
  price: string
  imageUrl: string | null
}

export interface GetAllProductsForCreateOrderViewModel {
  id: string
  /** Numeric Shopify ID extracted from the GID, used for URL routing */
  numericId: string
  title: string
  tags: string[]
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  collections: { id: string; title: string }[]
  totalInventory: number
  inStock: boolean
  variants: ProductVariantForCreateOrderViewModel[]
}

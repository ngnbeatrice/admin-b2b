export interface ProductVariantForCreateOrderViewModel {
  id: string
  shopifyTitle: string
  shopifySku: string
  shopifyInventoryQuantity: number
  shopifyPrice: string
  shopifyImageUrl: string | null
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

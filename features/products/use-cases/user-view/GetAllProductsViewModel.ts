export interface ProductVariantViewModel {
  id: string
  shopifyTitle: string
  shopifySku: string
  shopifyInventoryQuantity: number
  shopifyPrice: string
  shopifyImageUrl: string | null
  // MBE warehouse data
  mbeDescription: string | null
  mbeStock: number | null
  mbeCustomerOrder: number | null
  mbeDisponibility: number | null
}

export interface GetAllProductsViewModel {
  id: string
  /** Numeric Shopify ID extracted from the GID, used for URL routing */
  numericId: string
  title: string
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNLISTED'
  tags: string[]
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  collections: { id: string; title: string }[]
  totalInventory: number
  inStock: boolean
  variants: ProductVariantViewModel[]
}

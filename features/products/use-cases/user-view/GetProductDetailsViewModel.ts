export interface InventoryLevelViewModel {
  locationName: string
  availableQuantity: number
}

export interface ProductDetailVariantViewModel {
  id: string
  title: string
  sku: string
  barcode: string | null
  selectedOptions: { name: string; value: string }[]
  inventoryLevels: InventoryLevelViewModel[]
  totalAvailable: number
}

export interface GetProductDetailsViewModel {
  id: string
  title: string
  productType: string
  description: string
  descriptionHtml: string
  tags: string[]
  options: { name: string; values: string[] }[]
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  collections: { id: string; title: string; handle: string }[]
  variants: ProductDetailVariantViewModel[]
  totalInventory: number
  inStock: boolean
}

/** View model for the GetAllNewProducts use case */
export interface GetAllNewProductsViewModel {
  id: string
  title: string
  description: string | null
  price: string
  imageUrl: string | null
  createdAt: string
  skus: Array<{ title: string; sku: string | null }>
  collections: Array<{
    id: string
    name: string
    colors: Array<{
      id: string
      name: string
      imageUrl: string | null
    }>
  }>
}

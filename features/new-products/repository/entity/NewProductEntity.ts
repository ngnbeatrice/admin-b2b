/** Raw shape returned by NewProductRepository — mirrors the DB row */
export interface NewProductEntity {
  id: string
  title: string
  description: string | null
  priceCents: number
  imagePath: string | null
  createdAt: Date
  variants: {
    id: string
    title: string
    sku: string | null
  }[]
  collections: {
    collection: {
      id: string
      name: string
      colors: {
        color: {
          id: string
          name: string
          imagePath: string | null
        }
      }[]
    }
  }[]
}

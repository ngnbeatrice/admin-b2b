/** Raw shape returned by CollectionRepository — mirrors the DB row */
export interface CollectionEntity {
  id: string
  name: string
  description: string | null
  createdAt: Date
  colors: {
    color: {
      id: string
      name: string
      imagePath: string | null
    }
  }[]
}

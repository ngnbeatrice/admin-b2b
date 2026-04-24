/** Raw shape returned by ColorRepository — mirrors the DB row */
export interface ColorEntity {
  id: string
  name: string
  description: string | null
  imagePath: string | null
  createdAt: Date
}

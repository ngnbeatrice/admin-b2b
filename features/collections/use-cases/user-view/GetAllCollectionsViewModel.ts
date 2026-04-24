/** View model for the GetAllCollections use case */
export interface GetAllCollectionsViewModel {
  id: string
  name: string
  description: string | null
  createdAt: string
  colors: Array<{
    id: string
    name: string
    imageUrl: string | null
  }>
}

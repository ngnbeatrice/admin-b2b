/** View model for the GetAllUsers use case */
export interface GetAllUsersViewModel {
  id: string
  email: string
  groups: string[]
  scopes: string[]
  createdAt: string
}

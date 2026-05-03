/** View model for the GetUserDetails use case */
export interface GetUserDetailsViewModel {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  displayName: string
  groups: Array<{
    id: string
    name: string
    scopes: Array<{ id: string; name: string }>
  }>
  createdAt: string
}

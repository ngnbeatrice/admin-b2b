/** View model for the GetAllUsers use case */
export interface GetAllUsersViewModel {
  id: string
  email: string
  groups: string[]
  scopes: string[]
  failedLoginAttempts: number
  blockedAt: string | null
  blockedBy: string | null
  isBlocked: boolean
  createdAt: string
}

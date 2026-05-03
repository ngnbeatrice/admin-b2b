/** Raw shape returned by UserRepository — mirrors the DB row */
export interface UserEntity {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  failedLoginAttempts: number
  blockedAt: Date | null
  blockedBy: string | null
  createdAt: Date
  groups: {
    group: {
      id: string
      name: string
      scopes: {
        scope: {
          id: string
          name: string
        }
      }[]
    }
  }[]
}

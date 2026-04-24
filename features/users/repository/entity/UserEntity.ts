/** Raw shape returned by UserRepository — mirrors the DB row */
export interface UserEntity {
  id: string
  email: string
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

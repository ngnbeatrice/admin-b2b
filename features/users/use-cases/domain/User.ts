export interface UserGroup {
  id: string
  name: string
  scopes: UserScope[]
}

export interface UserScope {
  id: string
  name: string
}

/** Domain object — business logic lives here */
export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly createdAt: Date,
    readonly groups: UserGroup[]
  ) {}

  get scopeNames(): string[] {
    return [...new Set(this.groups.flatMap((g) => g.scopes.map((s) => s.name)))]
  }

  hasScope(scope: string): boolean {
    return this.scopeNames.includes(scope)
  }
}

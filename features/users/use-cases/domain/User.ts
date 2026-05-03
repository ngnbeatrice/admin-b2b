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
    readonly firstName: string | null,
    readonly lastName: string | null,
    readonly failedLoginAttempts: number,
    readonly blockedAt: Date | null,
    readonly blockedBy: string | null,
    readonly createdAt: Date,
    readonly groups: UserGroup[]
  ) {}

  get fullName(): string | null {
    if (!this.firstName && !this.lastName) return null
    return [this.firstName, this.lastName].filter(Boolean).join(' ')
  }

  get displayName(): string {
    return this.fullName || this.email
  }

  get isBlocked(): boolean {
    return this.blockedAt !== null
  }

  get scopeNames(): string[] {
    return [...new Set(this.groups.flatMap((g) => g.scopes.map((s) => s.name)))]
  }

  hasScope(scope: string): boolean {
    return this.scopeNames.includes(scope)
  }
}

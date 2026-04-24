export interface ScopeViewModel {
  scopeId: string
  scopeName: string
  menuGroup: string
  menu: string
}

export interface GetAllGroupsViewModel {
  groupId: string
  groupName: string
  scopes: ScopeViewModel[]
}

export interface PageAccessViewModel {
  path: string
  menuGroup: string
  menuLabel: string
  requiredScopes: string[]
  groupsWithAccess: string[]
}

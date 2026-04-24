/** Raw shape returned by the repository — mirrors the DB query result */
export interface GroupSecurityEntity {
  groupId: string
  groupName: string
  scopeId: string
  scopeName: string
}

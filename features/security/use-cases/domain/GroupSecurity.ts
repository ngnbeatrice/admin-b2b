/** Domain object for group security information */
export class GroupSecurity {
  constructor(
    readonly groupId: string,
    readonly groupName: string,
    readonly scopes: { scopeId: string; scopeName: string }[]
  ) {}
}

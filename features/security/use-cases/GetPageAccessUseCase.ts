import { PAGE_DEFINITIONS } from '../constants/page-scopes'
import type { SecurityRepository } from '../repository'

import { SecurityMapper } from './mapper/SecurityMapper'
import type { PageAccessViewModel } from './user-view/GetAllGroupsViewModel'

/**
 * Fetches all pages with their required scopes and which groups have access.
 * Combines page definitions with actual group-scope data from the database.
 */
export class GetPageAccessUseCase {
  constructor(private readonly securityRepository: SecurityRepository) {}

  async execute(): Promise<PageAccessViewModel[]> {
    // Fetch all groups with their scopes from DB
    const entities = await this.securityRepository.findAllGroupsWithScopes()
    const domainGroups = SecurityMapper.toDomain(entities)

    // Build a map of scope name -> groups that have it
    const scopeToGroups = new Map<string, string[]>()
    for (const group of domainGroups) {
      for (const scope of group.scopes) {
        if (!scopeToGroups.has(scope.scopeName)) {
          scopeToGroups.set(scope.scopeName, [])
        }
        scopeToGroups.get(scope.scopeName)!.push(group.groupName)
      }
    }

    // Map each page to its access information
    return PAGE_DEFINITIONS.map((page) => {
      const groupsWithAccess =
        page.requiredScopes.length === 0
          ? ['All authenticated users']
          : [
              ...new Set(page.requiredScopes.flatMap((scope) => scopeToGroups.get(scope) ?? [])),
            ].sort()

      return {
        path: page.path,
        menuGroup: page.menuGroup,
        menuLabel: page.menuLabel,
        requiredScopes: page.requiredScopes,
        groupsWithAccess,
      }
    })
  }
}

import type { GroupSecurityEntity } from '../../repository'
import { GroupSecurity } from '../domain/GroupSecurity'
import type { GetAllGroupsViewModel, ScopeViewModel } from '../user-view/GetAllGroupsViewModel'

import { ScopeMenuMapper } from './ScopeMenuMapper'

export class SecurityMapper {
  /** Entity list → Domain objects (grouped by group) */
  static toDomain(entities: GroupSecurityEntity[]): GroupSecurity[] {
    const groupMap = new Map<string, GroupSecurity>()

    for (const entity of entities) {
      if (!groupMap.has(entity.groupId)) {
        groupMap.set(entity.groupId, new GroupSecurity(entity.groupId, entity.groupName, []))
      }

      const group = groupMap.get(entity.groupId)!
      group.scopes.push({
        scopeId: entity.scopeId,
        scopeName: entity.scopeName,
      })
    }

    return Array.from(groupMap.values())
  }

  /** Domain → GetAllGroups view model */
  static toGetAllViewModel(domain: GroupSecurity): GetAllGroupsViewModel {
    return {
      groupId: domain.groupId,
      groupName: domain.groupName,
      scopes: domain.scopes.map((scope): ScopeViewModel => {
        const menuInfo = ScopeMenuMapper.getMenuInfo(scope.scopeName)
        return {
          scopeId: scope.scopeId,
          scopeName: scope.scopeName,
          menuGroup: menuInfo.menuGroup,
          menu: menuInfo.menu,
        }
      }),
    }
  }
}

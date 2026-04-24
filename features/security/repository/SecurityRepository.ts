import { prisma } from '@/lib/prisma'

import type { GroupSecurityEntity } from './entity/GroupSecurityEntity'

/**
 * Repository for security-related data access.
 * Fetches user groups with their associated scopes.
 */
export class SecurityRepository {
  /**
   * Fetches all user groups with their scopes.
   * Returns a flat list of group-scope pairs.
   */
  async findAllGroupsWithScopes(): Promise<GroupSecurityEntity[]> {
    const result = await prisma.$queryRaw<GroupSecurityEntity[]>`
      SELECT 
        ug.id as "groupId",
        ug.name as "groupName",
        us.id as "scopeId",
        us.name as "scopeName"
      FROM user_groups ug
      INNER JOIN user_groups_user_scopes ugs ON ug.id = ugs.group_id
      INNER JOIN user_scopes us ON ugs.scope_id = us.id
      ORDER BY ug.name, us.name
    `
    return result
  }
}

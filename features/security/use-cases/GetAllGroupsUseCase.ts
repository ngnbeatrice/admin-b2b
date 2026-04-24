import type { SecurityRepository } from '../repository'

import { SecurityMapper } from './mapper/SecurityMapper'
import type { GetAllGroupsViewModel } from './user-view/GetAllGroupsViewModel'

/**
 * Fetches all user groups with their associated scopes.
 * Maps scopes to their corresponding menu groups and menu items.
 */
export class GetAllGroupsUseCase {
  constructor(private readonly securityRepository: SecurityRepository) {}

  async execute(): Promise<GetAllGroupsViewModel[]> {
    const entities = await this.securityRepository.findAllGroupsWithScopes()
    const domainGroups = SecurityMapper.toDomain(entities)
    return domainGroups.map((group) => SecurityMapper.toGetAllViewModel(group))
  }
}

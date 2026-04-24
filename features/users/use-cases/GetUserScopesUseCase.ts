import type { UserRepository } from '../repository'

/**
 * Returns the flat list of scope names for a given user.
 * Used for server-side authorization checks (e.g. sidebar visibility).
 */
export class GetUserScopesUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<string[]> {
    const entity = await this.userRepository.findById(userId)
    if (!entity) return []

    return [...new Set(entity.groups.flatMap((ug) => ug.group.scopes.map((gs) => gs.scope.name)))]
  }
}

import type { UserRepository } from '../repository'

import { UserMapper } from './mapper/UserMapper'
import type { GetUserDetailsViewModel } from './user-view/GetUserDetailsViewModel'

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User not found: ${id}`)
    this.name = 'UserNotFoundError'
  }
}

export class GetUserDetailsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, locale?: string): Promise<GetUserDetailsViewModel> {
    const entity = await this.userRepository.findById(userId)

    if (!entity) throw new UserNotFoundError(userId)

    const domain = UserMapper.toDomain(entity)
    return UserMapper.toGetUserDetailsViewModel(domain, locale)
  }
}

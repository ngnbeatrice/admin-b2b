import { UserRepository } from '../repository'

import { UserMapper } from './mapper/UserMapper'
import type { GetAllUsersViewModel } from './user-view/GetAllUsersViewModel'

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(locale?: string): Promise<GetAllUsersViewModel[]> {
    const entities = await this.userRepository.findAll()
    const domainUsers = entities.map(UserMapper.toDomain)
    return domainUsers.map((u) => UserMapper.toGetAllViewModel(u, locale))
  }
}

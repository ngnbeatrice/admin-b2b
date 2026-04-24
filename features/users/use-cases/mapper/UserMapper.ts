import type { UserEntity } from '../../repository'
import { User } from '../domain/User'
import type { GetAllUsersViewModel } from '../user-view/GetAllUsersViewModel'
import type { GetUserDetailsViewModel } from '../user-view/GetUserDetailsViewModel'

export class UserMapper {
  /** Entity (DB row) → Domain object */
  static toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.createdAt,
      entity.groups.map((ug) => ({
        id: ug.group.id,
        name: ug.group.name,
        scopes: ug.group.scopes.map((gs) => ({
          id: gs.scope.id,
          name: gs.scope.name,
        })),
      }))
    )
  }

  /** Domain object → GetAllUsers view model */
  static toGetAllViewModel(domain: User, locale = 'en'): GetAllUsersViewModel {
    return {
      id: domain.id,
      email: domain.email,
      groups: domain.groups.map((g) => g.name),
      scopes: domain.scopeNames,
      createdAt: domain.createdAt.toLocaleDateString(locale, { dateStyle: 'medium' }),
    }
  }

  /** Domain object → GetUserDetails view model */
  static toGetUserDetailsViewModel(domain: User, locale = 'en'): GetUserDetailsViewModel {
    return {
      id: domain.id,
      email: domain.email,
      groups: domain.groups.map((g) => ({
        id: g.id,
        name: g.name,
        scopes: g.scopes.map((s) => ({ id: s.id, name: s.name })),
      })),
      createdAt: domain.createdAt.toLocaleDateString(locale, { dateStyle: 'long' }),
    }
  }
}

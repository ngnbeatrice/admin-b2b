import bcrypt from 'bcryptjs'

import type { UserRepository } from '../repository'

import type { LoginViewModel } from './user-view/LoginViewModel'

const DB_TIMEOUT_MS = 10_000

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class DatabaseError extends Error {
  constructor(cause?: unknown) {
    super('Database error during login')
    this.name = 'DatabaseError'
    this.cause = cause
  }
}

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Validates credentials against the database.
   * Throws InvalidCredentialsError if the email doesn't exist or the password doesn't match.
   * Throws DatabaseError on timeout or any infrastructure failure.
   */
  async execute(email: string, password: string): Promise<LoginViewModel> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new DatabaseError('Query timed out')), DB_TIMEOUT_MS)
    )

    let entity: Awaited<ReturnType<UserRepository['findByEmailWithPassword']>>
    try {
      entity = await Promise.race([this.userRepository.findByEmailWithPassword(email), timeout])
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError(error)
    }

    if (!entity) throw new InvalidCredentialsError()

    const passwordMatch = await bcrypt.compare(password, entity.password)
    if (!passwordMatch) throw new InvalidCredentialsError()

    return { id: entity.id, email: entity.email }
  }
}

import bcrypt from 'bcryptjs'

import { env } from '@/lib/env'

import type { UserRepository } from '../repository'

import type { LoginViewModel } from './user-view/LoginViewModel'

const DB_TIMEOUT_MS = 10_000

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class AccountBlockedError extends Error {
  constructor() {
    super('Account is blocked due to too many failed login attempts')
    this.name = 'AccountBlockedError'
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
   * Throws AccountBlockedError if the account is blocked.
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

    // Check if account is blocked
    if (entity.blockedAt) {
      throw new AccountBlockedError()
    }

    const passwordMatch = await bcrypt.compare(password, entity.password)

    if (!passwordMatch) {
      // Increment failed login attempts
      const newAttempts = entity.failedLoginAttempts + 1
      await this.userRepository.incrementFailedLoginAttempts(entity.id)

      // Block user if max attempts reached
      if (newAttempts >= env.MAX_LOGIN_ATTEMPTS) {
        await this.userRepository.blockUser(entity.id, 'SYSTEM')
      }

      throw new InvalidCredentialsError()
    }

    // Successful login — reset failed attempts if any
    if (entity.failedLoginAttempts > 0) {
      await this.userRepository.resetFailedLoginAttempts(entity.id)
    }

    return { id: entity.id, email: entity.email }
  }
}

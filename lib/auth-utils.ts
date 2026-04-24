import { auth } from '@/auth'
import { GetUserScopesUseCase, UserRepository } from '@/features/users'

/**
 * Returns the flat list of scope names for the currently authenticated user.
 * Returns empty array if not authenticated.
 */
export async function getCurrentUserScopes(): Promise<string[]> {
  const session = await auth()
  if (!session?.user?.id) return []
  return new GetUserScopesUseCase(new UserRepository()).execute(session.user.id)
}

/**
 * Returns true if the current user has all of the specified scopes.
 */
export async function hasScopes(...required: string[]): Promise<boolean> {
  const scopes = await getCurrentUserScopes()
  return required.every((s) => scopes.includes(s))
}

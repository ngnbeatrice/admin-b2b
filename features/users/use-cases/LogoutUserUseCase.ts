import { signOut } from 'next-auth/react'

export class LogoutUserUseCase {
  async execute(): Promise<void> {
    // Extract the current locale from the URL path (e.g. /en/... → en)
    const locale = window.location.pathname.split('/')[1] || 'en'
    await signOut({ callbackUrl: `${window.location.origin}/${locale}/login` })
  }
}

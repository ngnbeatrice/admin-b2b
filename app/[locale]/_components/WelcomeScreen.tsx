import { getTranslations } from 'next-intl/server'

import { auth } from '@/auth'
import { APP_NAME } from '@/constants/app'
import { GetUserDetailsUseCase, UserRepository } from '@/features/users'

export async function WelcomeScreen() {
  const [t, session] = await Promise.all([getTranslations('HomePage'), auth()])

  if (!session?.user?.id) {
    return (
      <section id="screen-welcome" className="flex flex-1 flex-col items-center justify-center p-6">
        <h1 id="welcome-text" className="text-foreground text-xl font-medium">
          {t('welcome', { appName: APP_NAME })}
        </h1>
      </section>
    )
  }

  const useCase = new GetUserDetailsUseCase(new UserRepository())
  const user = await useCase.execute(session.user.id)

  return (
    <section id="screen-welcome" className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 id="welcome-text" className="text-foreground text-xl font-medium">
        {t('welcome', { appName: APP_NAME })}
        {user.firstName && (
          <span className="text-muted-foreground font-mono text-base"> — {user.firstName}</span>
        )}
      </h1>
    </section>
  )
}

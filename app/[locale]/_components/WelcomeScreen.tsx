import { getTranslations } from 'next-intl/server'

import { auth } from '@/auth'
import { APP_NAME } from '@/constants/app'

export async function WelcomeScreen() {
  const [t, session] = await Promise.all([getTranslations('HomePage'), auth()])

  return (
    <section id="screen-welcome" className="flex flex-1 flex-col items-center justify-center p-6">
      <h1 id="welcome-text" className="text-foreground text-xl font-medium">
        {t('welcome', { appName: APP_NAME })}
        {session?.user?.email && (
          <span className="text-muted-foreground font-mono text-base"> — {session.user.email}</span>
        )}
      </h1>
    </section>
  )
}

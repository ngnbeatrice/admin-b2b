import { ShieldOffIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Routes } from '@/constants/routes'
import { Link } from '@/lib/navigation'

export async function UnauthorizedScreen() {
  const t = await getTranslations('Unauthorized')

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <ShieldOffIcon className="text-muted-foreground size-16" />
      <h1 className="text-foreground text-xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground text-sm">{t('message')}</p>
      <Link href={Routes.home} className="text-primary text-sm underline underline-offset-4">
        {t('backHome')}
      </Link>
    </section>
  )
}

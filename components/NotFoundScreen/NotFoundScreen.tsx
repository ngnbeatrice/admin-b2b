'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Routes } from '@/constants/routes'
import { useRouter } from '@/lib/navigation'

export default function NotFoundScreen() {
  const t = useTranslations('NotFound')
  const router = useRouter()

  return (
    <div id="not-found-screen" className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-tertiary text-xl font-semibold" role="alert">
        {t('message')}
      </h1>
      <Button onClick={() => router.replace(Routes.home)}>{t('backHome')}</Button>
    </div>
  )
}

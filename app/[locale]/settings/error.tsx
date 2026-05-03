'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')

  useEffect(() => {
    console.error('Settings section error:', error)

    toast.error(t('title'), {
      description: error.message || t('description'),
      duration: 5000,
      action: {
        label: t('tryAgain'),
        onClick: reset,
      },
    })
  }, [error, reset, t])

  return null
}

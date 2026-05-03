'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')

  useEffect(() => {
    // Log error for monitoring
    console.error('Route error:', error)

    // Show error toast
    toast.error(t('title'), {
      description: error.message || t('description'),
      duration: 5000,
      action: {
        label: t('tryAgain'),
        onClick: reset,
      },
    })
  }, [error, reset, t])

  // Return null to keep the layout visible with just the toast
  return null
}

'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

interface MbeSyncErrorToastProps {
  message: string
}

export function MbeSyncErrorToast({ message }: MbeSyncErrorToastProps) {
  useEffect(() => {
    toast.error(message, {
      style: {
        color: '#ef4444', // red-500
      },
    })
  }, [message])

  return null
}

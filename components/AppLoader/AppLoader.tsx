'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { Spinner } from '@/components/ui/spinner'

export default function AppLoader({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: detects client hydration
    setMounted(true)
  }, [])

  // "Loading..." is intentionally hardcoded — this renders before NextIntlClientProvider is available
  if (!mounted) {
    return (
      <div className="min-h-screen-safe bg-background flex items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2">
          <Spinner className="size-5" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

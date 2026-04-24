'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { AppShell } from '@/components/AppShell/AppShell'

interface AuthGuardProps {
  readonly children: ReactNode
  readonly sidebar: ReactNode
}

const PUBLIC_PATHS = ['/login']

function isPublicPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')
  return PUBLIC_PATHS.some((p) => withoutLocale === p || withoutLocale.startsWith(p + '/'))
}

export function AuthGuard({ children, sidebar }: AuthGuardProps) {
  const pathname = usePathname()

  if (isPublicPath(pathname)) {
    return <>{children}</>
  }

  return <AppShell sidebar={sidebar}>{children}</AppShell>
}

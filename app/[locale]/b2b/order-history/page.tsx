import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { hasScopes } from '@/lib/auth-utils'

import { OrderHistoryScreen } from './_components/OrderHistoryScreen'
import { OrderHistorySkeleton } from './_components/OrderHistorySkeleton'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(await hasScopes(Scopes.USERS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)

  return (
    <Suspense fallback={<OrderHistorySkeleton />}>
      <OrderHistoryScreen />
    </Suspense>
  )
}

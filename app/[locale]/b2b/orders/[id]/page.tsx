import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { hasScopes } from '@/lib/auth-utils'

import { OrderDetailScreen } from './_components/OrderDetailScreen'
import { OrderDetailSkeleton } from './_components/OrderDetailSkeleton'

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  if (!(await hasScopes(Scopes.USERS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)

  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailScreen orderId={id} />
    </Suspense>
  )
}

import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { hasScopes } from '@/lib/auth-utils'

import { MbeOrderDetailScreen } from './_components/MbeOrderDetailScreen'
import { MbeOrderDetailSkeleton } from './_components/MbeOrderDetailSkeleton'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function Page({ params }: PageProps) {
  const { locale, id } = await params
  if (!(await hasScopes(Scopes.USERS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)

  return (
    <Suspense fallback={<MbeOrderDetailSkeleton />}>
      <MbeOrderDetailScreen orderId={id} />
    </Suspense>
  )
}

import { redirect } from 'next/navigation'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { hasScopes } from '@/lib/auth-utils'

import { CreateOrderScreen } from './_components/CreateOrderScreen'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(await hasScopes(Scopes.USERS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)

  return <CreateOrderScreen />
}

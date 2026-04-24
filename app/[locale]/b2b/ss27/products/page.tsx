import { redirect } from 'next/navigation'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { hasScopes } from '@/lib/auth-utils'

import { SS27ProductsScreen } from './_components/SS27ProductsScreen'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(await hasScopes(Scopes.USERS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)
  return <SS27ProductsScreen locale={locale} />
}

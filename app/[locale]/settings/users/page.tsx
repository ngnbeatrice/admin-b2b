import { redirect } from 'next/navigation'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { hasScopes } from '@/lib/auth-utils'

import { UsersScreen } from './_components/UsersScreen'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(await hasScopes(Scopes.SETTINGS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)
  return <UsersScreen locale={locale} />
}

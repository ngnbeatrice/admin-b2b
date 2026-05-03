import { redirect } from 'next/navigation'

import { ProductDetailScreen } from '@/app/[locale]/products/[id]/_components/ProductDetailScreen'
import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { hasScopes } from '@/lib/auth-utils'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  if (!(await hasScopes(Scopes.USERS_WRITE))) redirect(`/${locale}${Routes.unauthorized}`)

  return <ProductDetailScreen id={id} />
}

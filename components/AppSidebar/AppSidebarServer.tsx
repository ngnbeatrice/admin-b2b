import { ShoppingBagIcon, BuildingIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Routes } from '@/constants/routes'
import { Scopes } from '@/constants/scopes'
import { getCurrentUserScopes } from '@/lib/auth-utils'

import { AppSidebar, type AppSidebarLabels } from './AppSidebar'

/**
 * Server wrapper — fetches translations + user scopes, filters nav items,
 * and passes plain string props to the client AppSidebar.
 */
export async function AppSidebarServer() {
  const [[tNav, tUser], userScopes] = await Promise.all([
    Promise.all([getTranslations('Nav'), getTranslations('UserMenu')]),
    getCurrentUserScopes(),
  ])

  const canSeeB2B = userScopes.includes(Scopes.USERS_WRITE)
  const canSeeUsers = userScopes.includes(Scopes.SETTINGS_WRITE)
  const canSeeSecurity = userScopes.includes(Scopes.SETTINGS_WRITE)

  const nav: AppSidebarLabels['nav'] = [
    {
      label: tNav('retail'),
      icon: <ShoppingBagIcon className="size-4" />,
      items: [{ label: tNav('inventory'), url: Routes.retailProducts }],
    },
  ]

  if (canSeeB2B) {
    nav.push({
      label: tNav('b2b'),
      icon: <BuildingIcon className="size-4" />,
      items: [
        { label: tNav('ss27Collections'), url: Routes.b2bSS27Collections },
        { label: tNav('ss27Products'), url: Routes.b2bSS27Products },
        { label: tNav('createOrder'), url: Routes.b2bCreateOrder },
        { label: tNav('orderHistory'), url: Routes.b2bOrderHistory },
      ],
    })
  }

  return (
    <AppSidebar
      labels={{
        nav,
        settings: tNav('settings'),
        profile: tNav('profile'),
        users: canSeeUsers ? tNav('users') : null,
        security: canSeeSecurity ? tNav('security') : null,
        logout: tUser('logout'),
        logoutTitle: tUser('logoutTitle'),
        logoutConfirm: tUser('logoutConfirm'),
        logoutCancel: tUser('logoutCancel'),
      }}
    />
  )
}

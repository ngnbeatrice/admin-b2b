import { Scopes } from '@/constants/scopes'

/**
 * Defines all pages in the application with their required scopes.
 * This is the single source of truth for page-level authorization.
 */
export interface PageDefinition {
  path: string
  menuGroup: string
  menuLabel: string
  requiredScopes: string[]
}

export const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    path: '/',
    menuGroup: '-',
    menuLabel: 'Home',
    requiredScopes: [],
  },
  {
    path: '/login',
    menuGroup: '-',
    menuLabel: 'Login',
    requiredScopes: [],
  },
  {
    path: '/unauthorized',
    menuGroup: '-',
    menuLabel: 'Unauthorized',
    requiredScopes: [],
  },
  {
    path: '/retail/products',
    menuGroup: 'Retail',
    menuLabel: 'Inventory',
    requiredScopes: [Scopes.USERS_WRITE],
  },
  {
    path: '/retail/products/[id]',
    menuGroup: 'Retail',
    menuLabel: 'Product Detail',
    requiredScopes: [Scopes.USERS_WRITE],
  },
  {
    path: '/settings/profile',
    menuGroup: 'Settings',
    menuLabel: 'Profile',
    requiredScopes: [],
  },
  {
    path: '/settings/users',
    menuGroup: 'Settings',
    menuLabel: 'Users',
    requiredScopes: [Scopes.SETTINGS_WRITE],
  },
  {
    path: '/settings/security',
    menuGroup: 'Settings',
    menuLabel: 'Security',
    requiredScopes: [Scopes.SETTINGS_WRITE],
  },
  {
    path: '/b2b/mbe-order-history',
    menuGroup: 'B2B',
    menuLabel: 'MBE order history',
    requiredScopes: [Scopes.USERS_WRITE],
  },
  {
    path: '/b2b/create-order',
    menuGroup: 'B2B',
    menuLabel: 'Create order',
    requiredScopes: [Scopes.USERS_WRITE],
  },
  {
    path: '/b2b/order-history',
    menuGroup: 'B2B',
    menuLabel: 'Order history',
    requiredScopes: [Scopes.USERS_WRITE],
  },
  {
    path: '/b2b/orders/[id]',
    menuGroup: 'B2B',
    menuLabel: 'Order detail',
    requiredScopes: [Scopes.USERS_WRITE],
  },
]

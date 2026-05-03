export const Routes = {
  home: '/',
  login: '/login',
  retailProducts: '/retail/products',
  retailProduct: (id: string) => `/retail/products/${id}`,
  b2bMbeOrderHistory: '/b2b/mbe-order-history',
  b2bCreateOrder: '/b2b/create-order',
  b2bOrderHistory: '/b2b/order-history',
  settingsProfile: '/settings/profile',
  settingsUsers: '/settings/users',
  settingsSecurity: '/settings/security',
  unauthorized: '/unauthorized',
} as const

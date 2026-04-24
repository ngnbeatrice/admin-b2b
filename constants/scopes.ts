export const Scopes = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  REPORTS_READ: 'reports:read',
  SETTINGS_WRITE: 'settings:write',
} as const

export type Scope = (typeof Scopes)[keyof typeof Scopes]

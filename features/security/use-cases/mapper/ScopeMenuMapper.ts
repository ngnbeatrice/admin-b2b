/**
 * Maps scope names to their corresponding menu group and menu item.
 * This defines which UI elements each scope controls access to.
 */
export class ScopeMenuMapper {
  private static readonly scopeToMenu: Record<
    string,
    { menuGroup: string; menu: string } | undefined
  > = {
    'users:read': { menuGroup: 'Settings', menu: 'Users' },
    'users:write': { menuGroup: 'Settings', menu: 'Users' },
    'users:delete': { menuGroup: 'Settings', menu: 'Users' },
    'reports:read': { menuGroup: 'B2B', menu: 'SS27 Products' },
    'settings:write': { menuGroup: 'Settings', menu: 'Profile' },
  }

  static getMenuInfo(scopeName: string): { menuGroup: string; menu: string } {
    return (
      this.scopeToMenu[scopeName] ?? {
        menuGroup: 'Unknown',
        menu: 'Unknown',
      }
    )
  }
}

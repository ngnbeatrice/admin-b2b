import Logo from '@/components/Logo/Logo'
import { UserMenu } from '@/components/UserMenu/UserMenu'
import { APP_NAME } from '@/constants/app'
import { Routes } from '@/constants/routes'
import { Link } from '@/lib/navigation'

export default function AppNavBar() {
  return (
    <header id="app-nav-bar" className="bg-primary flex h-14 w-full items-center gap-3 px-6">
      <Link href={Routes.home} className="flex items-center gap-3">
        <Logo size={32} id="app-nav-bar-logo" />
        <span id="app-nav-bar-title" className="text-secondary text-lg font-bold">
          {APP_NAME}
        </span>
      </Link>
      <nav className="ml-6 flex items-center gap-4">
        <Link
          href={Routes.products}
          className="text-secondary/80 hover:text-secondary text-sm font-medium transition-colors"
        >
          Products
        </Link>
      </nav>
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  )
}

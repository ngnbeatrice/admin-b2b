'use client'

import { LogOutIcon, UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogoutUserUseCase } from '@/features/users/use-cases/LogoutUserUseCase'

export function UserMenu() {
  const t = useTranslations('UserMenu')

  function handleLogout() {
    const useCase = new LogoutUserUseCase()
    useCase.execute()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id="user-menu-trigger"
        aria-label={t('trigger')}
        className="text-secondary hover:text-secondary/80 focus-visible:ring-ring cursor-pointer rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <UserIcon size={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem id="user-menu-logout" variant="destructive" onClick={handleLogout}>
          <LogOutIcon />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

'use client'

import { LogOutIcon, ChevronRightIcon, SettingsIcon } from 'lucide-react'
import * as React from 'react'
import type { ReactNode } from 'react'

import Logo from '@/components/Logo/Logo'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { APP_NAME, APP_VERSION } from '@/constants/app'
import { Routes } from '@/constants/routes'
import { LogoutUserUseCase } from '@/features/users/use-cases/LogoutUserUseCase'
import { Link, usePathname } from '@/lib/navigation'

interface NavItem {
  label: string
  url: string
}

interface NavSection {
  label: string
  icon: ReactNode
  items: NavItem[]
}

export interface AppSidebarLabels {
  nav: NavSection[]
  settings: string
  profile: string
  users: string | null
  security: string | null
  logout: string
  logoutTitle: string
  logoutConfirm: string
  logoutCancel: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  labels: AppSidebarLabels
}

export function AppSidebar({ labels, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  function handleLogout() {
    const useCase = new LogoutUserUseCase()
    useCase.execute()
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href={Routes.home} className="flex items-center gap-3 px-2 py-3">
          <Logo size={48} id="app-nav-bar-logo" />
          <span
            id="app-nav-bar-title"
            className="text-sidebar-primary font-sans text-base font-bold"
          >
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {labels.nav.map((section) => (
          <Collapsible key={section.label} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
                render={<CollapsibleTrigger />}
              >
                <span className="flex items-center gap-2">
                  {section.icon}
                  {section.label}
                </span>
                <ChevronRightIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          isActive={pathname === item.url}
                          render={<Link href={item.url} />}
                        >
                          {item.label}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}

        {/* Settings section */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel
              className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              render={<CollapsibleTrigger />}
            >
              <span className="flex items-center gap-2">
                <SettingsIcon className="size-4" />
                {labels.settings}
              </span>
              <ChevronRightIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathname === Routes.settingsProfile}
                      render={<Link href={Routes.settingsProfile} />}
                    >
                      {labels.profile}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {labels.users !== null && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={pathname === Routes.settingsUsers}
                        render={<Link href={Routes.settingsUsers} />}
                      >
                        {labels.users}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {labels.security !== null && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={pathname === Routes.settingsSecurity}
                        render={<Link href={Routes.settingsSecurity} />}
                      >
                        {labels.security}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  <SidebarMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <SidebarMenuButton>
                            <LogOutIcon className="size-4" />
                            {labels.logout}
                          </SidebarMenuButton>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{labels.logoutTitle}</AlertDialogTitle>
                          <AlertDialogDescription>{labels.logoutConfirm}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{labels.logoutCancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>
                            {labels.logout}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-muted-foreground px-2 py-1 text-xs">v{APP_VERSION} @linhnhib</p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

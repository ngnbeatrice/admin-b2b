'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { ReactNode } from 'react'

import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Link } from '@/lib/navigation'

interface BreadcrumbSegment {
  label: string
  href?: string
  clickable: boolean
}

const GROUP_SEGMENTS = new Set(['retail', 'b2b', 'settings', 'ss27'])

type NavKey =
  | 'retail'
  | 'inventory'
  | 'b2b'
  | 'ss27'
  | 'ss27Collections'
  | 'ss27Products'
  | 'createOrder'
  | 'orderHistory'
  | 'collections'
  | 'settings'
  | 'profile'
  | 'users'
  | 'unauthorized'
  | 'home'

const SEGMENT_KEY_MAP: Record<string, NavKey> = {
  retail: 'retail',
  b2b: 'b2b',
  ss27: 'ss27',
  collections: 'ss27Collections',
  'create-order': 'createOrder',
  'order-history': 'orderHistory',
  settings: 'settings',
  profile: 'profile',
  users: 'users',
  unauthorized: 'unauthorized',
}

interface AppShellProps {
  readonly children: ReactNode
  readonly sidebar: ReactNode
}

export function AppShell({ children, sidebar }: AppShellProps) {
  const pathname = usePathname()
  const t = useTranslations('Nav')

  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')
  const parts = withoutLocale.split('/').filter(Boolean)

  const breadcrumbs: BreadcrumbSegment[] =
    parts.length === 0
      ? [{ label: t('home'), clickable: false }]
      : parts.map((part, index) => {
          const prevPart = parts[index - 1]
          // 'products' under retail → Inventory, under ss27 → SS27 products
          let key: NavKey | undefined
          if (part === 'products') {
            key = prevPart === 'ss27' ? 'ss27Products' : 'inventory'
          } else {
            key = SEGMENT_KEY_MAP[part]
          }
          const label = key ? t(key) : part
          const href = '/' + parts.slice(0, index + 1).join('/')
          const isLast = index === parts.length - 1
          const clickable = !isLast && !GROUP_SEGMENTS.has(part)
          return { label, href: clickable ? href : undefined, clickable }
        })

  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.label}>
                  <BreadcrumbItem>
                    {index < breadcrumbs.length - 1 ? (
                      crumb.clickable ? (
                        <BreadcrumbLink
                          className="hidden md:block"
                          render={(props) => <Link {...props} href={crumb.href!} />}
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-foreground hidden md:block">{crumb.label}</span>
                      )
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <LocaleSwitcher />
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

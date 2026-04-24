'use client'

import { GlobeIcon } from 'lucide-react'
import { useParams, usePathname, useRouter } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { locales, type Locale } from '@/constants/i18n'

export function LocaleSwitcher() {
  const params = useParams()
  const pathname = usePathname() // e.g. /fr/settings/profile
  const router = useRouter()
  const currentLocale = (params.locale as Locale) ?? 'en'

  function handleChange(locale: Locale) {
    if (locale === currentLocale) return
    const newPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${locale}$1`)
    router.replace(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs uppercase transition-colors">
            <GlobeIcon className="size-3.5" />
            {currentLocale}
          </button>
        }
      />
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleChange(locale)}
            className={locale === currentLocale ? 'font-semibold' : ''}
          >
            {locale.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

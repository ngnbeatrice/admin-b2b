import { getTranslations } from 'next-intl/server'

import { APP_AUTHOR, APP_VERSION } from '@/constants/app'

export default async function AppFooter() {
  const t = await getTranslations('Footer')
  const year = new Date().getFullYear()

  return (
    <footer
      id="app-footer"
      className="bg-primary flex h-10 w-full items-center justify-between px-6"
    >
      <span className="text-secondary text-sm">{t('copyright', { year, author: APP_AUTHOR })}</span>
      <span className="text-secondary text-sm">
        {t('version')} {APP_VERSION}
      </span>
    </footer>
  )
}

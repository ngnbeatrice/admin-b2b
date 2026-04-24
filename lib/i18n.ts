import type { AbstractIntlMessages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { Locale, defaultLocale } from '@/constants/i18n'

const messageImports: Record<Locale, () => Promise<{ default: AbstractIntlMessages }>> = {
  [Locale.EN]: () => import('../messages/en.json'),
  [Locale.FR]: () => import('../messages/fr.json'),
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale
  const safeLocale = (Object.values(Locale) as string[]).includes(locale)
    ? (locale as Locale)
    : defaultLocale
  const messages = (await (messageImports[safeLocale] ?? messageImports[defaultLocale])()).default
  return { locale: safeLocale, messages }
})

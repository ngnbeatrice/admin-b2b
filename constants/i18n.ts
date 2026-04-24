export const Locale = {
  EN: 'en',
  FR: 'fr',
} as const

export type Locale = (typeof Locale)[keyof typeof Locale]

export const locales = Object.values(Locale) as Locale[]

export const defaultLocale: Locale = Locale.EN

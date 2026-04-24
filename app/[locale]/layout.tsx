import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { inter, dmSans, jetbrainsMono } from '@/app/layout'
import AppLoader from '@/components/AppLoader/AppLoader'
import { AppSidebarServer } from '@/components/AppSidebar/AppSidebarServer'
import { AuthGuard } from '@/components/AuthGuard/AuthGuard'
import { Toaster } from '@/components/ui/sonner'
import { locales, type Locale } from '@/constants/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen-safe overflow-x-hidden">
        <AppLoader>
          <NextIntlClientProvider>
            <AuthGuard sidebar={<AppSidebarServer />}>{children}</AuthGuard>
            <Toaster />
          </NextIntlClientProvider>
        </AppLoader>
      </body>
    </html>
  )
}

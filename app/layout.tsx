import type { Metadata } from 'next'
import { Inter, DM_Sans, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import './globals.css'

export const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })
export const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-secondary' })
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  icons: { icon: '/logo.svg' },
}

/**
 * Minimal root layout — <html> and <body> are owned by the [locale] layout
 * so it can set lang={locale} per the i18n rules.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children as React.ReactElement
}

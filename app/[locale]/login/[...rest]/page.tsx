import { redirect as nextRedirect } from 'next/navigation'

/**
 * Any unknown sub-path under /login (e.g. /login/sqdsd) redirects to /login.
 */
export default async function LoginCatchAll({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  nextRedirect(`/${locale}/login`)
}

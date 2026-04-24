import { ProfileScreen } from './_components/ProfileScreen'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return <ProfileScreen locale={locale} />
}

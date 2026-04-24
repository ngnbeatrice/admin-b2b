import { UserDetailsCard } from '@/app/[locale]/_components/UserDetailsCard'
import { auth } from '@/auth'
import { UserRepository } from '@/features/users/repository/UserRepository'
import { GetUserDetailsUseCase } from '@/features/users/use-cases/GetUserDetailsUseCase'

interface ProfileScreenProps {
  readonly locale: string
}

export async function ProfileScreen({ locale }: ProfileScreenProps) {
  const session = await auth()

  if (!session?.user?.id) return null

  const user = await new GetUserDetailsUseCase(new UserRepository()).execute(
    session.user.id,
    locale
  )

  return (
    <section className="flex flex-1 flex-col items-center p-6">
      <UserDetailsCard user={user} />
    </section>
  )
}

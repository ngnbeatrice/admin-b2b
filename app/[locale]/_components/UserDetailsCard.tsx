import { MailIcon, CalendarIcon, ShieldCheckIcon, LayersIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { GetUserDetailsViewModel } from '@/features/users'

interface UserDetailsCardProps {
  readonly user: GetUserDetailsViewModel
}

export async function UserDetailsCard({ user }: UserDetailsCardProps) {
  const t = await getTranslations('ProfilePage')

  return (
    <Card id="user-details-card" className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex items-center gap-3">
          <MailIcon size={16} className="text-muted-foreground shrink-0" />
          <span className="font-mono text-sm">{user.email}</span>
        </div>

        {/* Member since */}
        <div className="flex items-center gap-3">
          <CalendarIcon size={16} className="text-muted-foreground shrink-0" />
          <span className="text-muted-foreground text-sm">
            {t('memberSince', { date: user.createdAt })}
          </span>
        </div>

        {user.groups.length > 0 && (
          <>
            <Separator />

            {/* Groups + their scopes */}
            <div className="flex flex-col gap-3">
              {user.groups.map((group) => (
                <div key={group.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <LayersIcon size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground text-sm font-medium">{group.name}</span>
                  </div>
                  {group.scopes.length > 0 && (
                    <div className="ml-6 flex flex-wrap gap-1.5">
                      {group.scopes.map((scope) => (
                        <Badge
                          key={scope.id}
                          id={`scope-badge-${scope.id}`}
                          variant="secondary"
                          className="flex items-center gap-1 text-xs"
                        >
                          <ShieldCheckIcon size={10} />
                          {scope.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

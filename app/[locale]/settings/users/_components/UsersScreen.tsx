import { ShieldAlertIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetAllUsersUseCase, UserRepository } from '@/features/users'

interface UsersScreenProps {
  readonly locale: string
}

export async function UsersScreen({ locale }: UsersScreenProps) {
  const t = await getTranslations('UsersPage')

  const users = await new GetAllUsersUseCase(new UserRepository()).execute(locale)

  return (
    <section className="flex flex-1 flex-col items-center p-6">
      <Card className="w-full max-w-6xl">
        <CardContent>
          <h2 className="text-foreground mb-4 text-base font-semibold">{t('title')}</h2>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('columnEmail')}</TableHead>
                    <TableHead>{t('columnGroups')}</TableHead>
                    <TableHead>{t('columnScopes')}</TableHead>
                    <TableHead>{t('columnFailedAttempts')}</TableHead>
                    <TableHead>{t('columnStatus')}</TableHead>
                    <TableHead>{t('columnBlockedDate')}</TableHead>
                    <TableHead>{t('columnBlockedBy')}</TableHead>
                    <TableHead>{t('columnCreatedAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.groups.map((group) => (
                              <Badge key={group} variant="secondary" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs opacity-50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.scopes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.scopes.map((scope) => (
                              <Badge key={scope} variant="outline" className="font-mono text-xs">
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs opacity-50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.failedLoginAttempts > 0 ? (
                          <span className="text-warning font-medium">
                            {user.failedLoginAttempts}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.isBlocked ? (
                          <Badge variant="destructive" className="flex w-fit items-center gap-1">
                            <ShieldAlertIcon size={12} />
                            {t('blocked')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-success">
                            {t('active')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.blockedAt || <span className="text-xs opacity-50">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.blockedBy || <span className="text-xs opacity-50">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

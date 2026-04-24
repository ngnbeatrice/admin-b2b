'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PageAccessViewModel } from '@/features/security'

interface PageAccessTableProps {
  readonly pages: PageAccessViewModel[]
}

export function PageAccessTable({ pages }: PageAccessTableProps) {
  const t = useTranslations('SecurityPage')

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('columnPagePath')}</TableHead>
            <TableHead>{t('columnMenuGroup')}</TableHead>
            <TableHead>{t('columnMenuLabel')}</TableHead>
            <TableHead>{t('columnRequiredScopes')}</TableHead>
            <TableHead>{t('columnGroupAccess')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.path}>
              <TableCell className="font-mono text-sm">{page.path}</TableCell>
              <TableCell className="font-medium">{page.menuGroup}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{page.menuLabel}</TableCell>
              <TableCell>
                {page.requiredScopes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {page.requiredScopes.map((scope) => (
                      <Badge key={scope} variant="outline" className="font-mono text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">None</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {page.groupsWithAccess.map((group) => (
                    <Badge
                      key={group}
                      variant={group === 'All authenticated users' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {group}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

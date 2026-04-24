import { getTranslations } from 'next-intl/server'

import { Card, CardContent } from '@/components/ui/card'
import { GetPageAccessUseCase, SecurityRepository } from '@/features/security'

import { PageAccessTable } from './PageAccessTable'

/**
 * Server component — fetches all pages with their required scopes
 * and displays which groups have access to each page.
 */
export async function SecurityScreen() {
  const t = await getTranslations('SecurityPage')

  const useCase = new GetPageAccessUseCase(new SecurityRepository())
  const pages = await useCase.execute()

  return (
    <section id="screen-security" className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          {pages.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('empty')}</p>
          ) : (
            <PageAccessTable pages={pages} />
          )}
        </CardContent>
      </Card>
    </section>
  )
}

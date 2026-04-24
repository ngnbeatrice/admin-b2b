import { PaletteIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { ImageWithFallback } from '@/components/ImageWithFallback/ImageWithFallback'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CollectionRepository, GetAllCollectionsUseCase } from '@/features/collections'
import { ColorRepository, GetAllColorsUseCase } from '@/features/colors'

interface SS27CollectionsScreenProps {
  readonly locale: string
}

export async function SS27CollectionsScreen({ locale }: SS27CollectionsScreenProps) {
  const t = await getTranslations('CollectionsPage')

  const [collections, colors] = await Promise.all([
    new GetAllCollectionsUseCase(new CollectionRepository()).execute(locale),
    new GetAllColorsUseCase(new ColorRepository()).execute(locale),
  ])

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
        <span className="text-muted-foreground text-sm">
          {t('total', { count: collections.length })}
        </span>
      </div>

      {/* Collections table */}
      <Card className="w-full">
        <CardContent className="p-4">
          {collections.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('columnName')}</TableHead>
                  <TableHead>{t('columnDescription')}</TableHead>
                  <TableHead>{t('columnColors')}</TableHead>
                  <TableHead>{t('columnCreatedAt')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {collection.description ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {collection.colors.map((color) => (
                          <div key={color.id} className="flex items-center gap-1.5">
                            {color.imageUrl ? (
                              <div className="relative size-6 overflow-hidden rounded-full border border-[var(--color-border)]">
                                <ImageWithFallback
                                  src={color.imageUrl}
                                  alt={color.name}
                                  fill
                                  sizes="24px"
                                  className="object-cover"
                                  fallback={
                                    <div className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full">
                                      <PaletteIcon className="size-3" />
                                    </div>
                                  }
                                />
                              </div>
                            ) : (
                              <div className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full border border-[var(--color-border)]">
                                <PaletteIcon className="size-3" />
                              </div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {color.name}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {collection.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Colors table */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('colorsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {colors.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('colorsEmpty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16" />
                  <TableHead>{t('colorColumnName')}</TableHead>
                  <TableHead>{t('colorColumnDescription')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell>
                      {color.imageUrl ? (
                        <div className="relative size-10 overflow-hidden rounded-full border border-[var(--color-border)]">
                          <ImageWithFallback
                            src={color.imageUrl}
                            alt={color.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            fallback={
                              <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
                                <PaletteIcon className="size-4" />
                              </div>
                            }
                          />
                        </div>
                      ) : (
                        <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full border border-[var(--color-border)]">
                          <PaletteIcon className="size-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{color.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {color.description ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

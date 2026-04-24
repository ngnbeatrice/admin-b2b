import { getTranslations } from 'next-intl/server'

import { Card, CardContent } from '@/components/ui/card'
import { GetAllNewProductsUseCase, NewProductRepository } from '@/features/new-products'

import { SkuCheckTable } from './SkuCheckTable'

interface SS27ProductsScreenProps {
  readonly locale: string
}

export async function SS27ProductsScreen({ locale }: SS27ProductsScreenProps) {
  const t = await getTranslations('NewProductsPage')

  const products = await new GetAllNewProductsUseCase(new NewProductRepository()).execute(locale)

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
        <span className="text-muted-foreground text-sm">
          {t('total', { count: products.length })}
        </span>
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          {products.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('empty')}</p>
          ) : (
            <SkuCheckTable products={products} />
          )}
        </CardContent>
      </Card>
    </section>
  )
}

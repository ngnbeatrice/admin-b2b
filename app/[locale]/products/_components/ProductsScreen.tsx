import { getTranslations } from 'next-intl/server'

import { Card, CardContent } from '@/components/ui/card'
import { GetAllProductsUseCase, ShopifyClient } from '@/features/products'

import { ProductsTable } from './ProductsTable'

/**
 * Server component — fetches all Shopify products and passes them to the
 * client ProductsTable which handles SKU / collection filtering.
 */
export async function ProductsScreen() {
  const t = await getTranslations('ProductsPage')

  const useCase = new GetAllProductsUseCase(new ShopifyClient())
  const { products, total } = await useCase.execute()

  return (
    <section id="screen-products" className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
        <span className="text-muted-foreground text-sm">{t('total', { count: total })}</span>
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          {products.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('empty')}</p>
          ) : (
            <ProductsTable products={products} />
          )}
        </CardContent>
      </Card>
    </section>
  )
}

import { AlertTriangleIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { GetAllProductsUseCase, MbeClient, ShopifyClient } from '@/features/products'

import { OrphanedMbeVariantsTable } from './OrphanedMbeVariantsTable'
import { ProductsTable } from './ProductsTable'

/**
 * Server component — fetches all Shopify products and MBE warehouse data,
 * merges them, and passes to the client ProductsTable which handles filtering.
 * If MBE data fails to load, displays Shopify data only with a warning.
 */
export async function ProductsScreen() {
  const t = await getTranslations('ProductsPage')

  const useCase = new GetAllProductsUseCase(new ShopifyClient(), new MbeClient())
  const { products, total, orphanedMbeVariants, mbeDataAvailable } = await useCase.execute()

  return (
    <section id="screen-products" className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
        <span className="text-muted-foreground text-sm">{t('total', { count: total })}</span>
      </div>

      {!mbeDataAvailable && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>{t('mbeDataUnavailableTitle')}</AlertTitle>
          <AlertDescription>{t('mbeDataUnavailableDescription')}</AlertDescription>
        </Alert>
      )}

      {orphanedMbeVariants.length > 0 && (
        <Card className="w-full">
          <CardContent className="p-4">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              {t('orphanedVariantsTitle', { count: orphanedMbeVariants.length })}
            </h2>
            <OrphanedMbeVariantsTable variants={orphanedMbeVariants} />
          </CardContent>
        </Card>
      )}

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

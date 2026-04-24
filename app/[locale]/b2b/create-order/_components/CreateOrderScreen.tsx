import { getTranslations } from 'next-intl/server'

import { Card, CardContent } from '@/components/ui/card'
import { GetAllProductsForCreateOrderUseCase, ShopifyClient } from '@/features/products'

import { CreateOrderTable } from './CreateOrderTable'

/**
 * Server component — fetches all Shopify products and passes them to the
 * client CreateOrderTable which handles SKU / variant filtering.
 */
export async function CreateOrderScreen() {
  const t = await getTranslations('CreateOrderPage')

  const useCase = new GetAllProductsForCreateOrderUseCase(new ShopifyClient())
  const { products } = await useCase.execute()

  return (
    <section id="screen-create-order" className="flex flex-1 flex-col gap-6 p-6">
      {products.length === 0 ? (
        <Card className="w-full">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">{t('empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <CreateOrderTable products={products} />
      )}
    </section>
  )
}

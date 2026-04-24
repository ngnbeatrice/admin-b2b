import { getTranslations } from 'next-intl/server'

import { GetAllOrdersUseCase, OrderRepository } from '@/features/orders'

import { OrderHistoryTable } from './OrderHistoryTable'

export async function OrderHistoryScreen() {
  const t = await getTranslations('OrderHistoryPage')

  const useCase = new GetAllOrdersUseCase(new OrderRepository())
  const orders = await useCase.execute()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('total', { count: orders.length })}</p>
        </div>
      </div>

      <OrderHistoryTable orders={orders} />
    </div>
  )
}

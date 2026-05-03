import { notFound } from 'next/navigation'

import { MbeClient } from '@/features/mbe-orders/client/MbeClient'
import { MbeOrdersRepository } from '@/features/mbe-orders/repository/MbeOrdersRepository'
import { UpdateMbeOrderUseCase } from '@/features/mbe-orders/use-cases/UpdateMbeOrderUseCase'
import { ShopifyClient } from '@/features/products/client/ShopifyClient'

import { MbeOrderDetailClient } from './MbeOrderDetailClient'

interface MbeOrderDetailScreenProps {
  orderId: string
}

export async function MbeOrderDetailScreen({ orderId }: MbeOrderDetailScreenProps) {
  const mbeClient = new MbeClient()
  const repository = new MbeOrdersRepository()
  const shopifyClient = new ShopifyClient()
  const useCase = new UpdateMbeOrderUseCase(mbeClient, repository, shopifyClient)

  const result = await useCase.execute(orderId)

  if (!result.order && !result.error) {
    notFound()
  }

  return <MbeOrderDetailClient order={result.order} error={result.error} />
}

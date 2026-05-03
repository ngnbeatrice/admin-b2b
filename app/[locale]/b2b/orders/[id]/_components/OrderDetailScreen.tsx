import { ArrowLeftIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Routes } from '@/constants/routes'
import { GetOrderDetailUseCase, OrderRepository } from '@/features/orders'
import { Link } from '@/lib/navigation'

import { OrderItemsTable } from './OrderItemsTable'

interface OrderDetailScreenProps {
  orderId: string
}

export async function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const t = await getTranslations('OrderDetailPage')

  const useCase = new GetOrderDetailUseCase(new OrderRepository())
  const order = await useCase.execute(orderId)

  if (!order) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href={Routes.b2bOrderHistory}
          className={buttonVariants({ variant: 'outline', size: 'icon' })}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold">{t('orderInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {t('orderId')}
              </span>
              <p className="font-mono text-sm">{order.id}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {t('customerEmail')}
              </span>
              <p className="font-medium">{order.customerEmail}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t('status')}
                </span>
                <div>
                  <Badge
                    variant={
                      order.status === 'Sent order' || order.status === 'Received'
                        ? 'default'
                        : 'secondary'
                    }
                    className={
                      order.status === 'Received' ? 'bg-green-600 font-normal' : 'font-normal'
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t('paid')}
                </span>
                <div>
                  {order.paid ? (
                    <Badge variant="default" className="bg-green-600 font-normal">
                      {t('yes')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-normal">
                      {t('no')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t('createdAt')}
                </span>
                <span className="text-sm">{order.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t('createdBy')}
                </span>
                <span className="text-sm">{order.createdBy || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold">{t('orderSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                  {t('totalItems', { count: order.items.length })}
                </p>
                <p className="text-2xl font-semibold">{order.items.length}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                  {t('totalQuantity')}
                </p>
                <p className="text-2xl font-semibold">{order.totalQuantity}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-foreground mb-1 text-xs font-bold tracking-wider uppercase">
                  {t('totalAmount')}
                </p>
                <p className="text-3xl font-bold">{order.totalAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OrderItemsTable items={order.items} />
    </div>
  )
}

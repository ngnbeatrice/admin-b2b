'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MbeOrderState } from '@/features/mbe-orders/domain/MbeOrderState'
import type { GetMbeOrderDetailViewModel } from '@/features/mbe-orders/use-cases/user-view/GetMbeOrderDetailViewModel'
import { Link } from '@/lib/navigation'

import { MbeOrderProductsTable } from './MbeOrderProductsTable'

interface MbeOrderDetailClientProps {
  order: GetMbeOrderDetailViewModel | null
  error?: string
}

export function MbeOrderDetailClient({ order, error }: MbeOrderDetailClientProps) {
  const t = useTranslations('MbeOrderDetailPage')

  useEffect(() => {
    if (error) {
      // Check if this is a cached data warning (not a critical error)
      const isCachedDataWarning =
        error.includes('cached data') || error.includes('données en cache')

      if (isCachedDataWarning) {
        toast.warning(t('mbeApiUnavailable'), {
          description: t('cachedDataWarning'),
          duration: 6000,
        })
      } else {
        toast.error(t('loadError'), {
          description: error,
          duration: 5000,
        })
      }
    }
  }, [error, t])

  if (!order) {
    return null
  }

  function getStateBadgeColor(state: number | null): string {
    if (state === null) {
      return 'border-[var(--color-muted)] bg-[var(--color-muted)]/10 text-[var(--color-muted)]'
    }
    switch (state) {
      case MbeOrderState.DRAFT:
        return 'border-[var(--color-info)] bg-[var(--color-info)]/10 text-[var(--color-info)]'
      case MbeOrderState.CONFIRMED:
        return 'border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
      case MbeOrderState.DELETED:
        return 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]'
      case MbeOrderState.FULFILLED:
        return 'border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]'
      default:
        return 'border-[var(--color-muted)] bg-[var(--color-muted)]/10 text-[var(--color-muted)]'
    }
  }

  function getStateLabel(state: number | null): string {
    if (state === null) {
      return t('stateUnknown')
    }
    switch (state) {
      case MbeOrderState.DRAFT:
        return t('stateDraft')
      case MbeOrderState.CONFIRMED:
        return t('stateConfirmed')
      case MbeOrderState.DELETED:
        return t('stateDeleted')
      case MbeOrderState.FULFILLED:
        return t('stateFulfilled')
      default:
        return t('stateUnknown')
    }
  }

  const formattedCreationTime = order.creation_time
    ? new Date(order.creation_time).toLocaleString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : '—'

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/b2b/mbe-order-history">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-foreground text-2xl font-semibold">
            {t('title')} {order.num}
          </h1>
        </div>
        <Badge variant="outline" className={getStateBadgeColor(order.state)}>
          {getStateLabel(order.state)}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('orderInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('orderNumber')}</span>
              <span className="text-sm font-medium">{order.num || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('creationTime')}</span>
              <span className="font-mono text-sm">{formattedCreationTime}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('deposit')}</span>
              <span className="text-sm">{order.deposit || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('departmentId')}</span>
              <span className="text-sm">{order.department_id || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('reason')}</span>
              <span className="text-sm">{order.reason || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('operator')}</span>
              <span className="text-sm">{order.operator || '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('shippingInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('trackingNumber')}</span>
              <span className="font-mono text-sm">{order.tracking_number || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('trackingNumberMbe')}</span>
              <span className="font-mono text-sm">{order.tracking_number_mbe || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('transport')}</span>
              <span className="text-sm">{order.transport || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('portShipment')}</span>
              <span className="text-sm">{order.port_shipment || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('shippingPackages')}</span>
              <span className="text-sm">{order.shipping_packages ?? '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground text-sm">{t('companyName')}</span>
              <span className="text-sm">{order.company_name || '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.note && (
        <Card>
          <CardHeader>
            <CardTitle>{t('notes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.note}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {t('products')} ({order.total_products})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MbeOrderProductsTable products={order.products} orderNumber={order.num} />
        </CardContent>
      </Card>
    </section>
  )
}

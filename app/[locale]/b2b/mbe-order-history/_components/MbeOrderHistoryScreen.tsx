'use client'

import { RefreshCwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import type { GetAllMbeOrdersResult } from '@/features/mbe-orders'
import { MbeOrderState } from '@/features/mbe-orders/domain/MbeOrderState'

import { MbeOrderHistoryFilters } from './MbeOrderHistoryFilters'
import { MbeOrderHistoryTable } from './MbeOrderHistoryTable'
import { MbeSyncErrorToast } from './MbeSyncErrorToast'

interface MbeOrderHistoryScreenProps {
  readonly initialData: GetAllMbeOrdersResult
  readonly dateFrom?: string
  readonly dateTo?: string
  readonly initialSku?: string
}

/**
 * Client component — displays MBE order history with date filters and refresh capability
 */
export function MbeOrderHistoryScreen({
  initialData,
  dateFrom,
  dateTo,
  initialSku,
}: MbeOrderHistoryScreenProps) {
  const t = useTranslations('MbeOrderHistoryPage')
  const [data, setData] = useState(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [skuFilter, setSkuFilter] = useState(initialSku ?? '')
  const [stateFilter, setStateFilter] = useState<string[]>(
    initialSku
      ? [String(MbeOrderState.CONFIRMED), String(MbeOrderState.DRAFT)]
      : [String(MbeOrderState.CONFIRMED)]
  )

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.set('date_from', dateFrom)
      if (dateTo) params.set('date_to', dateTo)
      if (initialSku) params.set('sku', initialSku)

      const response = await fetch(`/api/mbe-orders?${params.toString()}`, {
        method: 'GET',
      })

      if (!response.ok) {
        console.error('Failed to refresh orders')
        return
      }

      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Failed to refresh orders:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  function handleOrderDeleted(orderId: string) {
    // Remove the deleted order from the local state without full refresh
    setData((prevData) => ({
      ...prevData,
      orders: prevData.orders.filter((order) => order.id !== orderId),
    }))
  }

  // Filter orders by SKU and state
  const filteredOrders = useMemo(() => {
    let filtered = data.orders

    // Filter by state (multiple selection)
    if (stateFilter.length > 0) {
      const stateValues = stateFilter.map((s) => Number(s))
      filtered = filtered.filter((order) => stateValues.includes(order.state ?? -1))
    }

    // Filter by SKU
    if (skuFilter.trim()) {
      const lowerSkuFilter = skuFilter.toLowerCase().trim()
      filtered = filtered.filter((order) =>
        order.products_sku.some((sku) => sku.toLowerCase().includes(lowerSkuFilter))
      )
    }

    return filtered
  }, [data.orders, skuFilter, stateFilter])

  // Format the last sync date for display
  const formattedLastSync = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(data.lastSyncDate))

  return (
    <section id="screen-mbe-order-history" className="flex flex-1 flex-col gap-6 p-6">
      {data.syncError && <MbeSyncErrorToast message={data.syncError} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm italic">
            <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>
              {t('lastSync')} : {formattedLastSync}
            </span>
          </div>
        </div>
        <span className="text-muted-foreground text-sm">
          {t('total', { count: filteredOrders.length })}
        </span>
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          <div className="mb-4">
            <MbeOrderHistoryFilters
              savedCount={data.savedCount}
              skuList={data.product_sku_unique_list}
              skuFilter={skuFilter}
              onSkuFilterChange={setSkuFilter}
              stateFilter={stateFilter}
              onStateFilterChange={setStateFilter}
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center text-sm">{t('empty')}</p>
            </div>
          ) : (
            <MbeOrderHistoryTable
              orders={filteredOrders}
              onRefresh={handleRefresh}
              onOrderDeleted={handleOrderDeleted}
            />
          )}
        </CardContent>
      </Card>
    </section>
  )
}

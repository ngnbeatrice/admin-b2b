'use client'

import { AlertTriangleIcon, EyeIcon, RefreshCwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { GetAllMbeOrdersViewModel } from '@/features/mbe-orders'
import { MbeOrderState } from '@/features/mbe-orders/domain/MbeOrderState'
import { Link } from '@/lib/navigation'

interface MbeOrderHistoryTableProps {
  readonly orders: GetAllMbeOrdersViewModel[]
  readonly onRefresh: () => Promise<void>
  readonly onOrderDeleted: (orderId: string) => void
}

export function MbeOrderHistoryTable({
  orders,
  onRefresh,
  onOrderDeleted,
}: MbeOrderHistoryTableProps) {
  const t = useTranslations('MbeOrderHistoryPage')
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null)

  async function handleSyncOrder(orderId: string) {
    setSyncingOrderId(orderId)
    try {
      const response = await fetch(`/api/mbe-orders/${orderId}/sync`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to sync order:', error)

        // Check if the error indicates the order was deleted
        const errorMessage = error.error || t('syncErrorDescription')
        const isDeleted =
          errorMessage.includes('not found in MBE API') &&
          errorMessage.includes('deleted from database')

        toast.error(t('syncError'), {
          description: errorMessage,
        })

        // If order was deleted, remove it from the list without full refresh
        if (isDeleted) {
          onOrderDeleted(orderId)
        }

        return
      }

      // Refresh the entire list after successful sync
      await onRefresh()
      toast.success(t('syncSuccess'))
    } catch (error) {
      console.error('Failed to sync order:', error)
      toast.error(t('syncError'), {
        description: error instanceof Error ? error.message : t('syncErrorDescription'),
      })
    } finally {
      setSyncingOrderId(null)
    }
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

  function truncateOrderNumber(orderNum: string): string {
    if (orderNum.length > 7) {
      return `${orderNum.slice(0, 7)}...`
    }
    return orderNum
  }

  function truncateCompanyName(companyName: string): string {
    if (companyName.length > 20) {
      return `${companyName.slice(0, 20)}...`
    }
    return companyName
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('columnOrderNumber')}</TableHead>
            <TableHead className="text-center">{t('columnActions')}</TableHead>
            <TableHead>{t('columnCompany')}</TableHead>
            <TableHead>{t('columnTrackingNumber')}</TableHead>
            <TableHead>{t('columnDate')}</TableHead>
            <TableHead>{t('columnState')}</TableHead>
            <TableHead>{t('columnDescription')}</TableHead>
            <TableHead className="text-right">{t('columnQuantity')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            // Format creation_time to display date and time without timezone
            const dateTime = new Date(order.creation_time)
            const formattedDateTime = dateTime
              .toLocaleString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })
              .replace(',', '')

            const truncatedOrderNum = truncateOrderNumber(order.num)
            const shouldShowOrderTooltip = order.num.length > 7

            const companyName = order.company_name || '—'
            const truncatedCompanyName = truncateCompanyName(companyName)
            const shouldShowCompanyTooltip = companyName.length > 20 && companyName !== '—'

            // Check if this is an error order
            const isErrorOrder = order.num.includes('SYNC ERROR')

            return (
              <TableRow key={order.id} className={isErrorOrder ? 'bg-red-50 hover:bg-red-100' : ''}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isErrorOrder && (
                      <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 text-red-600" />
                    )}
                    {shouldShowOrderTooltip ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={<span className="cursor-default">{truncatedOrderNum}</span>}
                          />
                          <TooltipContent>{order.num}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span>{order.num}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Link
                              href={`/b2b/mbe-orders/${order.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          }
                        />
                        <TooltipContent>{t('viewOrder')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncOrder(order.id)}
                              disabled={syncingOrderId === order.id}
                              className="h-8 w-8 p-0"
                            >
                              <RefreshCwIcon
                                className={`h-4 w-4 ${syncingOrderId === order.id ? 'animate-spin' : ''}`}
                              />
                            </Button>
                          }
                        />
                        <TooltipContent>{t('syncOrder')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  {shouldShowCompanyTooltip ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={<span className="cursor-default">{truncatedCompanyName}</span>}
                        />
                        <TooltipContent>{companyName}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    companyName
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {order.tracking_number_mbe || '—'}
                </TableCell>
                <TableCell className="font-mono text-sm">{formattedDateTime}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStateBadgeColor(order.state)}>
                    {getStateLabel(order.state)}
                  </Badge>
                </TableCell>
                <TableCell>{order.state_description}</TableCell>
                <TableCell className="text-right font-mono">{order.total_products}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

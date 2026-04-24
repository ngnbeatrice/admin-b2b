'use client'

import { EyeIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { GetAllOrdersViewModel } from '@/features/orders'
import { Link } from '@/lib/navigation'

interface OrderHistoryTableProps {
  readonly orders: GetAllOrdersViewModel[]
}

export function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  const t = useTranslations('OrderHistoryPage')

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t('columnOrderDetails')}</TableHead>
            <TableHead>{t('columnCustomerEmail')}</TableHead>
            <TableHead className="text-center">{t('columnTotalQuantity')}</TableHead>
            <TableHead className="text-right">{t('columnTotalAmount')}</TableHead>
            <TableHead>{t('columnStatus')}</TableHead>
            <TableHead className="text-center">{t('columnPaid')}</TableHead>
            <TableHead>{t('columnCreatedAt')}</TableHead>
            <TableHead>{t('columnCreatedBy')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Link
                        href={`/b2b/orders/${order.id}`}
                        className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('viewDetails')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>{order.customerEmail}</TableCell>
              <TableCell className="text-center">{order.totalQuantity}</TableCell>
              <TableCell className="text-right font-medium">{order.totalAmount}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === 'Sent order' || order.status === 'Received'
                      ? 'default'
                      : 'secondary'
                  }
                  className={order.status === 'Received' ? 'bg-green-600' : ''}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {order.paid ? (
                  <Badge variant="default" className="bg-green-600">
                    {t('yes')}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{t('no')}</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{order.createdAt}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {order.createdBy || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

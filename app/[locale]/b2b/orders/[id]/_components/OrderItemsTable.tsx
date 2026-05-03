'use client'

import { EyeIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PRODUCT_IMAGE_BLUR_DATA_URL } from '@/constants/images'
import { Routes } from '@/constants/routes'
import type { GetOrderDetailViewModel } from '@/features/orders'
import { Link } from '@/lib/navigation'

/** Extracts the numeric ID from a Shopify GID (e.g. "gid://shopify/Product/123" → "123") */
function extractNumericId(gid: string): string {
  return gid.split('/').pop() ?? gid
}

interface OrderItemsTableProps {
  items: GetOrderDetailViewModel['items']
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  const t = useTranslations('OrderDetailPage')

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('orderItems')} ({t('totalItems', { count: items.length })})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('columnProduct')}</TableHead>
              <TableHead className="w-[80px]">{t('columnProductDetails')}</TableHead>
              <TableHead>{t('columnVariant')}</TableHead>
              <TableHead className="text-center">{t('columnQuantity')}</TableHead>
              <TableHead className="text-right">{t('columnUnitPrice')}</TableHead>
              <TableHead className="text-right">{t('columnTotal')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {item.productImageUrl ? (
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <Image
                          src={item.productImageUrl}
                          alt={item.productTitle}
                          fill
                          sizes="48px"
                          className="rounded-md object-cover"
                          placeholder="blur"
                          blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
                        />
                      </div>
                    ) : (
                      <div className="bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md">
                        <span className="text-muted-foreground text-xs">No image</span>
                      </div>
                    )}
                    <span className="font-medium">{item.productTitle}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger
                        render={(props) => (
                          <Link
                            {...props}
                            href={Routes.retailProduct(extractNumericId(item.productId))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        )}
                      />
                      <TooltipContent>
                        <p>{t('viewProduct')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.variantTitle}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{item.unitPrice}</TableCell>
                <TableCell className="text-right font-medium">{item.totalPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

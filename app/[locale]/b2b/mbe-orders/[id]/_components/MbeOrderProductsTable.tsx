'use client'

import { DownloadIcon, ExternalLinkIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PRODUCT_IMAGE_BLUR_DATA_URL } from '@/constants/images'
import type { MbeOrderProductViewModel } from '@/features/mbe-orders/use-cases/user-view/GetMbeOrderDetailViewModel'
import { TableExportService } from '@/utils/export'

interface MbeOrderProductsTableProps {
  products: MbeOrderProductViewModel[]
  orderNumber: string
}

export function MbeOrderProductsTable({ products, orderNumber }: MbeOrderProductsTableProps) {
  const t = useTranslations('MbeOrderDetailPage')

  function exportToCSV() {
    const columns = TableExportService.buildColumns<MbeOrderProductViewModel>()
      .addColumn(t('productId'), (row) => row.product_id)
      .addColumn(t('sku'), (row) => row.sku ?? '—')
      .addColumn(t('description'), (row) => row.description ?? '—')
      .addColumn(t('quantity'), (row) => row.quantity)
      .build()

    TableExportService.quickExport({
      title: `MBE Order ${orderNumber} - Products`,
      baseFilename: `MBE_order_${orderNumber}_products`,
      columns,
      data: products,
      format: 'csv',
    })
  }

  function exportToHTML() {
    const columns = TableExportService.buildColumns<MbeOrderProductViewModel>()
      .addColumn('', () => '', { width: '64px' }) // Image column (first)
      .addColumn(t('productId'), (row) => row.product_id)
      .addColumn(t('sku'), (row) => row.sku ?? '—')
      .addColumn(t('description'), (row) => row.description ?? '—')
      .addColumn(t('quantity'), (row) => row.quantity, { className: 'text-right' })
      .build()

    TableExportService.export({
      title: `MBE Order ${orderNumber} - Products`,
      baseFilename: `MBE_order_${orderNumber}_products`,
      columns,
      data: products,
      format: 'html',
      metadata: {
        'Order Number': orderNumber,
        'Total Products': products.length,
        'Total Quantity': products.reduce((sum, p) => sum + p.quantity, 0),
      },
      factoryConfig: {
        html: {
          customCellRenderer: ((row: unknown, colIndex: number) => {
            // First column (index 0) is the image
            if (colIndex === 0) {
              const product = row as MbeOrderProductViewModel
              if (product.shopify_image_url) {
                return `<img src="${product.shopify_image_url}" alt="${product.sku ?? 'Product'}" class="product-image" />`
              }
              return '<div class="no-image"></div>'
            }
            return null
          }) as <T>(row: T, columnIndex: number) => string | null,
        },
      },
    })
  }

  if (!products || products.length === 0) {
    return <p className="text-muted-foreground text-sm">{t('noProducts')}</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('products')}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <DownloadIcon className="mr-2 size-4" />
            {t('export')}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToCSV}>CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={exportToHTML}>HTML</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('image')}</TableHead>
              <TableHead>{t('productId')}</TableHead>
              <TableHead>{t('sku')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              <TableHead className="text-right">{t('quantity')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={`${product.product_id}-${index}`}>
                <TableCell>
                  {product.shopify_image_url ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded border border-[var(--color-border)]">
                      <Image
                        src={product.shopify_image_url}
                        alt={product.sku ?? 'Product image'}
                        fill
                        sizes="48px"
                        quality={75}
                        placeholder="blur"
                        blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-muted)]/10">
                      <span className="text-muted-foreground text-xs">—</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">{product.product_id}</TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-1">
                    {product.sku || '—'}
                    {product.sku && product.shopify_product_id && (
                      <a
                        href={`/retail/products/${product.shopify_product_id.replace('gid://shopify/Product/', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <ExternalLinkIcon className="size-4 opacity-70" strokeWidth={2.5} />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.description || '—'}</TableCell>
                <TableCell className="text-right font-mono">{product.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

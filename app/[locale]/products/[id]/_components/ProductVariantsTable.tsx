'use client'

import { DownloadIcon, ExternalLinkIcon } from 'lucide-react'
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
import type { GetProductDetailsViewModel } from '@/features/products/use-cases/user-view/GetProductDetailsViewModel'
import { InventorySyncStatusUtil } from '@/features/products/utils/InventorySyncStatusUtil'
import { TableExportService } from '@/utils/export'

interface ProductVariantsTableProps {
  variants: GetProductDetailsViewModel['variants']
  productTitle: string
}

export function ProductVariantsTable({ variants, productTitle }: ProductVariantsTableProps) {
  const t = useTranslations('ProductDetailPage')

  function exportToCSV() {
    // Flatten variants into rows (one row per location)
    type FlatRow = {
      variant: GetProductDetailsViewModel['variants'][0]
      location: GetProductDetailsViewModel['variants'][0]['inventoryLevels'][0] | null
    }

    const flatRows: FlatRow[] = []
    variants.forEach((v) => {
      if (v.inventoryLevels.length === 0) {
        flatRows.push({ variant: v, location: null })
      } else {
        v.inventoryLevels.forEach((level) => {
          flatRows.push({ variant: v, location: level })
        })
      }
    })

    // Sanitize product title: replace non-alphanumeric with underscore, collapse multiple underscores
    const sanitizedTitle = productTitle.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')

    const columns = TableExportService.buildColumns<FlatRow>()
      .addColumn(t('columnVariant'), (row) => row.variant.title)
      .addColumn(t('columnSku'), (row) => row.variant.sku)
      .addColumn(t('columnBarcode'), (row) => row.variant.barcode ?? '—')
      .addColumn(t('columnLocation'), (row) => row.location?.locationName ?? '—')
      .addColumn(t('columnCommitted'), (row) => row.location?.committedQuantity ?? 0)
      .addColumn(t('columnAvailable'), (row) => row.location?.availableQuantity ?? 0)
      .addColumn(t('columnOnHand'), (row) => row.location?.onHandQuantity ?? 0)
      .addColumn(t('columnMbeStock'), (row) => row.variant.mbeStock ?? 0)
      .addColumn(t('columnMbeCustomerOrder'), (row) => row.variant.mbeCustomerOrder ?? 0)
      .addColumn(t('columnMbeDisponibility'), (row) => row.variant.mbeDisponibility ?? 0)
      .build()

    TableExportService.quickExport({
      title: `Product Details - ${productTitle}`,
      baseFilename: `product_detail_${sanitizedTitle}`,
      columns,
      data: flatRows,
      format: 'csv',
    })
  }

  function exportToHTML() {
    // Flatten variants into rows (one row per location)
    type FlatRow = {
      variant: GetProductDetailsViewModel['variants'][0]
      location: GetProductDetailsViewModel['variants'][0]['inventoryLevels'][0] | null
    }

    const flatRows: FlatRow[] = []
    variants.forEach((v) => {
      if (v.inventoryLevels.length === 0) {
        flatRows.push({ variant: v, location: null })
      } else {
        v.inventoryLevels.forEach((level) => {
          flatRows.push({ variant: v, location: level })
        })
      }
    })

    // Sanitize product title: replace non-alphanumeric with underscore, collapse multiple underscores
    const sanitizedTitle = productTitle.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')

    const columns = TableExportService.buildColumns<FlatRow>()
      .addColumn('', () => '', { width: '64px' }) // Image column (first)
      .addColumn(t('columnVariant'), (row) => row.variant.title)
      .addColumn(t('columnSku'), (row) => row.variant.sku)
      .addColumn(t('columnBarcode'), (row) => row.variant.barcode ?? '—')
      .addColumn(t('columnLocation'), (row) => row.location?.locationName ?? '—')
      .addColumn(t('columnCommitted'), (row) => row.location?.committedQuantity ?? 0, {
        className: 'text-right',
      })
      .addColumn(t('columnAvailable'), (row) => row.location?.availableQuantity ?? 0, {
        className: 'text-right',
      })
      .addColumn(t('columnOnHand'), (row) => row.location?.onHandQuantity ?? 0, {
        className: 'text-right',
      })
      .addColumn(t('columnMbeStock'), (row) => row.variant.mbeStock ?? 0, {
        className: 'text-right',
      })
      .addColumn(t('columnMbeCustomerOrder'), (row) => row.variant.mbeCustomerOrder ?? 0, {
        className: 'text-right',
      })
      .addColumn(t('columnMbeDisponibility'), (row) => row.variant.mbeDisponibility ?? 0, {
        className: 'text-right',
      })
      .build()

    TableExportService.export({
      title: `Product Details - ${productTitle}`,
      baseFilename: `product_detail_${sanitizedTitle}`,
      columns,
      data: flatRows,
      format: 'html',
      metadata: {
        Product: productTitle,
        'Total Variants': variants.length,
      },
      factoryConfig: {
        html: {
          customCellRenderer: ((row: unknown, colIndex: number) => {
            // First column (index 0) is the image
            if (colIndex === 0) {
              const flatRow = row as FlatRow
              if (flatRow.variant.imageUrl) {
                return `<img src="${flatRow.variant.imageUrl}" alt="${flatRow.variant.title}" class="product-image" />`
              }
              return '<div class="no-image"></div>'
            }
            return null
          }) as <T>(row: T, columnIndex: number) => string | null,
        },
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-foreground text-base font-semibold">{t('variantsTitle')}</h2>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('columnVariant')}</TableHead>
            <TableHead>{t('columnSku')}</TableHead>
            <TableHead>{t('columnBarcode')}</TableHead>
            <TableHead>{t('columnLocation')}</TableHead>
            <TableHead className="text-right">{t('columnCommitted')}</TableHead>
            <TableHead className="text-right">{t('columnAvailable')}</TableHead>
            <TableHead className="bg-[var(--color-brand-5)] text-right text-[var(--color-foreground)]">
              {t('columnOnHand')}
            </TableHead>
            <TableHead className="text-right">{t('columnMbeStock')}</TableHead>
            <TableHead className="text-right">{t('columnMbeCustomerOrder')}</TableHead>
            <TableHead className="bg-[var(--color-brand-5)] text-right text-[var(--color-foreground)]">
              {t('columnMbeDisponibility')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => {
            // Calculate row background color based on sync status
            const rowBgClass = InventorySyncStatusUtil.getRowBackgroundClassName(
              variant.totalOnHand,
              variant.mbeDisponibility
            )

            return variant.inventoryLevels.length === 0 ? (
              <TableRow key={variant.id} className={rowBgClass}>
                <TableCell className="font-medium">{variant.title}</TableCell>
                <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                <TableCell className="font-mono text-sm">{variant.barcode ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">—</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {variant.totalCommitted}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {variant.totalAvailable}
                </TableCell>
                <TableCell className="bg-[var(--color-brand-5)] text-right font-mono text-sm font-bold text-[var(--color-foreground)]">
                  {variant.totalOnHand}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {variant.mbeStock ?? '—'}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  <div className="flex items-center justify-end gap-1">
                    {variant.mbeCustomerOrder ?? '—'}
                    {variant.mbeCustomerOrder !== null &&
                      variant.mbeCustomerOrder > 0 &&
                      variant.sku && (
                        <a
                          href={`/b2b/mbe-order-history?sku=${encodeURIComponent(variant.sku)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <ExternalLinkIcon className="size-4 opacity-70" strokeWidth={2.5} />
                        </a>
                      )}
                  </div>
                </TableCell>
                <TableCell className="bg-[var(--color-brand-5)] text-right font-mono text-sm font-bold text-[var(--color-foreground)]">
                  {variant.mbeDisponibility ?? '—'}
                </TableCell>
              </TableRow>
            ) : (
              variant.inventoryLevels.map((level, i) => (
                <TableRow key={`${variant.id}-${level.locationName}`} className={rowBgClass}>
                  {i === 0 && (
                    <>
                      <TableCell className="font-medium" rowSpan={variant.inventoryLevels.length}>
                        {variant.title}
                      </TableCell>
                      <TableCell
                        className="font-mono text-sm"
                        rowSpan={variant.inventoryLevels.length}
                      >
                        {variant.sku}
                      </TableCell>
                      <TableCell
                        className="font-mono text-sm"
                        rowSpan={variant.inventoryLevels.length}
                      >
                        {variant.barcode ?? '—'}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-muted-foreground text-sm">
                    {level.locationName}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {level.committedQuantity}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {level.availableQuantity}
                  </TableCell>
                  <TableCell className="bg-[var(--color-brand-5)] text-right font-mono text-sm font-bold text-[var(--color-foreground)]">
                    {level.onHandQuantity}
                  </TableCell>
                  {i === 0 && (
                    <>
                      <TableCell
                        className="text-right font-mono text-sm"
                        rowSpan={variant.inventoryLevels.length}
                      >
                        {variant.mbeStock ?? '—'}
                      </TableCell>
                      <TableCell
                        className="text-right font-mono text-sm"
                        rowSpan={variant.inventoryLevels.length}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {variant.mbeCustomerOrder ?? '—'}
                          {variant.mbeCustomerOrder !== null &&
                            variant.mbeCustomerOrder > 0 &&
                            variant.sku && (
                              <a
                                href={`/b2b/mbe-order-history?sku=${encodeURIComponent(variant.sku)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex"
                              >
                                <ExternalLinkIcon className="size-4 opacity-70" strokeWidth={2.5} />
                              </a>
                            )}
                        </div>
                      </TableCell>
                      <TableCell
                        className="bg-[var(--color-brand-5)] text-right font-mono text-sm font-bold text-[var(--color-foreground)]"
                        rowSpan={variant.inventoryLevels.length}
                      >
                        {variant.mbeDisponibility ?? '—'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

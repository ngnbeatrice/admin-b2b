'use client'

import { DownloadIcon, ExternalLinkIcon, EyeIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import type { GetAllProductsViewModel } from '@/features/products'
import { InventorySyncStatusUtil } from '@/features/products/utils/InventorySyncStatusUtil'
import { Link } from '@/lib/navigation'
import { TableExportService } from '@/utils/export'

interface ProductsTableProps {
  readonly products: GetAllProductsViewModel[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const t = useTranslations('ProductsPage')

  const allSkus = useMemo(
    () =>
      [
        ...new Set(products.flatMap((p) => p.variants.map((v) => v.shopifySku)).filter(Boolean)),
      ].sort(),
    [products]
  )

  const allCollectionTitles = useMemo(
    () =>
      [...new Set(products.flatMap((p) => p.collections.map((c) => c.title)))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [products]
  )

  const allTags = useMemo(
    () => [...new Set(products.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b)),
    [products]
  )

  const allVariantTitles = useMemo(
    () =>
      [...new Set(products.flatMap((p) => p.variants.map((v) => v.shopifyTitle)))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [products]
  )

  const [titleInput, setTitleInput] = useState('')
  const [skuInput, setSkuInput] = useState('')
  const [collectionInput, setCollectionInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [variantInput, setVariantInput] = useState('')
  const [showOutOfStock, setShowOutOfStock] = useState(true)
  const [showNotSynchronized, setShowNotSynchronized] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const titleMatch =
          titleInput.trim() === '' ||
          p.title.toLowerCase().includes(titleInput.trim().toLowerCase())
        const skuMatch =
          skuInput.trim() === '' ||
          p.variants.some((v) =>
            v.shopifySku?.toLowerCase().includes(skuInput.trim().toLowerCase())
          )
        const collectionMatch =
          collectionInput.trim() === '' ||
          p.collections.some((c) =>
            c.title.toLowerCase().includes(collectionInput.trim().toLowerCase())
          )
        const tagMatch =
          tagInput.trim() === '' ||
          p.tags.some((tag) => tag.toLowerCase().includes(tagInput.trim().toLowerCase()))
        const variantMatch =
          variantInput.trim() === '' ||
          p.variants.some(
            (v) =>
              v.shopifyTitle.toLowerCase().includes(variantInput.trim().toLowerCase()) &&
              v.shopifyInventoryQuantity > 0
          )

        // Calculate MBE total for stock filtering
        const mbeValues = p.variants
          .map((v) => v.mbeDisponibility)
          .filter((val) => val !== null && val !== undefined) as number[]
        const mbeTotal = mbeValues.length > 0 ? mbeValues.reduce((sum, val) => sum + val, 0) : null
        const isInStock = mbeTotal !== null && mbeTotal > 0

        const stockMatch = showOutOfStock || isInStock

        // Synchronization check: check if any variant is not synchronized
        const hasUnsynchronizedVariant = p.variants.some((v) => {
          const shopifyQty = v.shopifyInventoryQuantity
          const mbeQty = v.mbeDisponibility

          // Skip if both are 0/null (considered synchronized)
          if ((shopifyQty === 0 || shopifyQty === null) && (mbeQty === 0 || mbeQty === null)) {
            return false
          }

          // Check if values differ
          return shopifyQty !== mbeQty
        })

        const syncMatch = !showNotSynchronized || hasUnsynchronizedVariant

        // Archived filter: hide archived products by default
        const archivedMatch = showArchived || p.status !== 'ARCHIVED'

        return (
          titleMatch &&
          skuMatch &&
          collectionMatch &&
          tagMatch &&
          variantMatch &&
          stockMatch &&
          syncMatch &&
          archivedMatch
        )
      }),
    [
      products,
      titleInput,
      skuInput,
      collectionInput,
      tagInput,
      variantInput,
      showOutOfStock,
      showNotSynchronized,
      showArchived,
    ]
  )

  function exportToCSV() {
    // Flatten products into rows (one row per variant)
    type FlatRow = {
      product: GetAllProductsViewModel
      variant: GetAllProductsViewModel['variants'][0]
    }

    const flatRows: FlatRow[] = []
    filtered.forEach((p) => {
      p.variants.forEach((v) => {
        flatRows.push({ product: p, variant: v })
      })
    })

    const columns = TableExportService.buildColumns<FlatRow>()
      .addColumn(t('columnProduct'), (row) => row.product.title)
      .addColumn(t('columnStatus'), (row) => row.product.status)
      .addColumn(t('columnCollections'), (row) => row.product.collections.map((c) => c.title).join(', '))
      .addColumn(t('columnVariants'), (row) => row.variant.shopifyTitle)
      .addArrayColumn(t('columnTags'), (row) => row.product.tags)
      .addColumn(t('columnShopifyQuantity'), (row) => row.variant.shopifyInventoryQuantity)
      .addColumn(t('columnMbeQuantity'), (row) => row.variant.mbeDisponibility ?? 0)
      .build()

    TableExportService.quickExport({
      title: 'Products Export',
      baseFilename: 'products_inventory',
      columns,
      data: flatRows,
      format: 'csv',
    })
  }

  function exportToHTML() {
    // Flatten products into rows (one row per variant)
    type FlatRow = {
      product: GetAllProductsViewModel
      variant: GetAllProductsViewModel['variants'][0]
    }

    const flatRows: FlatRow[] = []
    filtered.forEach((p) => {
      p.variants.forEach((v) => {
        flatRows.push({ product: p, variant: v })
      })
    })

    const totalVariants = filtered.reduce((sum, p) => sum + p.variants.length, 0)

    const columns = TableExportService.buildColumns<FlatRow>()
      .addColumn('', () => '', { width: '64px' }) // Image column
      .addColumn(t('columnProduct'), (row) => row.product.title)
      .addColumn(t('columnStatus'), (row) => row.product.status)
      .addColumn(t('columnCollections'), (row) => row.product.collections.map((c) => c.title).join(', '))
      .addColumn(t('columnVariants'), (row) => row.variant.shopifyTitle)
      .addArrayColumn(t('columnTags'), (row) => row.product.tags)
      .addColumn(t('columnShopifyQuantity'), (row) => row.variant.shopifyInventoryQuantity, { className: 'text-right' })
      .addColumn(t('columnMbeQuantity'), (row) => row.variant.mbeDisponibility ?? 0, { className: 'text-right' })
      .build()

    TableExportService.export({
      title: 'Products Export',
      baseFilename: 'products_inventory',
      columns,
      data: flatRows,
      format: 'html',
      metadata: {
        'Export Date': new Date().toLocaleString(),
        'Total Products': filtered.length,
        'Total Variants': totalVariants,
      },
      factoryConfig: {
        html: {
          customCellRenderer: <T,>(row: T, columnIndex: number) => {
            if (columnIndex !== 0) return null
            const flatRow = row as FlatRow
            if (flatRow.product.featuredImageUrl) {
              return `<img src="${flatRow.product.featuredImageUrl}" alt="${flatRow.product.featuredImageAlt ?? flatRow.product.title}" class="product-image" />`
            }
            return '<span class="no-image"></span>'
          },
        },
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t('filterTitlePlaceholder')}
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          className="w-56 text-sm"
        />

        <div>
          <Input
            list="sku-options"
            placeholder={t('filterSkuPlaceholder')}
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            className="w-56 text-sm"
          />
          <datalist id="sku-options">
            {allSkus.map((sku) => (
              <option key={sku} value={sku} />
            ))}
          </datalist>
        </div>

        <div>
          <Input
            list="collection-options"
            placeholder={t('filterCollectionTextPlaceholder')}
            value={collectionInput}
            onChange={(e) => setCollectionInput(e.target.value)}
            className="w-56 text-sm"
          />
          <datalist id="collection-options">
            {allCollectionTitles.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </div>

        <div>
          <Input
            list="tag-options"
            placeholder={t('filterTagPlaceholder')}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="w-56 text-sm"
          />
          <datalist id="tag-options">
            {allTags.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>

        <div>
          <Input
            list="variant-options"
            placeholder={t('filterVariantPlaceholder')}
            value={variantInput}
            onChange={(e) => setVariantInput(e.target.value)}
            className="w-56 text-sm"
          />
          <datalist id="variant-options">
            {allVariantTitles.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="show-out-of-stock"
              checked={showOutOfStock}
              onCheckedChange={setShowOutOfStock}
            />
            <Label htmlFor="show-out-of-stock" className="cursor-pointer text-sm">
              {t('showOutOfStock')}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            <Label htmlFor="show-archived" className="cursor-pointer text-sm">
              {t('showArchived')}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="show-not-synchronized"
              checked={showNotSynchronized}
              onCheckedChange={setShowNotSynchronized}
            />
            <Label htmlFor="show-not-synchronized" className="cursor-pointer text-sm">
              {t('showNotSynchronized')}
            </Label>
          </div>

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
      </div>

      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-muted-foreground h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-foreground mb-2 text-lg font-semibold">{t('noResultsTitle')}</h3>
            <p className="text-muted-foreground max-w-md">{t('noResultsDescription')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16" />
                <TableHead className="w-64">{t('columnProduct')}</TableHead>
                <TableHead className="w-[80px]">{t('columnProductDetails')}</TableHead>
                <TableHead className="w-[120px]">{t('columnStatus')}</TableHead>
                <TableHead>{t('columnVariantsShopifyMbe')}</TableHead>
                <TableHead className="text-right">{t('columnTotalShopifyMbe')}</TableHead>
                <TableHead>{t('columnStockStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.featuredImageUrl ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border border-[var(--color-border)]">
                        <Image
                          src={product.featuredImageUrl}
                          alt={product.featuredImageAlt ?? product.title}
                          fill
                          sizes="48px"
                          quality={75}
                          placeholder="blur"
                          blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md border border-[var(--color-border)] bg-white" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="w-64 break-words whitespace-normal">{product.title}</div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={(props) => (
                            <Link
                              {...props}
                              href={Routes.retailProduct(product.numericId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          )}
                        />
                        <TooltipContent>
                          <p>{t('viewDetails')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.status === 'ACTIVE'
                          ? 'border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)]'
                          : product.status === 'DRAFT'
                            ? 'border-[var(--color-info)] bg-[var(--color-info)]/10 text-[var(--color-info)]'
                            : product.status === 'ARCHIVED'
                              ? 'border-[var(--color-muted)] bg-[var(--color-muted)]/10 text-[var(--color-muted)]'
                              : 'border-[var(--color-warning)] bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((v) => {
                        const shopifyQty =
                          v.shopifyInventoryQuantity !== null &&
                          v.shopifyInventoryQuantity !== undefined
                            ? v.shopifyInventoryQuantity
                            : null
                        const mbeQty = v.mbeDisponibility

                        // Get badge color class from utility
                        const badgeClassName = `font-mono text-xs ${InventorySyncStatusUtil.getStatusClassName(shopifyQty, mbeQty)}`

                        const hasCustomerOrder =
                          v.mbeCustomerOrder !== null && v.mbeCustomerOrder > 0

                        const badgeContent = (
                          <>
                            {v.shopifyTitle}
                            <span className="ml-1 opacity-60">
                              ({shopifyQty !== null ? shopifyQty : 'null'} /{' '}
                              {mbeQty !== null ? mbeQty : 'null'})
                            </span>
                            {hasCustomerOrder && (
                              <ExternalLinkIcon
                                className="ml-1 size-3 opacity-70"
                                strokeWidth={2.5}
                              />
                            )}
                          </>
                        )

                        if (hasCustomerOrder && v.shopifySku) {
                          return (
                            <a
                              key={v.id}
                              href={`/b2b/mbe-order-history?sku=${encodeURIComponent(v.shopifySku)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <Badge variant="outline" className={badgeClassName}>
                                {badgeContent}
                              </Badge>
                            </a>
                          )
                        }

                        return (
                          <Badge key={v.id} variant="outline" className={badgeClassName}>
                            {badgeContent}
                          </Badge>
                        )
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(() => {
                      // Calculate MBE total - only sum non-null values
                      const mbeValues = product.variants
                        .map((v) => v.mbeDisponibility)
                        .filter((val) => val !== null && val !== undefined) as number[]
                      const mbeTotal =
                        mbeValues.length > 0 ? mbeValues.reduce((sum, val) => sum + val, 0) : null

                      const shopifyTotal =
                        product.totalInventory !== null && product.totalInventory !== undefined
                          ? product.totalInventory
                          : null
                      const shopifyDisplay = shopifyTotal !== null ? shopifyTotal : 'null'
                      const mbeDisplay = mbeTotal !== null ? mbeTotal : 'null'
                      return `${shopifyDisplay} / ${mbeDisplay}`
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Calculate MBE total - only sum non-null values
                      const mbeValues = product.variants
                        .map((v) => v.mbeDisponibility)
                        .filter((val) => val !== null && val !== undefined) as number[]
                      const mbeTotal =
                        mbeValues.length > 0 ? mbeValues.reduce((sum, val) => sum + val, 0) : null
                      const isInStock = mbeTotal !== null && mbeTotal > 0
                      return (
                        <Badge
                          className={
                            isInStock
                              ? 'bg-[var(--color-success)] text-white'
                              : 'bg-[var(--color-error)] text-white'
                          }
                        >
                          {isInStock ? t('inStock') : t('outOfStock')}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

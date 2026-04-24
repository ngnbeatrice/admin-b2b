'use client'

import { DownloadIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { Link } from '@/lib/navigation'

interface ProductsTableProps {
  readonly products: GetAllProductsViewModel[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const t = useTranslations('ProductsPage')

  const allSkus = useMemo(
    () =>
      [...new Set(products.flatMap((p) => p.variants.map((v) => v.sku)).filter(Boolean))].sort(),
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
      [...new Set(products.flatMap((p) => p.variants.map((v) => v.title)))].sort((a, b) =>
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

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const titleMatch =
          titleInput.trim() === '' ||
          p.title.toLowerCase().includes(titleInput.trim().toLowerCase())
        const skuMatch =
          skuInput.trim() === '' ||
          p.variants.some((v) => v.sku?.toLowerCase().includes(skuInput.trim().toLowerCase()))
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
              v.title.toLowerCase().includes(variantInput.trim().toLowerCase()) &&
              v.inventoryQuantity > 0
          )
        const stockMatch = showOutOfStock || p.inStock
        return titleMatch && skuMatch && collectionMatch && tagMatch && variantMatch && stockMatch
      }),
    [products, titleInput, skuInput, collectionInput, tagInput, variantInput, showOutOfStock]
  )

  function exportToCSV() {
    const headers = [
      t('columnProduct'),
      t('columnCollections'),
      t('columnVariants'),
      t('columnTags'),
      t('columnInventory'),
    ]

    const rows: string[][] = []
    filtered.forEach((p) => {
      p.variants.forEach((v) => {
        rows.push([
          p.title,
          p.collections.map((c) => c.title).join(', '),
          v.title,
          p.tags.join(', '),
          v.inventoryQuantity.toString(),
        ])
      })
    })

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `products-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  function exportToHTML() {
    const totalVariants = filtered.reduce((sum, p) => sum + p.variants.length, 0)

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Products Export - ${new Date().toLocaleDateString()}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 40px;
      background-color: #f0fdf4;
      color: #1c1c1e;
    }
    h1 {
      color: #047857;
      margin-bottom: 10px;
    }
    .meta {
      color: #6b7280;
      margin-bottom: 30px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background-color: #047857;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #d1fae5;
      font-size: 14px;
      vertical-align: middle;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover {
      background-color: #f0fdf4;
    }
    .text-right {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
    }
    .product-image {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #d1fae5;
    }
    .no-image {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      border: 1px solid #d1fae5;
      background-color: #f9fafb;
      display: inline-block;
    }
  </style>
</head>
<body>
  <h1>Products Export</h1>
  <div class="meta">
    <strong>Export Date:</strong> ${new Date().toLocaleString()}<br>
    <strong>Total Products:</strong> ${filtered.length}<br>
    <strong>Total Variants:</strong> ${totalVariants}
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 64px;"></th>
        <th>${t('columnProduct')}</th>
        <th>${t('columnCollections')}</th>
        <th>${t('columnVariants')}</th>
        <th>${t('columnTags')}</th>
        <th style="text-align: right;">${t('columnInventory')}</th>
      </tr>
    </thead>
    <tbody>
      ${filtered
        .flatMap((p) =>
          p.variants.map(
            (v) => `
        <tr>
          <td>
            ${
              p.featuredImageUrl
                ? `<img src="${p.featuredImageUrl}" alt="${p.featuredImageAlt ?? p.title}" class="product-image" />`
                : '<span class="no-image"></span>'
            }
          </td>
          <td><strong>${p.title}</strong></td>
          <td>${p.collections.map((c) => c.title).join(', ')}</td>
          <td>${v.title}</td>
          <td>${p.tags.join(', ')}</td>
          <td class="text-right">${v.inventoryQuantity}</td>
        </tr>
      `
          )
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `products-${new Date().toISOString().split('T')[0]}.html`
    link.click()
    URL.revokeObjectURL(link.href)
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
                <TableHead>{t('columnProduct')}</TableHead>
                <TableHead>{t('columnCollections')}</TableHead>
                <TableHead>{t('columnVariants')}</TableHead>
                <TableHead className="w-32">{t('columnTags')}</TableHead>
                <TableHead className="text-right">{t('columnInventory')}</TableHead>
                <TableHead>{t('columnStatus')}</TableHead>
                <TableHead className="w-20">{t('columnActions')}</TableHead>
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
                    {product.title.length > 40 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <span className="cursor-default">
                                {product.title.slice(0, 40) + '…'}
                              </span>
                            }
                          />
                          <TooltipContent>{product.title}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      product.title
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-48 text-sm">
                    <TooltipProvider>
                      <div className="flex flex-wrap gap-1">
                        {product.collections.map((c) => {
                          const isTruncated = c.title.length > 25
                          const display = isTruncated ? c.title.slice(0, 25) + '…' : c.title
                          return isTruncated ? (
                            <Tooltip key={c.id}>
                              <TooltipTrigger
                                render={
                                  <Badge variant="outline" className="cursor-default text-xs">
                                    {display}
                                  </Badge>
                                }
                              />
                              <TooltipContent>{c.title}</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Badge key={c.id} variant="outline" className="text-xs">
                              {display}
                            </Badge>
                          )
                        })}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((v) => (
                        <Badge key={v.id} variant="outline" className="font-mono text-xs">
                          {v.title}
                          <span className="ml-1 opacity-60">({v.inventoryQuantity})</span>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {product.tags.length > 0 ? (
                      <TooltipProvider>
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag) => {
                            const isTruncated = tag.length > 12
                            const display = isTruncated ? tag.slice(0, 12) + '…' : tag
                            return isTruncated ? (
                              <Tooltip key={tag}>
                                <TooltipTrigger
                                  render={
                                    <Badge variant="secondary" className="cursor-default text-xs">
                                      {display}
                                    </Badge>
                                  }
                                />
                                <TooltipContent>{tag}</TooltipContent>
                              </Tooltip>
                            ) : (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {display}
                              </Badge>
                            )
                          })}
                        </div>
                      </TooltipProvider>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {product.totalInventory}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        product.inStock
                          ? 'bg-[var(--color-success)] text-white'
                          : 'bg-[var(--color-error)] text-white'
                      }
                    >
                      {product.inStock ? t('inStock') : t('outOfStock')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={Routes.retailProduct(product.numericId)}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      {t('viewDetails')}
                    </Link>
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

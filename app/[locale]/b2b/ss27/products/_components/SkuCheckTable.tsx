'use client'

import { PackageIcon, PaletteIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ImageWithFallback } from '@/components/ImageWithFallback/ImageWithFallback'
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
import type { GetAllNewProductsViewModel } from '@/features/new-products'
import type { SkuCheckResult } from '@/features/products/use-cases/CheckSkuListUseCase'

interface SkuCheckTableProps {
  readonly products: GetAllNewProductsViewModel[]
}

export function SkuCheckTable({ products }: SkuCheckTableProps) {
  const t = useTranslations('NewProductsPage')
  const [isChecking, setIsChecking] = useState(false)
  const [skuResults, setSkuResults] = useState<Map<string, boolean> | null>(null)

  async function handleCheckSkus() {
    setIsChecking(true)
    try {
      const allSkus = products.flatMap((p) =>
        p.skus.map((v) => v.sku).filter((s): s is string => s !== null)
      )
      const res = await fetch('/api/check-skus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skus: allSkus }),
      })
      const json = await res.json()
      const results: SkuCheckResult[] = json.data
      setSkuResults(new Map(results.map((r) => [r.sku, r.exists])))
    } finally {
      setIsChecking(false)
    }
  }

  function skuBadgeClass(sku: string): string {
    if (!skuResults) return ''
    return skuResults.get(sku)
      ? 'border-green-500 text-green-700 bg-green-50'
      : 'border-red-500 text-red-700 bg-red-50'
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16" />
            <TableHead>{t('columnTitle')}</TableHead>
            <TableHead>
              <div className="flex items-center gap-3">
                <span>{t('columnVariantSku')}</span>
                <Button variant="outline" size="sm" onClick={handleCheckSkus} disabled={isChecking}>
                  {isChecking ? t('checkingSkus') : t('checkSkus')}
                </Button>
              </div>
            </TableHead>
            <TableHead>{t('columnCollections')}</TableHead>
            <TableHead>{t('columnPrice')}</TableHead>
            <TableHead>{t('columnCreatedAt')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              {/* Image */}
              <TableCell>
                {product.imageUrl ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border border-[var(--color-border)]">
                    <ImageWithFallback
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="48px"
                      quality={75}
                      className="object-cover"
                      fallback={
                        <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-md border border-[var(--color-border)]">
                          <PackageIcon className="size-5" />
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-md border border-[var(--color-border)]">
                    <PackageIcon className="size-5" />
                  </div>
                )}
              </TableCell>

              {/* Title */}
              <TableCell>
                <p className="font-medium">{product.title}</p>
                {product.description && (
                  <p className="text-muted-foreground text-xs">{product.description}</p>
                )}
              </TableCell>

              {/* Variant / SKU — inner table for alignment */}
              <TableCell>
                <table className="w-full text-xs">
                  <colgroup>
                    <col className="w-32" />
                    <col />
                  </colgroup>
                  <tbody>
                    {product.skus.map((v) => (
                      <tr key={v.sku ?? v.title}>
                        <td className="text-muted-foreground py-0.5 pr-4 align-middle whitespace-nowrap">
                          {v.title}
                        </td>
                        <td className="py-0.5 align-middle">
                          {v.sku ? (
                            <Badge
                              variant="outline"
                              className={`font-mono text-xs ${skuBadgeClass(v.sku)}`}
                            >
                              {v.sku}
                            </Badge>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableCell>

              {/* Collections + colors */}
              <TableCell>
                <div className="flex flex-col gap-2">
                  {product.collections.map((col) => (
                    <div key={col.id} className="flex flex-col gap-1">
                      <span className="text-foreground text-xs font-medium">{col.name}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {col.colors.map((color) => (
                          <div key={color.id} className="flex items-center gap-1">
                            {color.imageUrl ? (
                              <div className="relative size-4 overflow-hidden rounded-full border border-[var(--color-border)]">
                                <ImageWithFallback
                                  src={color.imageUrl}
                                  alt={color.name}
                                  fill
                                  sizes="16px"
                                  className="object-cover"
                                  fallback={
                                    <div className="bg-muted text-muted-foreground flex size-4 items-center justify-center rounded-full">
                                      <PaletteIcon className="size-2.5" />
                                    </div>
                                  }
                                />
                              </div>
                            ) : (
                              <div className="bg-muted text-muted-foreground flex size-4 items-center justify-center rounded-full border border-[var(--color-border)]">
                                <PaletteIcon className="size-2.5" />
                              </div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {color.name}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TableCell>

              {/* Price */}
              <TableCell className="font-mono text-sm">{product.price} €</TableCell>

              {/* Created at */}
              <TableCell className="text-muted-foreground text-sm">{product.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

'use client'

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
import type { MbeProductVariant } from '@/features/products/service/types/MbeProductVariant'

interface OrphanedMbeVariantsTableProps {
  readonly variants: MbeProductVariant[]
}

export function OrphanedMbeVariantsTable({ variants }: OrphanedMbeVariantsTableProps) {
  const t = useTranslations('ProductsPage')

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('columnSku')}</TableHead>
            <TableHead>{t('columnEan')}</TableHead>
            <TableHead>{t('columnDescription')}</TableHead>
            <TableHead className="text-right">{t('columnMbeStock')}</TableHead>
            <TableHead className="text-right">{t('columnMbeCustomerOrder')}</TableHead>
            <TableHead className="text-right">{t('columnMbeDisponibility')}</TableHead>
            <TableHead>{t('columnStockStatus')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => {
            const isInStock = variant.disponibility > 0
            return (
              <TableRow key={variant.id}>
                <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                <TableCell className="font-mono text-sm">{variant.ean || '—'}</TableCell>
                <TableCell className="max-w-md truncate">{variant.description}</TableCell>
                <TableCell className="text-right font-mono text-sm">{variant.stock}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {variant.customer_order}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {variant.disponibility}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      isInStock
                        ? 'bg-[var(--color-success)] text-white'
                        : 'bg-[var(--color-error)] text-white'
                    }
                  >
                    {isInStock ? t('inStock') : t('outOfStock')}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

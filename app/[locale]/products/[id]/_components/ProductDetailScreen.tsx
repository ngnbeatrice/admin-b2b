import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PRODUCT_IMAGE_BLUR_DATA_URL } from '@/constants/images'
import { Routes } from '@/constants/routes'
import { GetProductDetailsUseCase, ShopifyClient } from '@/features/products'
import { Link } from '@/lib/navigation'

interface ProductDetailScreenProps {
  readonly id: string
}

/**
 * Server component — fetches full product details (image, description, tags, options,
 * collections, variants with inventory levels per location) and renders a two-column hero layout.
 */
export async function ProductDetailScreen({ id }: ProductDetailScreenProps) {
  const t = await getTranslations('ProductDetailPage')

  const useCase = new GetProductDetailsUseCase(new ShopifyClient())
  const product = await useCase.execute(id)

  if (!product) notFound()

  return (
    <section id="screen-product-detail" className="flex flex-1 flex-col gap-6 p-6">
      {/* Back link */}
      <Link
        href={Routes.retailProducts}
        className="text-muted-foreground hover:text-foreground w-fit text-sm transition-colors"
      >
        ← {t('backToProducts')}
      </Link>

      {/* Hero: image + title / description / tags / options / collections */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Image */}
        {product.featuredImageUrl && (
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] md:w-72">
            <Image
              src={product.featuredImageUrl}
              alt={product.featuredImageAlt ?? product.title}
              fill
              sizes="(max-width: 768px) 100vw, 288px"
              quality={75}
              placeholder="blur"
              blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-foreground text-2xl font-semibold">{product.title}</h1>
            <Badge
              className={
                product.inStock
                  ? 'bg-[var(--color-success)] text-white'
                  : 'bg-[var(--color-error)] text-white'
              }
            >
              {product.inStock ? t('inStock') : t('outOfStock')}
            </Badge>
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <Card>
              <CardContent className="p-4">
                <h2 className="text-foreground mb-2 text-sm font-semibold">
                  {t('descriptionTitle')}
                </h2>
                {/* descriptionHtml is sanitized server-side by Shopify — safe to render */}
                <div
                  className="text-muted-foreground prose prose-sm max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div>
              <h2 className="text-foreground mb-2 text-sm font-semibold">{t('tagsTitle')}</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Options (Size, Color, etc.) */}
          {product.options.length > 0 && (
            <div>
              <h2 className="text-foreground mb-2 text-sm font-semibold">{t('optionsTitle')}</h2>
              <div className="flex flex-col gap-3">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                      {option.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {option.values.map((value) => (
                        <Badge key={value} variant="outline" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collections */}
          {product.collections.length > 0 && (
            <div>
              <h2 className="text-foreground mb-2 text-sm font-semibold">
                {t('collectionsTitle')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.collections.map((c) => (
                  <Badge key={c.id} variant="outline" className="text-xs">
                    {c.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variants & inventory table */}
      <Card>
        <CardContent className="p-0">
          <h2 className="text-foreground p-4 pb-0 text-base font-semibold">{t('variantsTitle')}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columnVariant')}</TableHead>
                <TableHead>{t('columnSku')}</TableHead>
                <TableHead>{t('columnBarcode')}</TableHead>
                <TableHead>{t('columnLocation')}</TableHead>
                <TableHead className="text-right">{t('columnAvailable')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.map((variant) =>
                variant.inventoryLevels.length === 0 ? (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.title}</TableCell>
                    <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                    <TableCell className="font-mono text-sm">{variant.barcode ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">—</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {variant.totalAvailable}
                    </TableCell>
                  </TableRow>
                ) : (
                  variant.inventoryLevels.map((level, i) => (
                    <TableRow key={`${variant.id}-${level.locationName}`}>
                      {i === 0 && (
                        <>
                          <TableCell
                            className="font-medium"
                            rowSpan={variant.inventoryLevels.length}
                          >
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
                        {level.availableQuantity}
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}

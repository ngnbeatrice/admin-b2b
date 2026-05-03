import { ExternalLinkIcon } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PRODUCT_IMAGE_BLUR_DATA_URL } from '@/constants/images'
import { Routes } from '@/constants/routes'
import { GetProductDetailsUseCase, ShopifyClient } from '@/features/products'
import { MbeClient } from '@/features/products/client/MbeClient'
import { GetAllMbeProductVariantService } from '@/features/products/service/GetAllMbeProductVariantService'
import { Link } from '@/lib/navigation'

import { ProductVariantsTable } from './ProductVariantsTable'

interface ProductDetailScreenProps {
  readonly id: string
}

/**
 * Server component — fetches full product details (image, description, tags, options,
 * collections, variants with inventory levels per location) and renders a two-column hero layout.
 */
export async function ProductDetailScreen({ id }: ProductDetailScreenProps) {
  const t = await getTranslations('ProductDetailPage')

  const mbeService = new GetAllMbeProductVariantService(new MbeClient())
  const useCase = new GetProductDetailsUseCase(new ShopifyClient(), mbeService)
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
                {product.options.map((option) => {
                  // Check if this is a Color option and we have variant images
                  const isColorOption = option.name.toLowerCase() === 'color'
                  const colorImages = isColorOption
                    ? new Map<string, string>(
                        product.variants
                          .filter((v) => v.imageUrl)
                          .map((v) => {
                            const colorValue = v.selectedOptions.find(
                              (opt) => opt.name.toLowerCase() === 'color'
                            )?.value
                            return colorValue ? [colorValue, v.imageUrl!] : null
                          })
                          .filter((entry): entry is [string, string] => entry !== null)
                      )
                    : null

                  return (
                    <div key={option.name}>
                      <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                        {option.name}
                      </p>
                      {isColorOption && colorImages && colorImages.size > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {option.values.map((value) => {
                            const imageUrl = colorImages.get(value)
                            return (
                              <div key={value} className="flex flex-col items-center gap-1.5">
                                {imageUrl && (
                                  <div className="relative size-16 overflow-hidden rounded-lg border border-[var(--color-border)]">
                                    <Image
                                      src={imageUrl}
                                      alt={value}
                                      fill
                                      sizes="64px"
                                      quality={75}
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {value}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {option.values.map((value) => (
                            <Badge key={value} variant="outline" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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
          <ProductVariantsTable variants={product.variants} productTitle={product.title} />
        </CardContent>
      </Card>
    </section>
  )
}

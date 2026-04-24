'use client'

import { EyeIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { GetAllProductsForCreateOrderViewModel } from '@/features/products'

interface CreateOrderTableProps {
  readonly products: GetAllProductsForCreateOrderViewModel[]
}

export function CreateOrderTable({ products }: CreateOrderTableProps) {
  const t = useTranslations('CreateOrderPage')

  // Track quantities for each variant: { [variantId]: quantity }
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [emailLanguage, setEmailLanguage] = useState<'en' | 'fr'>('fr')

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
  const [showOnlySelected, setShowOnlySelected] = useState(false)

  /** Check if a product has any variant with quantity > 0 */
  const hasQuantity = useCallback(
    (product: GetAllProductsForCreateOrderViewModel): boolean => {
      return product.variants.some((v) => (quantities[v.id] ?? 0) > 0)
    },
    [quantities]
  )

  /** Count how many variants have quantity > 0 */
  const getSelectedVariantsCount = useCallback(
    (product: GetAllProductsForCreateOrderViewModel): number => {
      return product.variants.filter((v) => (quantities[v.id] ?? 0) > 0).length
    },
    [quantities]
  )

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // If "show only selected" is enabled, only show products with quantities
      if (showOnlySelected && !hasQuantity(p)) return false

      // If product has quantities, don't filter it out
      if (hasQuantity(p)) return true

      const titleMatch =
        titleInput.trim() === '' || p.title.toLowerCase().includes(titleInput.trim().toLowerCase())
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
        p.variants.some((v) => v.title.toLowerCase().includes(variantInput.trim().toLowerCase()))

      // Stock filtering: always respect the toggle
      const stockMatch = showOutOfStock || p.inStock

      return titleMatch && skuMatch && collectionMatch && tagMatch && variantMatch && stockMatch
    })
  }, [
    products,
    titleInput,
    skuInput,
    collectionInput,
    tagInput,
    variantInput,
    showOutOfStock,
    showOnlySelected,
    hasQuantity,
  ])

  /** Returns formatted price if all variants have the same price, otherwise returns "N/A" */
  const getProductPrice = (product: GetAllProductsForCreateOrderViewModel): string => {
    if (product.variants.length === 0) return '—'

    const uniquePrices = [...new Set(product.variants.map((v) => v.price))]

    if (uniquePrices.length === 1) {
      const price = parseFloat(uniquePrices[0])
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price)
    }

    return 'N/A'
  }

  /** Check if product has multiple different prices */
  const hasMultiplePrices = (product: GetAllProductsForCreateOrderViewModel): boolean => {
    if (product.variants.length === 0) return false
    const uniquePrices = [...new Set(product.variants.map((v) => v.price))]
    return uniquePrices.length > 1
  }

  /** Calculate total for a product (sum of all variant quantities * their prices) */
  const getProductTotal = useCallback(
    (product: GetAllProductsForCreateOrderViewModel): number => {
      return product.variants.reduce((sum, variant) => {
        const qty = quantities[variant.id] ?? 0
        const price = parseFloat(variant.price)
        return sum + qty * price
      }, 0)
    },
    [quantities]
  )

  /** Calculate grand total for all products */
  const grandTotal = useMemo(() => {
    return filtered.reduce((sum, product) => sum + getProductTotal(product), 0)
  }, [filtered, getProductTotal])

  /** Calculate total quantity across all products */
  const totalQuantity = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0)
  }, [quantities])

  /** Get order items for checkout (only variants with quantity > 0) */
  const orderItems = useMemo(() => {
    const items: Array<{
      productId: string
      productTitle: string
      productImage: string | null
      variantId: string
      variantTitle: string
      quantity: number
      price: number
      total: number
    }> = []

    filtered.forEach((product) => {
      product.variants.forEach((variant) => {
        const qty = quantities[variant.id] ?? 0
        if (qty > 0) {
          const price = parseFloat(variant.price)
          items.push({
            productId: product.id,
            productTitle: product.title,
            productImage: product.featuredImageUrl,
            variantId: variant.id,
            variantTitle: variant.title,
            quantity: qty,
            price,
            total: qty * price,
          })
        }
      })
    })

    return items
  }, [filtered, quantities])

  const handleQuantityChange = (variantId: string, value: string) => {
    const numValue = parseInt(value, 10)
    if (value === '' || isNaN(numValue) || numValue < 0) {
      setQuantities((prev) => ({ ...prev, [variantId]: 0 }))
    } else {
      setQuantities((prev) => ({ ...prev, [variantId]: numValue }))
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendOrder = () => {
    if (!email.trim()) {
      setEmailError(t('emailRequired'))
      return
    }
    if (!validateEmail(email)) {
      setEmailError(t('emailInvalid'))
      return
    }
    setEmailError('')
    setIsConfirmOpen(true)
  }

  const handleConfirmSend = async () => {
    setIsSending(true)
    try {
      const response = await fetch('/api/orders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          emailLanguage,
          items: orderItems,
          totalQuantity,
          totalAmount: grandTotal,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to send order:', error)
        toast.error(t('errorSendingOrder'))
        setIsSending(false)
        return
      }

      // Success - close all dialogs and reset form
      setIsConfirmOpen(false)
      setIsCheckoutOpen(false)
      setEmail('')
      setQuantities({})

      // Show success toast with email
      toast.success(t('orderSentSuccess', { email }))
    } catch (error) {
      console.error('Error sending order:', error)
      toast.error(t('errorSendingOrder'))
    } finally {
      setIsSending(false)
    }
  }

  const handleClearCart = () => {
    setQuantities({})
    setShowOnlySelected(false)
    toast.success(t('clearCart'))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sticky header with filters and order summary */}
      <div className="sticky top-0 z-10 flex flex-col gap-4 bg-[var(--color-background)] pt-2 pb-4">
        {/* Title and Order Summary Card */}
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-2xl font-semibold">{t('title')}</h1>
          <Card className="w-96 border-2 border-[var(--color-brand-2)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-base font-medium">
                {t('totalOrder')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-[var(--color-brand-2)]/5 p-4">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {t('totalQuantityLabel')}
                  </span>
                  <span className="text-foreground mt-1 text-3xl font-bold">{totalQuantity}</span>
                </div>
                <div className="bg-border h-12 w-px" />
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Total
                  </span>
                  <span className="mt-1 text-3xl font-bold text-[var(--color-brand-2)]">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(grandTotal)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full cursor-pointer"
                size="lg"
                onClick={() => setIsCheckoutOpen(true)}
                disabled={totalQuantity === 0}
              >
                {t('checkout')}
              </Button>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                size="lg"
                onClick={handleClearCart}
                disabled={totalQuantity === 0}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                {t('clearCart')}
              </Button>
            </CardContent>
          </Card>
        </div>

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
              placeholder={t('filterCollectionPlaceholder')}
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
                id="show-only-selected"
                checked={showOnlySelected}
                onCheckedChange={setShowOnlySelected}
              />
              <Label htmlFor="show-only-selected" className="cursor-pointer text-sm">
                {t('showOnlySelected')}
              </Label>
            </div>
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
          </div>
        </div>

        {/* End of filters */}
      </div>

      {/* Table with header and body */}
      <Card className="w-full">
        <CardContent className="p-4">
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
            <div className="overflow-x-auto">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28" />
                    <TableHead className="w-64">{t('columnProduct')}</TableHead>
                    <TableHead className="w-[80px]">{t('columnProductDetails')}</TableHead>
                    <TableHead>{t('columnInventory')}</TableHead>
                    <TableHead className="w-96">{t('columnVariants')}</TableHead>
                    <TableHead>{t('columnPricePerVariant')}</TableHead>
                    <TableHead className="text-center">{t('columnQuantity')}</TableHead>
                    <TableHead className="text-right">{t('columnTotal')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((product) => {
                    const isSelected = hasQuantity(product)
                    return (
                      <TableRow
                        key={product.id}
                        className={isSelected ? 'bg-[var(--color-brand-3)]/10' : ''}
                      >
                        <TableCell>
                          {product.featuredImageUrl ? (
                            <div className="relative h-24 w-24 overflow-hidden rounded-md border border-[var(--color-border)]">
                              <Image
                                src={product.featuredImageUrl}
                                alt={product.featuredImageAlt ?? product.title}
                                fill
                                sizes="96px"
                                quality={75}
                                placeholder="blur"
                                blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-24 w-24 rounded-md border border-[var(--color-border)] bg-white" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="w-64 break-words whitespace-normal">{product.title}</div>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={Routes.retailProduct(product.numericId)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('viewProduct')}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.inStock
                                ? 'bg-[var(--color-success)] text-white'
                                : 'bg-[var(--color-error)] text-white'
                            }
                          >
                            {product.inStock
                              ? `${t('inStock')} (${product.totalInventory})`
                              : t('outOfStock')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {product.variants.map((v) => {
                              const variantQty = quantities[v.id] ?? 0
                              const isVariantSelected = variantQty > 0
                              const showPriceInVariant = hasMultiplePrices(product)
                              const formattedPrice = new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(parseFloat(v.price))

                              return (
                                <div key={v.id} className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={variantQty}
                                    onChange={(e) => handleQuantityChange(v.id, e.target.value)}
                                    className={`w-20 text-sm ${
                                      isVariantSelected
                                        ? 'border-2 border-[#10b981] bg-[#10b981]/10 focus-visible:ring-[#10b981]'
                                        : ''
                                    }`}
                                  />
                                  <Label
                                    className={`text-sm ${
                                      isVariantSelected ? 'font-bold text-[#10b981]' : ''
                                    }`}
                                  >
                                    {v.title}
                                    <span
                                      className={`ml-1 text-xs ${
                                        isVariantSelected
                                          ? 'text-[#10b981]'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      ({v.inventoryQuantity})
                                    </span>
                                    {showPriceInVariant && (
                                      <span
                                        className={`ml-1 text-xs font-semibold ${
                                          isVariantSelected ? 'text-[#10b981]' : 'text-foreground'
                                        }`}
                                      >
                                        {formattedPrice}
                                      </span>
                                    )}
                                  </Label>
                                </div>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{getProductPrice(product)}</TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {getSelectedVariantsCount(product)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(getProductTotal(product))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[var(--color-brand-1)]">
              {t('checkoutTitle')}
            </DialogTitle>
            <DialogDescription>{t('checkoutDescription')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="customer-email" className="text-sm font-medium">
                {t('customerEmail')}
              </Label>
              <Input
                id="customer-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                className={emailError ? 'border-[var(--color-error)]' : ''}
              />
              {emailError && <p className="text-sm text-[var(--color-error)]">{emailError}</p>}
            </div>

            {/* Email Language Selector */}
            <div className="space-y-2">
              <Label htmlFor="email-language" className="text-sm font-medium">
                {t('emailLanguage')}
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none">
                  <span>{emailLanguage === 'fr' ? 'Français (FR)' : 'English (EN)'}</span>
                  <span className="text-muted-foreground">▼</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setEmailLanguage('fr')}>
                    Français (FR)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEmailLanguage('en')}>
                    English (EN)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div
                  key={`${item.variantId}-${index}`}
                  className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4"
                >
                  {/* Product Image */}
                  {item.productImage ? (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-[var(--color-border)]">
                      <Image
                        src={item.productImage}
                        alt={item.productTitle}
                        fill
                        sizes="80px"
                        quality={75}
                        placeholder="blur"
                        blurDataURL={PRODUCT_IMAGE_BLUR_DATA_URL}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 flex-shrink-0 rounded-md border border-[var(--color-border)] bg-gray-100" />
                  )}

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <h3 className="font-semibold text-[var(--color-brand-1)]">
                        {item.productTitle}
                      </h3>
                      <p className="text-muted-foreground text-sm">{item.variantTitle}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {t('quantity')}: <span className="font-semibold">{item.quantity}</span>
                      </span>
                      <span className="text-muted-foreground">×</span>
                      <span className="font-semibold text-[var(--color-brand-2)]">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-[var(--color-brand-1)]">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border-2 border-[var(--color-brand-2)] bg-[var(--color-brand-2)]/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--color-brand-1)]">
                {t('orderSummary')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('totalItems')}</span>
                  <span className="font-semibold">{orderItems.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('totalQuantityLabel')}</span>
                  <span className="font-semibold">{totalQuantity}</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-[var(--color-brand-1)]">
                      {t('totalOrder')}
                    </span>
                    <span className="text-2xl font-bold text-[var(--color-brand-2)]">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              {t('close')}
            </Button>
            <Button
              onClick={handleSendOrder}
              className="bg-[var(--color-brand-2)] hover:bg-[var(--color-primary-hover)]"
            >
              {t('sendOrder')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--color-brand-1)]">
              {t('confirmTitle')}
            </DialogTitle>
            <DialogDescription>{t('confirmMessage', { email })}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isSending}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirmSend}
              disabled={isSending}
              className="bg-[var(--color-brand-2)] hover:bg-[var(--color-primary-hover)]"
            >
              {isSending ? t('sendingOrder') : t('confirmSend')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

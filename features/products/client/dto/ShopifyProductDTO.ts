/** Raw DTO shapes returned by the Shopify GraphQL API */

export interface ShopifyCollectionDTO {
  id: string
  title: string
  handle?: string
  descriptionHtml?: string
}

export interface ShopifyProductVariantDTO {
  id: string
  title: string
  sku: string
  inventoryQuantity: number
  price: string
  image: { url: string } | null
}

export interface ShopifyProductVariantDetailDTO {
  id: string
  title: string
  sku: string
  barcode: string | null
  selectedOptions: { name: string; value: string }[]
  inventoryItem: {
    inventoryLevels: {
      edges: {
        node: {
          location: { name: string }
          quantities: { name: string; quantity: number }[]
        }
      }[]
    }
  }
}

export interface ShopifyProductDTO {
  id: string
  title: string
  tags: string[]
  featuredImage: { url: string; altText: string | null } | null
  collections: { edges: { node: ShopifyCollectionDTO }[] }
  variants: { edges: { node: ShopifyProductVariantDTO }[] }
}

export interface ShopifyProductDetailDTO {
  id: string
  title: string
  productType: string
  description: string
  descriptionHtml: string
  tags: string[]
  options: { name: string; values: string[] }[]
  featuredImage: { url: string; altText: string | null } | null
  collections: { edges: { node: ShopifyCollectionDTO }[] }
  variants: { edges: { node: ShopifyProductVariantDetailDTO }[] }
}

export interface ShopifyProductsResponseDTO {
  data: {
    products: { edges: { node: ShopifyProductDTO }[] }
  }
}

export interface ShopifyProductDetailResponseDTO {
  data: {
    product: ShopifyProductDetailDTO | null
  }
}

export interface ShopifyProductsCountResponseDTO {
  data: {
    productsCount: { count: number }
  }
}

export interface ShopifyAuthResponseDTO {
  access_token: string
  scope: string
  expires_in: number
}

export interface ShopifyCheckSkuResponseDTO {
  data: {
    productVariants: {
      edges: { node: { id: string; sku: string } }[]
    }
  }
}

import { env } from '@/lib/env'

import type {
  ShopifyAuthResponseDTO,
  ShopifyCheckSkuResponseDTO,
  ShopifyProductDetailResponseDTO,
  ShopifyProductsCountResponseDTO,
  ShopifyProductsResponseDTO,
} from './dto/ShopifyProductDTO'

const SHOPIFY_API_URL = `${env.SHOPIFY_STORE_URL}/admin/api/2026-04/graphql.json`
const SHOPIFY_AUTH_URL = `${env.SHOPIFY_STORE_URL}/admin/oauth/access_token`

/**
 * Client for the Shopify Admin GraphQL API.
 * Handles authentication and product queries.
 */
export class ShopifyClient {
  private accessToken: string | null = null

  /** Authenticates with Shopify using client credentials and caches the token. */
  async authenticate(): Promise<string> {
    if (this.accessToken) return this.accessToken

    const body = new URLSearchParams({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    })

    const res = await fetch(SHOPIFY_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Shopify auth failed: ${res.status}`)

    const data: ShopifyAuthResponseDTO = await res.json()
    this.accessToken = data.access_token
    return this.accessToken
  }

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const token = await this.authenticate()

    const res = await fetch(SHOPIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Shopify GraphQL request failed: ${res.status}`)
    return res.json()
  }

  /** Returns the total number of products in the store. */
  async getProductsCount(): Promise<ShopifyProductsCountResponseDTO> {
    return this.graphql<ShopifyProductsCountResponseDTO>(`{
      productsCount {
        count
      }
    }`)
  }

  /** Fetches all products with collections, variants (including SKU), tags, and featured image. */
  async getProducts(first: number): Promise<ShopifyProductsResponseDTO> {
    return this.graphql<ShopifyProductsResponseDTO>(`{
      products(first: ${first}) {
        edges {
          node {
            id
            title
            tags
            collections(first: 50) {
              edges {
                node {
                  id
                  title
                }
              }
            }
            featuredImage {
              url
              altText
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  inventoryQuantity
                  price
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }`)
  }

  /** Fetches full product details including image, description, tags, options, and inventory levels per location. */
  async getProductDetail(gid: string): Promise<ShopifyProductDetailResponseDTO> {
    return this.graphql<ShopifyProductDetailResponseDTO>(`{
      product(id: "${gid}") {
        id
        title
        productType
        description
        descriptionHtml
        tags
        options {
          name
          values
        }
        featuredImage {
          url
          altText
        }
        collections(first: 100) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              sku
              barcode
              selectedOptions {
                name
                value
              }
              inventoryItem {
                inventoryLevels(first: 5) {
                  edges {
                    node {
                      location {
                        name
                      }
                      quantities(names: ["available"]) {
                        name
                        quantity
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`)
  }

  /** Checks which SKUs from the given list exist in Shopify. Returns the set of found SKUs. */
  async checkSkus(skus: string[]): Promise<ShopifyCheckSkuResponseDTO> {
    // Build inline query — avoids variable passing issues with some Shopify token scopes
    const skuQuery = skus.map((s) => `sku:${s}`).join(' OR ')
    const query = `{
      productVariants(first: 250, query: "${skuQuery.replace(/"/g, '\\"')}") {
        edges { node { id sku } }
      }
    }`
    return this.graphql<ShopifyCheckSkuResponseDTO>(query)
  }
}

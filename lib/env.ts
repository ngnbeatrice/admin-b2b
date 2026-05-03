import { z } from 'zod'

/**
 * Validates all environment variables at startup.
 * Add new variables here as features require them.
 * Import from '@/lib/env' instead of process.env directly.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('0.0.0'),
  NEXT_PUBLIC_APP_AUTHOR: z.string().default(''),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  /** Access token lifetime in seconds (default: 15 minutes) */
  AUTH_ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().default(900),
  /** Refresh token lifetime in seconds (default: 7 days) */
  AUTH_REFRESH_TOKEN_EXPIRES_IN: z.coerce.number().default(604800),
  /** Maximum failed login attempts before account is blocked (default: 3) */
  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(3),
  /** Shopify store base URL (e.g. https://your-store.myshopify.com) */
  SHOPIFY_STORE_URL: z.string().min(1),
  /** Shopify app client ID */
  SHOPIFY_CLIENT_ID: z.string().min(1),
  /** Shopify app client secret */
  SHOPIFY_CLIENT_SECRET: z.string().min(1),
  /** MBE API host URL */
  MBE_API_HOST: z.string().url().optional(),
  /** MBE API key for warehouse data access */
  MBE_API_KEY: z.string().min(1).optional(),
  /** Supabase project URL — used to resolve storage paths */
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  /** Supabase storage bucket name for catalog assets */
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: z.string().min(1).default('catalog'),
})

export const env = envSchema.parse(process.env)

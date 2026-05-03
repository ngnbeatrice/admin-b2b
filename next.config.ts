import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts')

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent double-rendering in development
  // Strict Mode causes Server Components to render twice, leading to duplicate API calls
  reactStrictMode: false,
  // ⚠️ WARNING: Skips type checking during build
  // Only use temporarily - fix TypeScript errors ASAP
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)

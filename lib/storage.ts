/**
 * Resolves a Supabase Storage path to a full public URL.
 * Store only the path in the DB (e.g. "products/linen-blazer.jpg"),
 * resolve to full URL here so bucket/domain changes only require one update.
 */
export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'catalog'
  return `${base}/storage/v1/object/public/${bucket}/${path}`
}

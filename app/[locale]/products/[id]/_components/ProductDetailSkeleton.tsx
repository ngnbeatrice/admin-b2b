import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton that mirrors the product detail page layout. */
export function ProductDetailSkeleton() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32" />

      {/* Hero: image + meta */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Image placeholder */}
        <Skeleton className="aspect-square w-full shrink-0 rounded-xl md:w-72" />

        {/* Meta */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Description card */}
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>

          {/* Collections */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-28 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Variants table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 pb-0">
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="p-4">
            {/* Header */}
            <div className="mb-2 grid grid-cols-4 gap-4 border-b pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            {/* Rows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 border-b py-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

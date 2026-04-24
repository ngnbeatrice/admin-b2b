import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Skeleton that mirrors the shape of the create order table. */
export function CreateOrderSkeleton() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          {/* Filter bar */}
          <div className="mb-4 flex gap-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-8 w-56" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-40" />
            </div>
          </div>

          {/* Table header */}
          <div className="mb-2 grid grid-cols-[48px_1fr_1fr_120px_100px] gap-4 border-b pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[48px_1fr_1fr_120px_100px] items-center gap-4 border-b py-3"
            >
              <Skeleton className="h-12 w-12 rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="ml-auto h-4 w-8" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

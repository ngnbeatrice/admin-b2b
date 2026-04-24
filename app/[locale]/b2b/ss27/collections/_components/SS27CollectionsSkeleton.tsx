import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SS27CollectionsSkeleton() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Collections skeleton */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="mb-2 grid grid-cols-4 gap-4 border-b pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 items-center gap-4 border-b py-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Colors skeleton */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="mb-2 grid grid-cols-3 gap-4 border-b pb-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid grid-cols-3 items-center gap-4 border-b py-3">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

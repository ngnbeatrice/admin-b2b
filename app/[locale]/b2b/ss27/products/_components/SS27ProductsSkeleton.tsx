import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SS27ProductsSkeleton() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Card className="w-full">
        <CardContent className="p-4">
          <div className="mb-2 grid grid-cols-5 gap-4 border-b pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 items-start gap-4 border-b py-3">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}

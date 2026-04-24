import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function UsersSkeleton() {
  return (
    <section className="flex flex-1 flex-col items-center p-6">
      <Card className="w-full max-w-2xl">
        <CardContent>
          <Skeleton className="mb-4 h-5 w-24" />
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-4 border-b pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-4 border-b py-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

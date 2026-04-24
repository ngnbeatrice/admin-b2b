import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileSkeleton() {
  return (
    <section className="flex flex-1 flex-col items-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="ml-6 flex gap-1.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

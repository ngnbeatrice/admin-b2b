import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 w-full" />
    </section>
  )
}

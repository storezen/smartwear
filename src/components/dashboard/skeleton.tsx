import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} {...props} />
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-card p-5 ring-1 ring-border">
      <Skeleton className="h-11 w-11 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-28" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-border">
      <div className="border-b border-border px-5 py-4">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl bg-card ring-1 ring-border p-5">
      <Skeleton className="h-4 w-28 mb-6" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl bg-card ring-1 ring-border p-5">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-3 w-40 mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

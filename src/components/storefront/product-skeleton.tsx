import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[32px] bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-200/60 transition-all">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[24px] bg-[#F6F8FA]">
        <Skeleton className="h-full w-full bg-neutral-200/50" />
        <div className="absolute top-4 left-4">
          <Skeleton className="h-6 w-16 rounded-full bg-white/50" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-5 w-3/4 rounded-lg bg-neutral-200/60" />
          <Skeleton className="h-4 w-1/2 rounded-lg bg-neutral-200/60" />
        </div>
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-lg bg-neutral-200/60" />
          <Skeleton className="h-10 w-28 rounded-full bg-neutral-200/60" />
        </div>
      </div>
    </div>
  )
}

import { ProductGridSkeleton } from "@/components/Skeleton"

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="relative min-h-[60vh] bg-muted overflow-hidden sm:min-h-[55vh]">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/5 to-muted" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="max-w-xl space-y-5">
            <div className="h-5 w-24 rounded-full skeleton" />
            <div className="h-12 w-full max-w-lg skeleton" />
            <div className="h-4 w-72 skeleton" />
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-36 rounded-full skeleton" />
              <div className="h-12 w-36 rounded-full skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured products skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="h-4 w-20 skeleton" />
          <div className="h-8 w-56 skeleton" />
          <div className="h-4 w-80 skeleton" />
        </div>
        <ProductGridSkeleton count={4} />
      </div>

      {/* Categories skeleton */}
      <div className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-20 skeleton" />
            <div className="h-8 w-48 skeleton" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl skeleton" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

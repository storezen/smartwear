import { WatchLoader } from "@/components/ui/watch-loader"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex items-center justify-center min-h-[100dvh]">
      <div className="relative z-10 scale-110 md:scale-125">
        <WatchLoader />
      </div>
    </div>
  )
}

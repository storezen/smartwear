"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { resolveMediaUrl, getMediaAttribution } from "@/lib/media/utils"
import { Camera } from "lucide-react"

interface MediaImageProps {
  value: string
  alt?: string
  className?: string
  wrapperClassName?: string
  width?: number | string
  height?: number | string
  loading?: "lazy" | "eager"
  fallback?: React.ReactNode
}

export function MediaImage({ value, alt, className, wrapperClassName, width, height, loading = "lazy", fallback }: MediaImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const url = resolveMediaUrl(value)
  const attribution = getMediaAttribution(value)

  if (!url || error) {
    return fallback ? <>{fallback}</> : null
  }

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="h-5 w-5 animate-pulse rounded-full bg-muted-foreground/20" />
        </div>
      )}
      <img
        src={url}
        alt={alt || ""}
        className={cn("transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0", className)}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        loading={loading}
      />
      {attribution.name && loaded && (
        <a
          href={attribution.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/70 backdrop-blur-sm opacity-0 transition-opacity hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Camera className="h-2.5 w-2.5" />
          {attribution.name}
        </a>
      )}
    </div>
  )
}

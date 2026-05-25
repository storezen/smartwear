"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, ImageOff, Loader2, ExternalLink, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { MediaPicker } from "./MediaPicker"
import { encodeMediaAsset, parseMediaValue, resolveMediaUrl, getMediaAttribution } from "@/lib/media/utils"
import type { MediaAsset } from "@/lib/media/types"

interface ImageFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

function ImagePreview({ value, onClear }: { value: string; onClear: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const url = resolveMediaUrl(value)
  const attribution = getMediaAttribution(value)
  const parsed = parseMediaValue(value)
  const isUnsplash = parsed?.source === "unsplash"

  if (!url) return null

  return (
    <div className="group relative mt-2 overflow-hidden rounded-lg bg-muted">
      {!loaded && !error && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {error ? (
        <div className="flex h-32 items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="h-4 w-4" />
          <span className="text-xs">Failed to load</span>
        </div>
      ) : (
        <img
          src={url}
          alt={parsed?.alt || ""}
          className={cn("h-32 w-full object-cover transition-opacity", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      {isUnsplash && loaded && !error && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex items-center gap-1">
            <Camera className="h-3 w-3 text-white/70" />
            <a
              href={attribution.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-white/80 hover:text-white truncate"
            >
              Photo by {attribution.name || "Unsplash"}
            </a>
            <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-white/50" />
          </div>
        </div>
      )}
      <button
        onClick={onClear}
        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function ImageField({ value, onChange, label }: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const url = resolveMediaUrl(value)

  function handlePickerSelect(asset: MediaAsset) {
    onChange(encodeMediaAsset(asset))
    setPickerOpen(false)
  }

  function handleUrlChange(newUrl: string) {
    onChange(newUrl)
  }

  function handleClear() {
    onChange("")
  }

  return (
    <div className="space-y-1.5">
      {label && <Label className="text-xs">{label}</Label>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://..."
            className="h-8 pr-8 text-xs"
          />
          {value && (
            <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPickerOpen(true)}
          className="h-8 w-8 shrink-0"
          title="Browse images"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </div>
      {value && <ImagePreview value={value} onClear={handleClear} />}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        currentUrl={url}
      />
    </div>
  )
}

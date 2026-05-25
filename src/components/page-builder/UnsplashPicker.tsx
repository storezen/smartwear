"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UnsplashImageResult } from "@/lib/media/types"

interface UnsplashPickerProps {
  onSelect: (image: UnsplashImageResult) => void
}

export function UnsplashPicker({ onSelect }: UnsplashPickerProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UnsplashImageResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setSearched(true)
    try {
      const res = await fetch(`/api/unsplash/search?q=${encodeURIComponent(query.trim())}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Search failed")
      }
      const data = await res.json()
      setResults(data.results || [])
    } catch (err: any) {
      setError(err.message || "Failed to search images")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  function handleSelect(img: UnsplashImageResult) {
    setSelectedId(img.id)
    fetch("/api/unsplash/track-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ downloadLocation: img.downloadLocation }),
    }).catch(() => {})
    onSelect(img)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search Unsplash (e.g. watches, luxury, lifestyle)"
            className="h-9 pl-9 text-sm"
          />
        </div>
        <Button size="sm" onClick={search} disabled={loading} className="h-9 shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ImageOff className="mb-2 h-8 w-8" />
          <p className="text-sm">No images found for "{query}"</p>
          <p className="text-xs">Try a different search term</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {results.map((img) => (
            <button
              key={img.id}
              onClick={() => handleSelect(img)}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-muted transition-all hover:shadow-md",
                selectedId === img.id ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-blue-200",
              )}
            >
              <img
                src={img.thumb}
                alt={img.alt || "Unsplash image"}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[10px] text-white/90">{img.photographerName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="mb-2 h-8 w-8" />
          <p className="text-sm">Search for free stock photos</p>
          <p className="text-xs">Powered by Unsplash</p>
        </div>
      )}
    </div>
  )
}

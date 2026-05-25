"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, X, Loader2, ImageOff, Check, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { UnsplashPhoto, UnsplashSearchResult } from "@/lib/unsplash"

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function MediaPage() {
  const [query, setQuery] = useState("watch")
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const search = useCallback(async (q: string, p: number, append = false) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(q)}&page=${p}&per_page=30`)
      const data: UnsplashSearchResult = await res.json()
      if (append) {
        setPhotos((prev) => [...prev, ...data.photos])
      } else {
        setPhotos(data.photos)
      }
      setHasMore(p < data.total_pages)
      setTotal(data.total)
    } catch {
      toast.error("Failed to fetch images")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/unsplash/search?query=watch&page=1&per_page=30`)
      .then((res) => res.json())
      .then((data: UnsplashSearchResult) => {
        if (cancelled) return
        setPhotos(data.photos)
        setHasMore(1 < data.total_pages)
        setTotal(data.total)
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to fetch images")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    search(query, 1)
  }

  function handleLoadMore() {
    const next = page + 1
    setPage(next)
    search(query, next, true)
  }

  async function copyUrl(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      toast.success("Image URL copied to clipboard")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error("Failed to copy URL")
    }
  }

  function handleDownload(photo: UnsplashPhoto) {
    window.open(photo.urls.raw + "&q=85&w=1920", "_blank")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Media Library</h1>
        <p className="mt-1 text-sm font-medium text-neutral-500">Search and browse high-quality images from Unsplash.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onSubmit={handleSearch}
        className="relative max-w-xl"
      >
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search images..."
          className="h-[56px] rounded-2xl pl-12 pr-14 text-base border-neutral-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] font-medium text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500/30 transition-all"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </Button>
        )}
      </motion.form>

      {total > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-neutral-400 uppercase tracking-wide">
          {total.toLocaleString()} images found for &ldquo;{query}&rdquo;
        </motion.p>
      )}

      {loading && photos.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" strokeWidth={2} />
        </motion.div>
      ) : photos.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 flex-col items-center justify-center gap-4 text-neutral-400">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-neutral-100 border border-neutral-200/60">
            <ImageOff className="h-8 w-8 text-neutral-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium">No images found. Try a different search.</p>
        </motion.div>
      ) : (
        <>
          <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {photos.map((photo) => (
              <motion.div key={photo.id} variants={itemAnim}>
                <div className="group overflow-hidden rounded-[24px] bg-white border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-0.5">
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    <img
                      src={photo.urls.small}
                      alt={photo.description || "Unsplash image"}
                      className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/90 hover:bg-white text-neutral-900 border border-white/20 backdrop-blur-md"
                        onClick={() => copyUrl(photo.urls.regular, photo.id)}
                      >
                        {copiedId === photo.id ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/90 hover:bg-white text-neutral-900 border border-white/20 backdrop-blur-md"
                        onClick={() => handleDownload(photo)}
                      >
                        <Download className="h-4 w-4" strokeWidth={2} />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="truncate text-xs font-medium text-white/90 drop-shadow-md">
                        {photo.user.name}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        {photo.width} &times; {photo.height}
                      </p>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md"
                        style={{ borderColor: photo.color, color: photo.color, backgroundColor: `${photo.color}15` }}
                      >
                        {photo.color}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyUrl(photo.urls.regular, photo.id)}
                      className="mt-3 w-full justify-start truncate rounded-xl bg-neutral-50 px-3 py-2 text-[11px] font-mono text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 h-auto border border-neutral-200/60 transition-colors"
                    >
                      {photo.urls.regular}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-8 pb-4">
              <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loading} className="gap-2 h-[48px] px-8 rounded-full font-bold bg-white border-neutral-200/60 text-neutral-700 hover:bg-neutral-50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
                {loading ? "Loading..." : "Load More Images"}
              </Button>
            </motion.div>
          )}
        </>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        All images are from{" "}
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Unsplash
        </a>
        {" — "}
        <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          free to use
        </a>
      </p>
    </motion.div>
  )
}

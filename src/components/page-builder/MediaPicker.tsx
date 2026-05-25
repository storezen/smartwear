"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { UnsplashPicker } from "./UnsplashPicker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageOff, Loader2, Image as ImageIcon, Upload, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { toMediaAsset } from "@/lib/media/utils"
import type { MediaAsset, UnsplashImageResult } from "@/lib/media/types"

interface UploadedFile {
  id: string
  url: string
  name: string
  size: number
  type: string
  createdAt: number
}

const UPLOADS_KEY = "smartwear-uploads"

function getUploads(): UploadedFile[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(UPLOADS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function addUpload(file: UploadedFile) {
  const list = getUploads()
  list.unshift(file)
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(list))
}

interface MediaPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  currentUrl?: string
}

function MyMediaTab({ onSelect }: { onSelect: (asset: MediaAsset) => void }) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function refresh() {
    setFiles(getUploads())
  }

  useEffect(() => { refresh() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      addUpload(data)
      refresh()
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleSelect(file: UploadedFile) {
    setSelectedId(file.id)
    onSelect(toMediaAsset(file.url))
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
        <p className="text-xs text-muted-foreground">Max 10MB, JPG/PNG/WebP</p>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-12 text-muted-foreground">
          <ImageIcon className="mb-2 h-10 w-10" />
          <p className="text-sm font-medium">No uploaded images</p>
          <p className="mt-1 text-xs">Click &quot;Upload Image&quot; to add one</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => handleSelect(file)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all",
                selectedId === file.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-border",
              )}
            >
              <img
                src={file.url}
                alt={file.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              {selectedId === file.id && (
                <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[10px] text-white/90">{file.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function UrlTab({ onSelect, currentUrl }: { onSelect: (asset: MediaAsset) => void; currentUrl?: string }) {
  const [url, setUrl] = useState(currentUrl || "")
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  function handleSelect() {
    if (!url.trim()) return
    onSelect(toMediaAsset(url.trim()))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Image URL</Label>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(false); setLoaded(false) }}
            placeholder="https://images.unsplash.com/photo-..."
            className="h-9 text-sm flex-1"
          />
          <Button size="sm" onClick={handleSelect} disabled={!url.trim()} className="h-9 shrink-0">
            Use
          </Button>
        </div>
      </div>
      {url && (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {!loaded && !error && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <img
            src={url}
            alt=""
            className={cn("h-full w-full object-cover", loaded ? "opacity-100" : "opacity-0")}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center text-muted-foreground">
                <ImageOff className="mx-auto mb-1 h-6 w-6" />
                <p className="text-xs">Could not load image</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function MediaPicker({ open, onClose, onSelect, currentUrl }: MediaPickerProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Select Image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="unsplash" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unsplash" className="text-xs">Unsplash</TabsTrigger>
            <TabsTrigger value="url" className="text-xs">Image URL</TabsTrigger>
            <TabsTrigger value="my-media" className="text-xs">My Media</TabsTrigger>
          </TabsList>
          <TabsContent value="unsplash" className="mt-4 max-h-[60vh] overflow-y-auto">
            <UnsplashPicker onSelect={(img: UnsplashImageResult) => {
              onSelect({
                id: img.id,
                source: "unsplash",
                url: img.url,
                thumb: img.thumb,
                alt: img.alt,
                width: img.width,
                height: img.height,
                photographerName: img.photographerName,
                photographerUrl: img.photographerUrl,
                unsplashUrl: img.unsplashUrl,
                downloadLocation: img.downloadLocation,
              })
            }} />
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <UrlTab onSelect={onSelect} currentUrl={currentUrl} />
          </TabsContent>
          <TabsContent value="my-media" className="mt-4">
            <MyMediaTab onSelect={onSelect} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

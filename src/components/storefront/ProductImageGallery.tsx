"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  discount?: number
  className?: string
  variantImage?: string
}

export function ProductImageGallery({ images: allImages, productName, discount = 0, className, variantImage }: ProductImageGalleryProps) {
  const images = allImages.length > 0 ? allImages : ["/placeholder.svg"]
  const [selected, setSelected] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const thumbnailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (variantImage) {
      const idx = images.indexOf(variantImage)
      if (idx >= 0) setSelected(idx)
    }
  }, [variantImage, images])

  const goTo = useCallback((i: number) => {
    setSelected(Math.max(0, Math.min(i, images.length - 1)))
  }, [images.length])

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-200, 200], [10, -10])
  const rotateY = useTransform(x, [-200, 200], [-10, 10])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (zoom) {
      const zX = ((e.clientX - rect.left) / rect.width) * 100
      const zY = ((e.clientY - rect.top) / rect.height) * 100
      setZoomPos({ x: zX, y: zY })
    }
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }, [zoom, x, y])

  const handleMouseLeave = useCallback(() => {
    setZoom(false)
    x.set(0)
    y.set(0)
  }, [x, y])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (Math.abs(diff) > 50) {
      goTo(selected + (diff < 0 ? 1 : -1))
    }
    setTouchStart(null)
  }, [touchStart, selected, goTo])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowLeft") goTo(selected - 1)
      if (e.key === "ArrowRight") goTo(selected + 1)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [lightboxOpen, selected, goTo])

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <motion.div
          className="relative overflow-hidden rounded-[24px] bg-[#F6F8FA] cursor-crosshair group"
          style={{ rotateX, rotateY, transformPerspective: 1000 } as any}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="aspect-square relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={selected}
                src={images[selected]}
                alt={`${productName} — Image ${selected + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "h-full w-full object-cover",
                  zoom ? "opacity-0" : "opacity-100"
                )}
                draggable={false}
              />
            </AnimatePresence>
            {zoom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${images[selected]})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: "200%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </div>

          {discount > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <span className="inline-flex items-center rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                -{discount}%
              </span>
            </div>
          )}

          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {selected + 1} / {images.length}
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(selected - 1) }}
                disabled={selected === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white disabled:opacity-30"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goTo(selected + 1) }}
                disabled={selected === images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white disabled:opacity-30"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            aria-label="View fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </motion.div>

        {images.length > 1 && (
          <div ref={thumbnailRef} className="flex gap-2.5 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cn(
                  "shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-[16px] transition-all duration-200 border-2",
                  i === selected
                    ? "border-blue-500 shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-neutral-200"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(selected - 1) }}
                  disabled={selected === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo(selected + 1) }}
                  disabled={selected === images.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}
            <motion.img
              key={selected}
              src={images[selected]}
              alt={`${productName} — Fullscreen`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {selected + 1} / {images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

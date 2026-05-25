"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ShoppingBag, Banknote, Heart, Flame, Eye, Zap, Truck, ShieldCheck, Star, CircleCheck } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/products"
import type { Product } from "@/lib/products"
import { Img } from "@/lib/img"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CODOrderModal } from "@/components/CODOrderModal"
import { useLiveScarcity } from "@/lib/hooks/useLiveScarcity"
import { useSectionSettings } from "@/lib/hooks/useSectionSettings"

interface ProductCardProps {
  product: Product
  index?: number
}

interface Variant {
  name: string
  value: string
  sku: string
  image?: string
}

function getColorHex(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("black") || n.includes("midnight") || n.includes("obsidian")) return "#0F172A"
  if (n.includes("silver") || n.includes("starlight") || n.includes("grey") || n.includes("polar")) return "#CBD5E1"
  if (n.includes("blue") || n.includes("sapphire") || n.includes("oceanic")) return "#2563EB"
  if (n.includes("orange") || n.includes("sunset") || n.includes("titanium")) return "#EA580C"
  if (n.includes("green") || n.includes("alpine") || n.includes("emerald")) return "#10B981"
  if (n.includes("gold") || n.includes("rose")) return "#F59E0B"
  if (n.includes("red") || n.includes("coral")) return "#EF4444"
  if (n.includes("purple") || n.includes("violet")) return "#8B5CF6"
  return "#64748B"
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart()
  const { productCardLayout = "bento" } = useSectionSettings()
  const [codOpen, setCodOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const { stockLeft, viewers, city, isLowStock, isCriticalStock } = useLiveScarcity(product.id)

  const parsedVariants = useMemo<Variant[]>(() => {
    if (!product.variants) return []
    try {
      if (typeof product.variants === "string") return JSON.parse(product.variants) as Variant[]
      return product.variants as Variant[]
    } catch { return [] }
  }, [product.variants])

  const hasVariants = parsedVariants.length > 0
  const [activeVariant, setActiveVariant] = useState<Variant | null>(null)

  const activeImage = useMemo(() => {
    if (activeVariant?.image) return activeVariant.image
    return product.image
  }, [activeVariant, product.image])

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  // Magnetic hover
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = (mouseX / width - 0.5) * 6 // max move 3px
    const yPct = (mouseY / height - 0.5) * 6
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    const itemId = activeVariant?.sku ? `${product.id}-${activeVariant.sku}` : product.id
    addItem({
      id: itemId,
      name: product.name,
      price: product.price,
      image: activeImage,
      variantLabel: activeVariant?.name || undefined,
      variantSku: activeVariant?.sku || undefined,
    })
    toast.success(`${product.name}${activeVariant ? ` (${activeVariant.name})` : ""} added!`)
    setTimeout(() => setAdding(false), 1200)
  }, [product, activeVariant, activeImage, addItem])

  const handleCOD = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCodOpen(true)
  }, [])

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted((prev) => !prev)
  }, [wishlisted])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="h-full"
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ y: -4 }}
          style={{ x: mouseXSpring, y: mouseYSpring }}
          className={cn(
            "group relative flex flex-col h-full bg-white transition-all duration-300 outline-none",
            productCardLayout === "bento" && "rounded-[32px] p-4 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]",
            productCardLayout === "minimal" && "p-2 border-transparent shadow-none hover:bg-neutral-50/50",
            productCardLayout === "bordered" && "p-4 border border-neutral-300 rounded-sm shadow-none",
            productCardLayout === "glass" && "p-4 rounded-2xl border border-white/20 bg-white/40 backdrop-blur-md shadow-lg"
          )}
        >
          <Link href={`/products/${product.id}`} className="flex flex-col flex-1 relative z-10 outline-none">

            {/* Image */}
            <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden bg-[#F6F8FA] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Img
                    src={activeImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={400}
                    height={300}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {product.featured && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                    <Zap className="size-2" /> Featured
                  </span>
                )}
                {discount > 0 && (
                  <div className="absolute -top-2 -left-2 overflow-hidden w-16 h-16 pointer-events-none">
                    <span className="absolute top-4 -left-4 w-24 block text-center rotate-[-45deg] bg-emerald-500 px-2 py-0.5 text-[8px] font-bold tracking-widest text-white shadow-sm uppercase">
                      Save {discount}%
                    </span>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleWishlist}
                className="absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-black/5 shadow-sm transition-all duration-200 hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={`size-3 transition-colors ${
                    wishlisted ? "fill-red-500 text-red-500" : "text-neutral-400"
                  }`}
                  strokeWidth={1.5}
                />
              </motion.button>

              {/* Out of Stock */}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <span className="rounded-md bg-white border border-black/10 px-3 py-1 text-[10px] font-semibold text-neutral-500 shadow uppercase tracking-wider">
                    Out of Stock
                  </span>
                </div>
              )}
              {/* Quick Action Tray */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[0.16,1,0.3,1] z-20 flex justify-center pb-2 px-2">
                <button
                  onClick={handleCOD}
                  disabled={!product.inStock}
                  className="w-full bg-white/90 backdrop-blur-md text-neutral-900 font-bold text-[13px] py-2.5 rounded-xl border border-neutral-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:bg-white hover:border-emerald-500/30 hover:text-emerald-600 transition-all disabled:opacity-50 flex justify-center items-center gap-1.5"
                >
                  <Banknote className="size-3.5" strokeWidth={2} />
                  Quick Order
                </button>
              </div>

            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 pt-4 gap-2">
              {/* Category + Savings row */}
              <div className="flex items-center justify-between min-h-0">
                <p className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase">{product.category}</p>
                {discount > 0 && (
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Save {formatPrice(product.originalPrice! - product.price)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-heading font-semibold text-sm leading-snug line-clamp-1 text-neutral-900 group-hover:text-emerald-700 transition-colors duration-200">
                {product.name}
              </h3>

              {/* Rating + Scarcity row */}
              <div className="flex items-center gap-2">
                {product.rating ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center gap-[1px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-2.5 ${i < Math.floor(product.rating!) ? "text-amber-500 fill-amber-500" : "text-neutral-200"}`}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">({product.reviews || 0})</span>
                  </div>
                ) : null}
                {isCriticalStock && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <Flame className="size-2.5" />
                    Only {stockLeft} left!
                  </span>
                )}
                {viewers > 6 && !isCriticalStock && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <Eye className="size-2.5" />
                    {viewers} watching
                  </span>
                )}
              </div>

              {/* Variants */}
              {hasVariants && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {parsedVariants.slice(0, 10).map((variant, idx) => {
                    const isActive = activeVariant?.sku === variant.sku || (!activeVariant && idx === 0)
                    return (
                      <motion.button
                        key={variant.sku}
                        title={variant.name}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveVariant(variant) }}
                        onMouseEnter={() => setActiveVariant(variant)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`size-4 rounded-full border-[1.5px] transition-colors duration-200 cursor-pointer flex items-center justify-center ${
                          isActive
                            ? "border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]"
                            : "border-neutral-300"
                        }`}
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: getColorHex(variant.name) }}
                        />
                      </motion.button>
                    )
                  })}
                  {parsedVariants.length > 10 && (
                    <span className="text-[10px] text-neutral-500 ml-1">+{parsedVariants.length - 10} more</span>
                  )}
                  <span className="text-[8px] text-neutral-400 ml-0.5">{activeVariant?.name || parsedVariants[0]?.name}</span>
                </div>
              )}

              {/* Price row */}
              <div className="flex items-baseline gap-2">
                <span className="text-base font-extrabold text-neutral-900 font-heading">
                    {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-[11px] text-neutral-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* COD Hero Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCOD}
                disabled={!product.inStock}
                className="h-[40px] w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-xs tracking-wide shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                <Banknote className="size-4" strokeWidth={2} />
                Order Now — Pay on Delivery
              </motion.button>

              {/* Add to Cart + Trust strip */}
              <div className="flex items-center justify-between">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleAdd}
                  disabled={adding || !product.inStock}
                >
                  <ShoppingBag className={`size-3 ${adding ? "animate-bounce" : ""}`} strokeWidth={1.5} />
                  {adding ? "Adding…" : "Add to Cart"}
                </motion.button>

                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-[9px] text-neutral-400">
                    <Truck className="size-2.5" strokeWidth={1.5} /> Free Delivery
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-neutral-400">
                    <ShieldCheck className="size-2.5" strokeWidth={1.5} /> 7-Day
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      <CODOrderModal
        product={{ ...product, image: activeImage, sku: activeVariant?.sku || product.sku }}
        open={codOpen}
        onOpenChange={setCodOpen}
      />
    </>
  )
}

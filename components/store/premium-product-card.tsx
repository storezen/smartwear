"use client"

import Image from "next/image"
import { useState } from "react"
import { Heart, ShoppingBag, Star, Zap, Truck } from "lucide-react"
import { Product } from "@/types"
import { formatPrice } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { SpotlightCard } from "@/components/ui/spotlight-card"

import { useRouter } from "next/navigation"

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const router = useRouter()
  const [imgErr, setImgErr] = useState(false)
  
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const inWishlist = isInWishlist(product.id)
  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inStock) addToCart(product, 1)
  }

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inStock) {
      addToCart(product, 1)
      router.push('/checkout')
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)
  }

  const handleNavigate = () => {
    router.push(`/products/${product.slug}`)
  }

  return (
    <>
      <div className={cn("group block cursor-pointer", className)} onClick={handleNavigate}>
        <SpotlightCard className="h-full relative overflow-hidden bg-card rounded-2xl border-white/[0.06] transition-colors duration-500 hover:border-[#B8860B]/25 flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-[#B8860B]/0 to-[#B8860B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* ── IMAGE ── */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#0F1923] to-[#0A0D12] shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-[#B8860B]/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

            {!imgErr ? (
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#0C0F14]/5 pointer-events-none z-20" />
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-700 ease-[0.25,0.46,0.45,0.94] group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  onError={() => setImgErr(true)}
                />
              </div>
            ) : (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <svg viewBox="0 0 64 64" className="w-16 h-16 opacity-15" fill="none">
                  <rect x="22" y="2" width="20" height="6" rx="3" fill="#B8860B"/>
                  <rect x="22" y="56" width="20" height="6" rx="3" fill="#B8860B"/>
                  <circle cx="32" cy="32" r="27" fill="#0F1923" stroke="#B8860B" strokeWidth="1.5"/>
                  <circle cx="32" cy="32" r="21" fill="#0C0F14"/>
                  <line x1="32" y1="32" x2="32" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="32" y1="32" x2="42" y2="32" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="32" cy="32" r="2.5" fill="#B8860B"/>
                </svg>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-40 pointer-events-none">
              <div className="flex flex-col gap-1">
                {discount > 0 && (
                  <span className="bg-[#B8860B] text-[#0C0F14] text-[9px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-lg self-start">
                    -{discount}%
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-white/10 backdrop-blur-md text-foreground border border-border text-[9px] font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider self-start">
                    Featured
                  </span>
                )}
              </div>

              <button
                onClick={handleWishlist}
                className="pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-md border border-border text-foreground hover:bg-[#B8860B]/20 hover:border-[#B8860B]/50 transition-all sw-interactive group/heart"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={cn("w-3.5 h-3.5 transition-all duration-300", inWishlist ? "fill-[#B8860B] text-[#B8860B]" : "group-hover/heart:scale-110")}
                />
              </button>
            </div>

            {lowStock && (
              <div className="absolute bottom-2 left-3 right-3 z-40">
                <div className="bg-amber-500/15 backdrop-blur-md border border-amber-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-amber-400 text-[9px] font-medium">{product.stock} left</span>
                  <div className="w-16 h-1 rounded-full bg-amber-500/20 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${(product.stock / 10) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── INFO ── */}
          <div className="relative p-4 bg-gradient-to-b from-transparent to-[#0C0F14] z-20 border-t border-border group-hover:border-[#B8860B]/20 transition-colors duration-500 flex-1 flex flex-col justify-between">
            
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[#B8860B] text-[9px] font-bold uppercase tracking-[0.2em] truncate">{product.brand}</span>
              <div className="flex items-center gap-1 text-[10px] font-medium text-foreground/60 shrink-0">
                <Star className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
                {product.rating}
                <span className="text-foreground/30">({product.reviews_count || 0})</span>
              </div>
            </div>

            <h3 
              className="text-white text-sm font-medium line-clamp-1 group-hover:text-[#B8860B] transition-colors duration-300 mb-3"
              style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}
            >
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 mb-3">
              {discount > 0 && product.compare_price ? (
                <>
                  <span className="text-white font-semibold text-[15px] tracking-wide">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-foreground/40 text-[10px] line-through decoration-white/20">
                    {formatPrice(product.compare_price)}
                  </span>
                </>
              ) : (
                <span className="text-white font-semibold text-[15px] tracking-wide">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* COD Tag */}
            <div className="flex items-center gap-1 text-[10px] text-emerald-400/80 font-medium mb-3">
              <Truck className="w-3 h-3" />
              Free Delivery · COD Available
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-1.5 relative z-40">
              <button
                onClick={handleQuickBuy}
                disabled={!inStock}
                className="col-span-3 h-11 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-[#0C0F14] font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 sw-interactive flex items-center justify-center gap-1.5"
              >
                {inStock ? <><Zap className="w-3 h-3 fill-[#0C0F14]" /> Quick Buy</> : "Out of Stock"}
              </button>
              <button
                onClick={handleCart}
                disabled={!inStock}
                className="col-span-1 h-11 rounded-lg bg-white/5 border border-border flex items-center justify-center text-foreground hover:bg-white/10 transition-colors sw-interactive disabled:opacity-50"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </SpotlightCard>
      </div>

    </>
  )
}

export function ProductCardGrid({ products, className }: { products: Product[]; className?: string }) {
  if (!products?.length) return null
  return (
    <div className={cn("flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0", className)}>
      {products.map((product) => (
        <div key={product.id} className="snap-start shrink-0 w-[240px] sm:w-[280px] md:w-auto">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}

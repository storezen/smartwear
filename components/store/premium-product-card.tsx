"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Heart, ShoppingBag, Star, Zap, Truck } from "lucide-react"
import { Product } from "@/types"
import { formatPrice } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { QuickBuyModal } from "@/components/store/quick-buy-modal"

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const [imgErr, setImgErr] = useState(false)
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false)
  
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
    if (inStock) setIsQuickBuyOpen(true)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)
  }

  return (
    <>
      <div className={cn("group block", className)}>
        <SpotlightCard className="h-full relative overflow-hidden bg-white/[0.02] rounded-2xl border-white/[0.06] transition-colors duration-500 hover:border-[#B8860B]/30 flex flex-col">
          {/* Absolute Link Overlay for whole card clickability */}
          <Link href={`/products/${product.slug}`} className="absolute inset-0 z-30 focus:outline-none" aria-label={product.name} />

          {/* Background glow that reveals on hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#B8860B]/0 to-[#B8860B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* ── IMAGE SECTION ── */}
          <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#0F1923] to-[#0A0D12] shrink-0">
            
            {/* Subtle radial glow behind watch */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-[#B8860B]/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

            {!imgErr ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover z-10 transition-all duration-700 ease-[0.25,0.46,0.45,0.94] group-hover:scale-105 group-hover:-translate-y-2"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={() => setImgErr(true)}
              />
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
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40 pointer-events-none">
              <div className="flex flex-col gap-1.5">
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Truck className="w-2.5 h-2.5" /> COD Available
                </span>
                {discount > 0 && (
                  <span className="bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-[#0C0F14] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg self-start">
                    Save {discount}%
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg self-start">
                    Featured
                  </span>
                )}
              </div>

              <button
                onClick={handleWishlist}
                className="pointer-events-auto min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-[#B8860B]/20 hover:border-[#B8860B]/50 transition-all sw-interactive group/heart shadow-lg"
              >
                <Heart
                  className={cn("w-4 h-4 transition-all duration-300", inWishlist ? "fill-[#B8860B] text-[#B8860B]" : "group-hover/heart:scale-110")}
                />
              </button>
            </div>
          </div>

          {/* ── INFO SECTION ── */}
          <div className="relative p-4 sm:p-6 bg-gradient-to-b from-transparent to-[#0C0F14] z-20 border-t border-white/5 group-hover:border-[#B8860B]/20 transition-colors duration-500 flex-1 flex flex-col justify-between">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#B8860B] text-[9px] font-bold uppercase tracking-[0.2em]">SMARTWEAR</span>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/70 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  <Star className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
                  {product.rating}
                </div>
              </div>
              
              <h3 
                className="text-white text-sm sm:text-base font-medium line-clamp-1 group-hover:text-[#B8860B] transition-colors duration-300 mb-3 sm:mb-4"
                style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}
              >
                {product.name}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  {discount > 0 && product.compare_price ? (
                    <>
                      <span className="text-white/60 text-[10px] line-through decoration-white/20 mb-0.5">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="text-white font-semibold text-sm sm:text-[15px] tracking-wide">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-white font-semibold text-sm sm:text-[15px] tracking-wide">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {lowStock && (
                  <span className="text-[#D4A017] text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-[#D4A017]/10 border border-[#D4A017]/20">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 relative z-40 mt-1">
                <button
                  onClick={handleQuickBuy}
                  disabled={!inStock}
                  className="col-span-3 min-h-[40px] sm:min-h-[44px] rounded-lg bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-[#0C0F14] font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 sw-interactive flex items-center justify-center gap-1 sm:gap-1.5 shadow-[0_0_15px_rgba(184,134,11,0.2)]"
                >
                  {inStock ? <><Zap className="w-3.5 h-3.5 fill-[#0C0F14]" /> Buy Now</> : "Out of Stock"}
                </button>
                <button
                  onClick={handleCart}
                  disabled={!inStock}
                  className="col-span-1 min-h-[40px] sm:min-h-[44px] rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors sw-interactive disabled:opacity-50"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </SpotlightCard>
      </div>

      <QuickBuyModal 
        product={product} 
        isOpen={isQuickBuyOpen} 
        onClose={() => setIsQuickBuyOpen(false)} 
      />
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

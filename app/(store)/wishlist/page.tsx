"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, Sparkles, ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWishlist } from '@/context/wishlist-context'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function PremiumWishlistPage() {
  const { items, removeFromWishlist } = useWishlist()
  const { addToCart, isInCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0C0F14] text-white flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-[#0C0F14] opacity-30 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            className="relative w-32 h-32 mx-auto mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-[#B8860B]/20 rounded-full blur-3xl" />
            <div className="relative w-full h-full bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-[#B8860B]" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold mb-3 text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Your Wishlist is Empty</h1>
          <p className="text-white/60 mb-8 text-lg max-w-md mx-auto">
            Save items you love to your wishlist and find them here anytime.
          </p>
          <Link href="/products">
            <button className="sw-btn-gold h-12 px-8 flex items-center mx-auto">
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[#0C0F14] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="relative overflow-hidden text-white pt-20 pb-12 md:pt-28 md:pb-16 border-b border-white/5 mb-8">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ background: "radial-gradient(circle, #B8860B, transparent)" }}
        />
        <div className="sw-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-white/70 mb-6 justify-center uppercase tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span className="text-[#B8860B]">Wishlist</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            My Wishlist
          </h1>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/20 text-[#B8860B] text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 mr-1.5 fill-[#B8860B] text-[#B8860B]" />
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      <div className="sw-container pb-16 relative">

        {/* Wishlist Items */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const inCart = isInCart(item.product.id)
              const discount = item.product.compare_price
                ? Math.round(((item.product.compare_price - item.product.price) / item.product.compare_price) * 100)
                : 0

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="group rounded-[24px] border border-white/5 bg-[#0F1923] p-3 hover:border-white/20 transition-all duration-300 flex flex-col h-full">
                    <Link href={`/products/${item.product.slug}`} className="block relative aspect-[4/5] rounded-[16px] overflow-hidden mb-4">
                      <motion.div
                        className="w-full h-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-[#0C0F14]/10 z-10" />
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                          className="object-cover"
                        />
                      </motion.div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 z-20 flex gap-2">
                        {discount > 0 && (
                          <div className="bg-[#B8860B] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            -{discount}%
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-red-500/80 hover:border-red-500 text-white/70 hover:text-white transition-all"
                        onClick={(e) => {
                          e.preventDefault()
                          removeFromWishlist(item.product.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Quick Add on Hover */}
                      <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <button
                          className="w-full h-11 rounded-xl bg-white/10 hover:bg-[#B8860B] backdrop-blur-md border border-white/20 hover:border-[#B8860B] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            addToCart(item.product)
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {inCart ? 'Added' : 'Add to Cart'}
                        </button>
                      </div>
                    </Link>

                    <div className="flex-1 flex flex-col px-1">
                      <Link href={`/products/${item.product.slug}`}>
                        <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1.5">
                          {item.product.brand}
                        </p>
                        <h3 className="font-medium text-white line-clamp-2 group-hover:text-[#B8860B] transition-colors leading-snug">
                          {item.product.name}
                        </h3>
                      </Link>

                      <div className="mt-auto pt-3 flex items-center gap-2">
                        <span className="font-bold text-white">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.compare_price && (
                          <span className="text-sm text-white/60 line-through">
                            {formatPrice(item.product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/products">
            <button className="sw-btn-ghost-white h-12 px-8 flex items-center mx-auto">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Continue Shopping
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
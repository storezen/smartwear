"use client"

import { useState, useEffect } from "react"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ChevronRight, AlertCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/mock-data"

/* ── Free shipping progress ── */
function ShippingBar({ subtotal }: { subtotal: number }) {
  const [threshold, setThreshold] = useState<number>(10000)
  useEffect(() => {
    fetch('/api/public/settings').then(r => r.json()).then(d => { if (d?.free_delivery_threshold) setThreshold(Number(d.free_delivery_threshold)) }).catch(() => {})
  }, [])
  const pct = Math.min((subtotal / threshold) * 100, 100)
  const remaining = threshold - subtotal
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(22, 163, 74, 0.05)", border: "1px solid rgba(22, 163, 74, 0.2)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4" style={{ color: "#4ADE80" }} />
          {subtotal >= threshold ? (
            <p className="text-sm font-semibold" style={{ color: "#4ADE80" }}>
              🎉 You've unlocked free delivery!
            </p>
          ) : (
            <p className="text-sm" style={{ color: "#4ADE80" }}>
              Add <strong className="text-white">{formatPrice(remaining)}</strong> more for free delivery
            </p>
          )}
        </div>
        <span className="text-xs font-semibold" style={{ color: "#4ADE80" }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #16A34A, #22C55E)" }}
        />
      </div>
    </div>
  )
}

/* ── Empty ── */
function EmptyCart() {
  return (
    <div className="py-16 md:py-24 text-center max-w-xs mx-auto">
      <div className="w-20 h-20 rounded-[24px] border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-5">
        <ShoppingBag className="w-9 h-9 text-white/60" />
      </div>
      <h1 className="text-xl font-semibold mb-2 text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
        Your cart is empty
      </h1>
      <p className="text-sm text-white/60 leading-relaxed mb-7">
        You haven't added any watches yet. Explore our premium collection.
      </p>
      <Link href="/products">
        <button className="sw-btn-gold">
          Discover Watches
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  )
}

/* ══════════════════════════
   CART PAGE
   ══════════════════════════ */
export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart()
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [freeThreshold, setFreeThreshold] = useState<number>(10000)
  useEffect(() => {
    fetch('/api/public/settings').then(r => r.json()).then(d => { if (d?.free_delivery_threshold) setFreeThreshold(Number(d.free_delivery_threshold)) }).catch(() => {})
  }, [])
  const shipping = subtotal >= freeThreshold ? 0 : 200
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">

      {/* Header */}
      <div className="relative overflow-hidden text-white pt-14 pb-6 md:pt-28 md:pb-16 border-b border-white/5">
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
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-white/70 mb-4 sm:mb-6 justify-center uppercase tracking-wide sm:tracking-widest flex-wrap">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
            <span className="text-[#B8860B]">Shopping Cart</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-bold text-white leading-tight mb-2 sm:mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            Your Cart
          </motion.h1>
          {items.length > 0 && (
            <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              You have {itemCount} {itemCount === 1 ? "timepiece" : "timepieces"} carefully selected.
            </p>
          )}
        </div>
      </div>

      <div className="sw-container py-6 md:py-8">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">

            {/* Items */}
            <div className="lg:col-span-2 space-y-3.5 min-w-0">
              <ShippingBar subtotal={subtotal} />

              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-all duration-200 group hover:border-[#B8860B]/40 hover:shadow-[0_0_20px_rgba(184,134,11,0.08)]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Image */}
                  <Link href={`/products/${item.product.slug}`} className="shrink-0">
                    <div className="relative overflow-hidden rounded-xl border border-white/5 w-[72px] h-[72px] sm:w-[88px] sm:h-[88px]" style={{ background: "#0F1923" }}>
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 72px, 88px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#B8860B" }}>
                      {item.product.brand}
                    </p>
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="text-sm font-semibold mt-0.5 leading-snug line-clamp-2 hover:text-[#B8860B] transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    {item.selectedColor && (
                      <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#B8860B]" />
                        {item.selectedColor}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                      {/* Quantity */}
                      <div className="flex items-center rounded-xl overflow-hidden border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 sm:w-11 h-10 sm:h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors disabled:opacity-30 sw-interactive"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 sm:w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 sm:w-11 h-10 sm:h-11 flex items-center justify-center text-white/60 hover:text-white transition-colors sw-interactive"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-white" style={{ fontSize: "1rem" }}>
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => setItemToDelete(item.id)}
                    className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all text-white/60 hover:text-red-400 hover:bg-red-500/10 sw-interactive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mt-1">
                ← Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1 min-w-0"
            >
              <div
                className="rounded-2xl p-4 sm:p-6 sticky top-[calc(60px+16px)] backdrop-blur-xl"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <h2 className="font-semibold text-lg mb-6" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Order Summary</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Subtotal ({itemCount} items)</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? "text-[#4ADE80]" : ""}`}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-white/60">
                    <span>COD Fee</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/5 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/60 mb-0.5">Total</p>
                      <p className="font-bold text-2xl" style={{ color: "#B8860B" }}>{formatPrice(total)}</p>
                    </div>
                  </div>
                </div>

                <Link href="/checkout" className="block mt-8">
                  <button className="sw-btn-gold w-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(184,134,11,0.2)] min-h-[44px]">
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <div className="flex items-center justify-center gap-3 mt-3.5 text-xs text-muted-foreground">
                  <span>🔒 Secure</span>
                  <span>•</span>
                  <span>💳 COD Available</span>
                  <span>•</span>
                  <span>🚚 Nationwide</span>
                </div>

                {/* Payment */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-3 mb-4 text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <p className="text-green-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" /> 100% Cash on Delivery
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-[9px] text-white/60 uppercase tracking-widest text-center mb-2.5 font-semibold">Other Payment Methods</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {["JazzCash", "Easypaisa", "Bank Transfer"].map(m => (
                      <span
                        key={m}
                        className="text-[11px] sm:text-[10px] font-medium text-white/60 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#0F1923] border border-white/10 rounded-2xl shadow-2xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Remove Item?</h3>
            <p className="text-white/60 text-sm mb-8">Are you sure you want to remove this beautiful timepiece from your cart?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 border border-transparent transition-colors">Keep It</button>
              <button onClick={() => { removeFromCart(itemToDelete); setItemToDelete(null); }} className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">Remove</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
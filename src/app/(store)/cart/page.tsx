"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Minus, Plus, ShoppingBag, ShieldCheck, Banknote, RotateCcw } from "lucide-react"
import { PageMeta } from "@/components/PageMeta"
import { EmptyState } from "@/components/EmptyState"
import { PageTransition } from "@/components/PageTransition"
import { useCart } from "@/lib/cart-context"
import { Img } from "@/lib/img"
import { formatPrice } from "@/lib/products"
import { ConfirmDialog } from "@/app/dashboard/sections/ConfirmDialog"

const FREE_SHIPPING_THRESHOLD = 5000
const easePremium = [0.16, 1, 0.3, 1] as const

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } = useCart()
  const subtotal = getSubtotal()
  const [clearOpen, setClearOpen] = useState(false)
  const shippingProgress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1)
  const shippingRemaining = FREE_SHIPPING_THRESHOLD - subtotal
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD

  if (items.length === 0) {
    return (
      <>
        <PageMeta title="Shopping Cart" description="Review your items before checkout." noindex ogImage="/og-default.jpg" />
        <PageTransition>
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything yet. Discover the latest drops."
            actionLabel="Start Shopping"
            actionHref="/products"
          />
        </PageTransition>
      </>
    )
  }

  return (
    <>
      <PageMeta title="Shopping Cart" description="Review your items before checkout." noindex ogImage="/og-default.jpg" />
      <PageTransition>
        <div className="min-h-screen bg-[#FAFAFA]">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#0A0A0A] sm:text-5xl">
                  Shopping Cart
                </h1>
                <p className="mt-2 text-sm font-medium text-[#0A0A0A]/60">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setClearOpen(true)}
                className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors self-start sm:self-auto"
              >
                <Trash2 className="size-4" />
                Clear All
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
              {/* Cart Items List */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: easePremium }}
                    >
                      <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden p-4 sm:p-6 transition-colors hover:border-[#0A0A0A]/20">
                        <div className="flex gap-4 sm:gap-6">
                          <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl bg-[#F0F0F0]">
                            <Img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover mix-blend-multiply"
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-between min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 pr-4">
                                <h3 className="text-base sm:text-lg font-bold text-[#0A0A0A] truncate">
                                  {item.name}
                                </h3>
                                {item.variantLabel && (
                                  <p className="text-sm font-medium text-[#0A0A0A]/60 mt-1">
                                    {item.variantLabel}
                                  </p>
                                )}
                                <p className="mt-2 text-base font-bold text-[#0A0A0A]">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[#0A0A0A]/40 hover:text-red-500 transition-colors shrink-0 p-2 -mr-2 -mt-2"
                              >
                                <Trash2 className="size-5" />
                              </button>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="h-10 w-10 flex items-center justify-center text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#F0F0F0] transition-colors"
                                >
                                  <Minus className="size-4" />
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={item.quantity}
                                  readOnly
                                  className="w-12 text-center text-sm font-bold text-[#0A0A0A] bg-transparent outline-none pointer-events-none"
                                />
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="h-10 w-10 flex items-center justify-center text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#F0F0F0] transition-colors"
                                >
                                  <Plus className="size-4" />
                                </button>
                              </div>
                              <span className="text-lg font-bold text-[#0A0A0A]">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-24 bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-[#0A0A0A] mb-8">
                    Order Summary
                  </h2>
                  <div className="space-y-6">
                    <div className="flex justify-between text-base">
                      <span className="font-medium text-[#0A0A0A]/60">Subtotal</span>
                      <span className="font-bold text-[#0A0A0A]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="font-medium text-[#0A0A0A]/60">Shipping</span>
                        {shippingFree ? (
                          <span className="font-bold text-[#10B981] uppercase tracking-wider text-sm">
                            Free
                          </span>
                        ) : (
                          <span className="font-bold text-[#0A0A0A]">
                            {formatPrice(0)}
                          </span>
                        )}
                      </div>
                      
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F0F0F0]">
                        <motion.div
                          className="h-full rounded-full bg-[#10B981]"
                          initial={{ width: 0 }}
                          animate={{ width: `${shippingProgress * 100}%` }}
                          transition={{ duration: 0.8, ease: easePremium }}
                        />
                      </div>
                      
                      {!shippingFree ? (
                        <p className="text-sm font-medium text-[#0A0A0A]/60">
                          Add <span className="text-[#0A0A0A]">{formatPrice(shippingRemaining)}</span> more for free shipping
                        </p>
                      ) : (
                        <p className="text-sm font-bold text-[#10B981]">
                          You&apos;ve unlocked free shipping!
                        </p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-[#E5E5E5]">
                      <div className="flex justify-between items-end">
                        <span className="text-lg font-bold text-[#0A0A0A]">Total</span>
                        <span className="text-3xl font-extrabold text-[#0A0A0A]">{formatPrice(subtotal)}</span>
                      </div>
                      <p className="text-xs font-medium text-[#0A0A0A]/40 mt-1 text-right">
                        Including all taxes
                      </p>
                    </div>

                    <Link href="/checkout" className="block mt-8">
                      <button className="w-full h-[56px] flex items-center justify-center text-sm font-bold uppercase tracking-widest bg-[#0A0A0A] text-white rounded-full hover:scale-[1.02] transition-transform">
                        Proceed to Checkout
                      </button>
                    </Link>

                    <Link
                      href="/products"
                      className="block text-center mt-4 text-sm font-bold uppercase tracking-wider text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
                    >
                      Continue Shopping
                    </Link>

                    <div className="mt-8 pt-6 border-t border-[#E5E5E5] grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 text-sm font-medium text-[#0A0A0A]/60">
                        <ShieldCheck className="size-5 text-[#0A0A0A]" /> Secure Checkout
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-[#0A0A0A]/60">
                        <Banknote className="size-5 text-[#0A0A0A]" /> Cash on Delivery Available
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-[#0A0A0A]/60">
                        <RotateCcw className="size-5 text-[#0A0A0A]" /> 7-Day Easy Returns
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
      <ConfirmDialog
        open={clearOpen}
        title="Clear your cart?"
        message={`Remove all ${items.length} item${items.length !== 1 ? "s" : ""} from your cart? This cannot be undone.`}
        confirmLabel="Clear"
        variant="danger"
        onConfirm={() => { clearCart(); setClearOpen(false) }}
        onCancel={() => setClearOpen(false)}
      />
    </>
  )
}

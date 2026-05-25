"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ShieldCheck, Banknote, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
        <div className="min-h-screen bg-[#F6F8FA]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-4xl">
                  Shopping Cart
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClearOpen(true)}
                className="text-muted-foreground hover:text-destructive self-start"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -40, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 40, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: easePremium }}
                    >
                      <div className="bg-white border border-neutral-200/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
                        <div className="p-4 sm:p-6">
                          <div className="flex gap-4 sm:gap-6">
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[16px] bg-[#F6F8FA]">
                              <Img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-between min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-card-foreground truncate">
                                    {item.name}
                                  </h3>
                                  {item.variantLabel && (
                                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                                      {item.variantLabel}
                                    </p>
                                  )}
                                  <p className="mt-1 text-sm font-bold text-primary">
                                    {formatPrice(item.price)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8 -mr-1 -mt-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center rounded-lg border border-border">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-r-none"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={item.quantity}
                                    readOnly
                                    className="flex w-10 items-center justify-center bg-transparent text-center text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-l-none"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <span className="text-base font-bold text-foreground">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-4">
                  <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
                    <div className="p-6 sm:p-8">
                      <h2 className="font-heading text-xl font-bold text-neutral-900 mb-6">
                        Order Summary
                      </h2>
                      <div className="space-y-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-card-foreground font-medium">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          {shippingFree ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/40 text-emerald-600 bg-emerald-50/50"
                            >
                              Free
                            </Badge>
                          ) : (
                            <span className="text-card-foreground font-medium">
                              {formatPrice(0)}
                            </span>
                          )}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${shippingProgress * 100}%` }}
                            transition={{ duration: 0.6, ease: easePremium }}
                          />
                        </div>
                        {!shippingFree && (
                          <p className="text-xs text-muted-foreground">
                            Add {formatPrice(shippingRemaining)} more for free shipping
                          </p>
                        )}
                        {shippingFree && (
                          <p className="text-xs text-emerald-600 font-medium">
                            You&apos;ve unlocked free shipping!
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                        Delivery within 3-5 business days across Pakistan
                      </div>

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-card-foreground">Total</span>
                        <span className="text-primary">{formatPrice(subtotal)}</span>
                      </div>

                      <Link href="/checkout" className="block mt-4">
                        <Button className="w-full h-[48px] text-base font-bold bg-neutral-950 hover:bg-neutral-800 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                          Proceed to Checkout
                        </Button>
                      </Link>

                      <Link
                        href="/products"
                        className="block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Continue Shopping
                      </Link>

                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure Checkout
                        </span>
                        <span className="flex items-center gap-1">
                          <Banknote className="h-3.5 w-3.5 text-primary" /> Cash on Delivery
                        </span>
                        <span className="flex items-center gap-1">
                          <RotateCcw className="h-3.5 w-3.5 text-primary" /> Easy Returns
                        </span>
                      </div>
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

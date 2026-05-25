"use client"

import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Minus, Plus, ShoppingBag, Truck, ShieldCheck, X, ArrowRight, Banknote } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { Img } from "@/lib/img"
import { formatPrice } from "@/lib/products"
import { cn } from "@/lib/utils"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FREE_SHIPPING_THRESHOLD = 3000

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const router = useRouter()
  const { items, removeItem, updateQuantity, getSubtotal, getItemCount } = useCart()
  const subtotal = getSubtotal()
  const count = getItemCount()
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col w-full sm:max-w-md gap-0 p-0 border-l border-neutral-200/60"
        style={{ background: "#FFFFFF" }}
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-neutral-200/60 px-5 py-4 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="size-4.5 text-neutral-900" strokeWidth={1.5} />
              <SheetTitle className="font-heading text-base font-bold text-neutral-900">
                Shopping Cart
              </SheetTitle>
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]">
                  {count}
                </span>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Free shipping progress */}
        {count > 0 && (
          <div className="shrink-0 px-5 py-3 bg-neutral-50/60 border-b border-neutral-200/40">
            {isFreeShipping ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <Truck className="size-3.5" strokeWidth={2} />
                You unlocked Free Delivery across Pakistan!
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-neutral-500">
                    <Truck className="size-3" strokeWidth={1.5} /> Free delivery in
                  </span>
                  <span className="font-semibold text-neutral-700">Rs. {freeShippingRemaining.toLocaleString()} more</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
                  <motion.div
                    className="h-full rounded-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-5 gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-neutral-200/60 shadow-sm">
              <ShoppingBag className="h-9 w-9 text-neutral-300" strokeWidth={1} />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-neutral-800">Your cart is empty</p>
              <p className="mt-1 text-sm text-neutral-400">Add some premium tech to get started.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="mt-2 flex items-center gap-2 h-[48px] px-6 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-bold transition-all shadow-sm"
              onClick={() => { onOpenChange(false); router.push("/products") }}
            >
              Browse Collection <ArrowRight className="size-4" strokeWidth={2} />
            </motion.button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 60, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="flex gap-3.5 rounded-xl border border-neutral-200/60 bg-white p-3.5 shadow-sm"
                  >
                    {/* Image */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/40">
                      <Img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">{item.name}</p>
                          {item.variantLabel && (
                            <p className="text-[11px] text-neutral-500 mt-0.5">{item.variantLabel}</p>
                          )}
                          <p className="mt-0.5 text-xs font-medium text-blue-600">{formatPrice(item.price)}</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-500 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <X className="h-3 w-3" strokeWidth={2} />
                        </motion.button>
                      </div>

                      {/* Qty + Line Total */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-neutral-200/60 bg-neutral-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-2.5 w-2.5" strokeWidth={2.5} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-neutral-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-2.5 w-2.5" strokeWidth={2.5} />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-neutral-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-neutral-200/60 bg-white/80 backdrop-blur-md px-5 pt-4 pb-6 space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Delivery</span>
                <span className={cn("font-semibold", isFreeShipping ? "text-emerald-600" : "text-neutral-900")}>
                  {isFreeShipping ? "FREE" : "Rs. 250"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/50">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="font-heading text-xl font-extrabold text-neutral-900">
                  {formatPrice(isFreeShipping ? subtotal : subtotal + 250)}
                </span>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full h-[48px] rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => { onOpenChange(false); router.push("/checkout") }}
              >
                Checkout — {formatPrice(isFreeShipping ? subtotal : subtotal + 250)}
                <ArrowRight className="size-4" strokeWidth={2} />
              </motion.button>

              <button
                onClick={() => { onOpenChange(false); router.push("/cart") }}
                className="w-full text-center text-xs text-neutral-500 hover:text-neutral-700 underline-offset-4 hover:underline transition-colors"
              >
                View Full Cart
              </button>

              {/* Trust Strip */}
              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" strokeWidth={1.5} /> Free Delivery</span>
                <span className="flex items-center gap-1"><Banknote className="h-3 w-3" strokeWidth={1.5} /> Cash on Delivery</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" strokeWidth={1.5} /> 7-Day Warranty</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingBag,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Banknote,
  Truck,
  Percent,
  Check,
  User,
  Phone,
  MapPin,
  Package,
} from "lucide-react"
import { PageMeta } from "@/components/PageMeta"
import { PageTransition } from "@/components/PageTransition"
import { useStore } from "@/lib/store"
import { useOrders } from "@/lib/orders-context"
import { formatPrice } from "@/lib/products"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const PAK_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Gujrat",
]

/* ─── Shared Design Tokens ─────────────────────────────────────── */
const LABEL_CLASS =
  "text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-1.5 block"

const INPUT_CLASS =
  "h-[48px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-200"

const MOTION_PROPS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

export default function CheckoutPage() {
  const store = useStore()
  const { addOrder } = useOrders()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const cartItems = store.cart
  const couponCode = store.couponCode
  const appliedDiscount = store.appliedDiscount

  const [name, setName] = useState(store.checkoutForm.fullName)
  const [phone, setPhone] = useState(store.checkoutForm.phone)
  const [address, setAddress] = useState(store.checkoutForm.address)
  const [city, setCity] = useState(store.checkoutForm.city || "Lahore")

  const [promoInput, setPromoInput] = useState("")
  const [couponApplied, setCouponApplied] = useState(!!couponCode)
  const [loading, setLoading] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const subtotal = store.getSubtotal()
  const discountAmount = store.getDiscountAmount()
  const shipping = store.getDeliveryFee()
  const total = store.getTotal()

  async function handlePromoApply(e: React.FormEvent) {
    e.preventDefault()
    if (!promoInput.trim()) return
    const success = await store.applyCoupon(promoInput)
    if (success) {
      setCouponApplied(true)
      toast.success("Coupon code applied successfully!")
    } else {
      toast.error("Invalid coupon code.")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !phone.trim() || !address.trim() || !city) {
      toast.error("Zaroori khane pur karein (Please fill required fields)")
      return
    }

    const phoneClean = phone.trim().replace(/[-\s]/g, "")
    const phoneRegex = /^(03\d{9}|\+923\d{9}|923\d{9})$/
    if (!phoneRegex.test(phoneClean)) {
      toast.error("Durust Pakistani phone number likhein (e.g., 03211234567)")
      return
    }

    setLoading(true)
    store.updateCheckoutForm({ fullName: name.trim(), phone: phone.trim(), address: address.trim(), city, notes: "" })

    try {
      const orderPromises = cartItems.map((item) =>
        fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.id,
            productName: item.name,
            productPrice: item.price,
            productImage: item.image,
            quantity: item.quantity,
            total: item.price * item.quantity,
            customerName: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city,
          }),
        }).then((res) => {
          if (!res.ok) throw new Error(`Order failed: ${res.status}`)
          return res.json()
        })
      )
      const serverOrders = await Promise.all(orderPromises)
      for (const order of serverOrders) {
        addOrder(order)
      }
      setLoading(false)
      setSuccessOpen(true)
      store.clearCart()
    } catch (err) {
      console.error("Order submission failed:", err)
      toast.error("Failed to place order. The server rejected the request.")
      setLoading(false)
    }
  }

  /* ─── Empty Cart State ──────────────────────────────────────── */
  if (cartItems.length === 0 && !successOpen) {
    return (
      <>
        <PageMeta title="Checkout" description="Complete your order." />
        <PageTransition>
          <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FAFAFA] px-4">
            <motion.div {...MOTION_PROPS} className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white border border-[#E5E5E5] shadow-sm">
                <ShoppingBag className="h-10 w-10 text-[#0A0A0A]/40" strokeWidth={1} />
              </div>
              <h2 className="text-xl font-bold text-[#0A0A0A]">Your cart is empty</h2>
              <p className="text-sm text-[#0A0A0A]/60 max-w-xs">Add items to your cart to place an order.</p>
              <Link href="/products">
                <button className="mt-4 h-[48px] w-full bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide px-8">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </button>
              </Link>
            </motion.div>
          </div>
        </PageTransition>
      </>
    )
  }

  /* ─── Main Checkout ─────────────────────────────────────────── */
  return (
    <>
      <PageMeta
        title="COD Checkout — SMARTWEAR"
        description="Complete your Cash on Delivery order instantly."
      />
      <PageTransition>
        <div className="min-h-screen bg-[#FAFAFA]">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 sm:py-12">

            {/* Back */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>

            {/* Page Header */}
            <motion.div {...MOTION_PROPS} className="mt-8 mb-12">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Cash On Delivery Available
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-[#0A0A0A] sm:text-5xl">
                Checkout
              </h1>
              <p className="mt-2 text-sm font-medium text-[#0A0A0A]/60">
                Pehle check karein, phir pay karein. No registration required!
              </p>
            </motion.div>

            {/* Grid */}
            <div className="grid gap-8 lg:grid-cols-12 items-start xl:gap-16">

              {/* ── Left Column: Form ──────────────────────────── */}
              <motion.div
                {...MOTION_PROPS}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="lg:col-span-7 xl:col-span-8 space-y-6"
              >
                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden p-6 sm:p-8">
                  {/* Card Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F0F0]">
                      <User className="h-5 w-5 text-[#0A0A0A]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#0A0A0A]">Delivery Information</h2>
                      <p className="text-sm font-medium text-[#0A0A0A]/60">Ghar ka pata darj karein</p>
                    </div>
                  </div>

                  <div>
                    <form onSubmit={handleSubmit} className="space-y-6" id="checkout-form" noValidate>

                      {/* Full Name */}
                      <div>
                        <label htmlFor="checkout-name" className={LABEL_CLASS}>
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0A0A]/40 pointer-events-none" strokeWidth={1.5} />
                          <input
                            id="checkout-name"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            placeholder="Apna Poora Naam Likhein (e.g. Abdullah Khan)"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value)
                              store.updateCheckoutForm({ fullName: e.target.value })
                            }}
                            required
                            className={`${INPUT_CLASS} pl-11`}
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="checkout-phone" className={LABEL_CLASS}>
                          WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0A0A]/40 pointer-events-none" strokeWidth={1.5} />
                          <input
                            id="checkout-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            inputMode="tel"
                            placeholder="03XX-XXXXXXX"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value)
                              store.updateCheckoutForm({ phone: e.target.value })
                            }}
                            required
                            className={`${INPUT_CLASS} pl-11`}
                          />
                        </div>
                        <p className="mt-2 text-xs font-medium text-[#0A0A0A]/40">
                          Hum deliver karne se pehle is number pe call kar ke confirm karein ge.
                        </p>
                      </div>

                      {/* City */}
                      <div>
                        <label htmlFor="checkout-city" className={LABEL_CLASS}>
                          City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0A0A]/40 pointer-events-none z-10" strokeWidth={1.5} />
                          <select
                            id="checkout-city"
                            value={city}
                            onChange={(e) => {
                              if (e.target.value) {
                                setCity(e.target.value)
                                store.updateCheckoutForm({ city: e.target.value })
                              }
                            }}
                            className={`${INPUT_CLASS} pl-11 appearance-none cursor-pointer pr-10`}
                          >
                            <option value="">Apna Shehar Muntakhib Karein</option>
                            {PAK_CITIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="size-4 text-[#0A0A0A]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label htmlFor="checkout-address" className={LABEL_CLASS}>
                          Full Delivery Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 h-4 w-4 text-[#0A0A0A]/40 pointer-events-none" strokeWidth={1.5} />
                          <textarea
                            id="checkout-address"
                            name="address"
                            autoComplete="street-address"
                            placeholder="Ghar ka address, Gali, Area detail likhein"
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value)
                              store.updateCheckoutForm({ address: e.target.value })
                            }}
                            required
                            rows={4}
                            className="w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-200 resize-none"
                          />
                        </div>
                      </div>

                      {/* ── Primary CTA ── */}
                      <div className="pt-4 space-y-6">
                        <button
                          type="submit"
                          disabled={loading}
                          className="h-[56px] w-full bg-[#0A0A0A] hover:scale-[1.02] text-white font-bold rounded-full transition-all duration-200 flex items-center justify-center text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Order Confirm Ho Raha Hai...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Order Confirm Karein — Pay on Delivery
                            </>
                          )}
                        </button>

                        {/* ── Trust Indicators (directly below CTA) ── */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-[#0A0A0A]/60">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                            <Truck className="size-4" strokeWidth={2} />
                            Free Delivery
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                            <Package className="size-4" strokeWidth={2} />
                            Cash on Delivery
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                            <ShieldCheck className="size-4" strokeWidth={2} />
                            7-Day Warranty
                          </span>
                        </div>
                      </div>

                    </form>
                  </div>
                </div>
              </motion.div>

              {/* ── Right Column: Order Summary ─────────────────── */}
              <motion.div
                {...MOTION_PROPS}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="lg:col-span-5 xl:col-span-4 space-y-4"
              >
                <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden sticky top-24 p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F0F0]">
                      <ShoppingBag className="h-5 w-5 text-[#0A0A0A]" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-[#0A0A0A]">Order Summary</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Item list */}
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 truncate">
                            <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#F0F0F0]">
                              <img src={item.image} alt={item.name} className="size-full object-cover mix-blend-multiply" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#0A0A0A]">{item.name}</p>
                              <p className="text-xs font-medium text-[#0A0A0A]/60 mt-1">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-[#0A0A0A]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-[#E5E5E5] w-full" />

                    {/* Coupon */}
                    <form onSubmit={handlePromoApply} className="flex gap-2">
                      <div className="relative flex-1">
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0A0A0A]/40 pointer-events-none" strokeWidth={1.5} />
                        <input
                          placeholder="Coupon Code"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="h-[48px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl pl-11 pr-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-200"
                        />
                      </div>
                      <button
                        type="submit"
                        className="h-[48px] px-6 bg-[#0A0A0A] text-white font-bold uppercase tracking-wider rounded-2xl transition-transform hover:scale-[1.02] flex items-center justify-center text-xs"
                      >
                        Apply
                      </button>
                    </form>

                    {couponApplied && (
                      <div className="flex items-center gap-2 text-sm font-bold text-[#10B981] bg-[#10B981]/10 px-4 py-3 rounded-2xl">
                        <Check className="h-4 w-4" />
                        <span>Discount applied: {appliedDiscount}% off!</span>
                      </div>
                    )}

                    <div className="h-px bg-[#E5E5E5] w-full" />

                    {/* Price Breakdown */}
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between">
                        <span className="font-medium text-[#0A0A0A]/60">Subtotal</span>
                        <span className="font-bold text-[#0A0A0A]">{formatPrice(subtotal)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-[#10B981]">
                          <span className="font-bold">Coupon Discount</span>
                          <span className="font-bold">-{formatPrice(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="font-medium text-[#0A0A0A]/60">Delivery Charges</span>
                        {shipping === 0 ? (
                          <span className="text-sm font-bold text-[#10B981] uppercase tracking-wider">
                            Free
                          </span>
                        ) : (
                          <span className="font-bold text-[#0A0A0A]">{formatPrice(shipping)}</span>
                        )}
                      </div>

                      {shipping > 0 && (
                        <p className="text-xs font-medium text-[#0A0A0A]/60">
                          Add <strong className="text-[#0A0A0A]">{formatPrice(2500 - subtotal)}</strong> more for FREE Delivery!
                        </p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-[#E5E5E5]">
                      {/* Total */}
                      <div className="flex justify-between items-end">
                        <span className="text-lg font-bold text-[#0A0A0A]">Total Amount</span>
                        <span className="text-3xl font-extrabold text-[#0A0A0A]">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    {/* Security badge */}
                    <div className="flex items-center justify-center gap-3 bg-[#F0F0F0] rounded-2xl p-4 text-xs font-bold text-[#0A0A0A]/60">
                      <ShieldCheck className="h-5 w-5 text-[#0A0A0A]" strokeWidth={1.5} />
                      <span>100% Secure Checkout. Quality Guaranteed.</span>
                    </div>

                    {/* Secondary CTA — place order from summary panel too */}
                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={loading}
                      className="h-[56px] w-full bg-[#0A0A0A] hover:scale-[1.02] text-white font-bold rounded-full transition-transform flex items-center justify-center text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Banknote className="h-5 w-5 mr-2" strokeWidth={1.5} />
                      Confirm — Pay on Delivery
                    </button>

                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ── Success Dialog ──────────────────────────────── */}
          <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
            <DialogContent className="sm:max-w-md bg-white border border-[#E5E5E5] rounded-3xl shadow-xl p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <DialogHeader>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]/10"
                  >
                    <CheckCircle2 className="h-10 w-10 text-[#10B981]" strokeWidth={2} />
                  </motion.div>
                  <DialogTitle className="text-center text-3xl font-bold text-[#0A0A0A]">
                    Order Placed! 🎉
                  </DialogTitle>
                  <DialogDescription className="text-center text-[#0A0A0A]/60 text-base font-medium mt-4 leading-relaxed">
                    Aap ka order confirm ho chuka hai. Hum jald hi call kar ke confirmation karein ge. Delivery 2 se 4 din me mile gi.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    className="h-[56px] w-full bg-[#0A0A0A] text-white font-bold uppercase tracking-widest rounded-full transition-transform hover:scale-[1.02] flex items-center justify-center text-sm"
                    onClick={() => {
                      setSuccessOpen(false)
                      startTransition(() => router.push("/products"))
                    }}
                  >
                    Shopping Jari Rakhein
                  </button>
                  <button
                    className="h-[56px] w-full bg-[#F0F0F0] hover:bg-[#E5E5E5] text-[#0A0A0A] font-bold uppercase tracking-widest rounded-full transition-colors flex items-center justify-center text-sm"
                    onClick={() => {
                      setSuccessOpen(false)
                      startTransition(() => router.push("/"))
                    }}
                  >
                    Back to Home
                  </button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>

        </div>
      </PageTransition>
    </>
  )
}

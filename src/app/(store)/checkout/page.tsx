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
import { Separator } from "@/components/ui/separator"

const PAK_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Gujrat",
]

/* ─── Shared Design Tokens ─────────────────────────────────────── */
const LABEL_CLASS =
  "text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block"

const INPUT_CLASS =
  "h-[48px] w-full bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150"

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

  function handlePromoApply(e: React.FormEvent) {
    e.preventDefault()
    if (!promoInput.trim()) return
    const success = store.applyCoupon(promoInput)
    if (success) {
      setCouponApplied(true)
      toast.success("Coupon code applied successfully!")
    } else {
      toast.error("Invalid coupon code. Try 'SMART20' or 'LUMS25'")
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
    await new Promise((r) => setTimeout(r, 1200))

    try {
      for (const item of cartItems) {
        addOrder({
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
        })
      }
      setLoading(false)
      setSuccessOpen(true)
      store.clearCart()
    } catch {
      toast.error("Failed to place order. Please try again.")
      setLoading(false)
    }
  }

  /* ─── Empty Cart State ──────────────────────────────────────── */
  if (cartItems.length === 0 && !successOpen) {
    return (
      <>
        <PageMeta title="Checkout" description="Complete your order." />
        <PageTransition>
          <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F6F8FA] px-4">
            <motion.div {...MOTION_PROPS} className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-neutral-200/60 shadow-sm">
                <ShoppingBag className="h-10 w-10 text-neutral-300" strokeWidth={1} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">Aap ka cart khali hai</h2>
              <p className="text-sm text-neutral-500 max-w-xs">Order place karne ke liye pehle items add karein.</p>
              <Link href="/products">
                <button className="mt-4 h-[48px] w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-8">
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
        <div className="min-h-screen bg-[#F6F8FA]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

            {/* Back */}
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>

            {/* Page Header */}
            <motion.div {...MOTION_PROPS} className="mt-6 mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cash On Delivery Available
              </span>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                One-Click COD Checkout
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Pehle check karein, phir pay karein. No registration required!
              </p>
              <div className="mt-3 h-0.5 w-16 rounded-full bg-neutral-900" />
            </motion.div>

            {/* Grid */}
            <div className="grid gap-6 lg:grid-cols-12 items-start">

              {/* ── Left Column: Form ──────────────────────────── */}
              <motion.div
                {...MOTION_PROPS}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="lg:col-span-7 space-y-6"
              >
                <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200/60">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 border border-neutral-200/60">
                      <User className="h-4.5 w-4.5 text-neutral-700" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-neutral-900">Delivery Information</h2>
                      <p className="text-[11px] text-neutral-500">Ghar ka pata darj karein</p>
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <form onSubmit={handleSubmit} className="space-y-4" id="checkout-form" noValidate>

                      {/* Full Name */}
                      <div>
                        <label htmlFor="checkout-name" className={LABEL_CLASS}>
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" strokeWidth={1.5} />
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
                            className={`${INPUT_CLASS} pl-10`}
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="checkout-phone" className={LABEL_CLASS}>
                          WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" strokeWidth={1.5} />
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
                            className={`${INPUT_CLASS} pl-10`}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Hum deliver karne se pehle is number pe call kar ke confirm karein ge.
                        </p>
                      </div>

                      {/* City */}
                      <div>
                        <label htmlFor="checkout-city" className={LABEL_CLASS}>
                          City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none z-10" strokeWidth={1.5} />
                          <select
                            id="checkout-city"
                            value={city}
                            onChange={(e) => {
                              if (e.target.value) {
                                setCity(e.target.value)
                                store.updateCheckoutForm({ city: e.target.value })
                              }
                            }}
                            className={`${INPUT_CLASS} pl-10 appearance-none cursor-pointer`}
                          >
                            <option value="">Apna Shehar Muntakhib Karein</option>
                            {PAK_CITIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="size-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                          <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" strokeWidth={1.5} />
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
                            rows={3}
                            className="w-full bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150 resize-none"
                          />
                        </div>
                      </div>

                      {/* ── Primary CTA ── */}
                      <div className="pt-2 space-y-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="h-[48px] w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed"
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
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                            <Truck className="size-3.5" strokeWidth={2} />
                            Free Delivery Across Pakistan
                          </span>
                          <span className="text-neutral-200">·</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                            <Package className="size-3.5" strokeWidth={2} />
                            Cash on Delivery
                          </span>
                          <span className="text-neutral-200">·</span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                            <ShieldCheck className="size-3.5" strokeWidth={2} />
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
                className="lg:col-span-5 space-y-4"
              >
                <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200/60">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 border border-neutral-200/60">
                      <ShoppingBag className="h-4.5 w-4.5 text-neutral-700" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-base font-bold text-neutral-900">Order Summary</h2>
                  </div>

                  <div className="px-6 py-5 space-y-4">
                    {/* Item list */}
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200/60"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/40">
                              <img src={item.image} alt={item.name} className="size-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-neutral-900">{item.name}</p>
                              <p className="text-xs text-neutral-500 mt-0.5">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-neutral-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-neutral-200/60" />

                    {/* Coupon */}
                    <form onSubmit={handlePromoApply} className="flex gap-2">
                      <div className="relative flex-1">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" strokeWidth={1.5} />
                        <input
                          placeholder="Coupon Code (e.g. SMART20)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="h-[48px] w-full bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl pl-9 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150"
                        />
                      </div>
                      <button
                        type="submit"
                        className="h-[48px] px-4 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold rounded-2xl transition-all duration-150 flex items-center justify-center text-sm"
                      >
                        Apply
                      </button>
                    </form>

                    {couponApplied && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                        <Check className="h-4 w-4" />
                        <span>Discount applied: {appliedDiscount}% off!</span>
                      </div>
                    )}

                    <Separator className="bg-neutral-200/60" />

                    {/* Price Breakdown */}
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Subtotal</span>
                        <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Coupon Discount</span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Delivery Charges</span>
                        {shipping === 0 ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                            <Truck className="size-3.5" strokeWidth={2} />
                            FREE Delivery
                          </span>
                        ) : (
                          <span className="font-medium text-neutral-900">{formatPrice(shipping)}</span>
                        )}
                      </div>

                      {shipping > 0 && (
                        <p className="text-[11px] text-neutral-400 bg-neutral-50 border border-neutral-200/60 p-2 rounded-lg">
                          Add <strong className="text-neutral-700">{formatPrice(2500 - subtotal)}</strong> more for FREE Delivery!
                        </p>
                      )}
                    </div>

                    <Separator className="bg-neutral-200/60" />

                    {/* Total */}
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-neutral-900">Total Amount</span>
                      <span className="font-heading text-2xl font-extrabold text-neutral-900">
                        {formatPrice(total)}
                      </span>
                    </div>

                    {/* Security badge */}
                    <div className="flex items-center justify-center gap-2 bg-neutral-50 border border-neutral-200/60 rounded-xl p-3 text-xs text-neutral-500">
                      <ShieldCheck className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
                      <span>100% Secure Checkout. Quality Guaranteed.</span>
                    </div>

                    {/* Secondary CTA — place order from summary panel too */}
                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={loading}
                      className="h-[48px] w-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold rounded-full transition-all duration-150 flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Banknote className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Confirm — Pay on Delivery
                    </button>

                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ── Success Dialog ──────────────────────────────── */}
          <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
            <DialogContent className="sm:max-w-md bg-white border border-neutral-200/60 rounded-3xl shadow-[0_20px_60px_-12px_rgb(0,0,0,0.12)]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <DialogHeader>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200"
                  >
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" strokeWidth={1.5} />
                  </motion.div>
                  <DialogTitle className="text-center text-2xl font-extrabold text-neutral-900 font-heading">
                    Order Placed! 🎉
                  </DialogTitle>
                  <DialogDescription className="text-center text-neutral-500 text-sm mt-2">
                    Aap ka order confirm ho chuka hai. Hum jald hi call kar ke confirmation karein ge. Delivery 2 se 4 din me mile gi.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    className="h-[48px] w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-sm"
                    onClick={() => {
                      setSuccessOpen(false)
                      startTransition(() => router.push("/products"))
                    }}
                  >
                    Shopping Jari Rakhein
                  </button>
                  <button
                    className="h-[48px] w-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-semibold rounded-2xl transition-all duration-150 flex items-center justify-center text-sm"
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

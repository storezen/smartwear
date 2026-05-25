"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Banknote, MapPin, Phone, User, CheckCircle2, Loader2, Truck, ShieldCheck, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useOrders } from "@/lib/orders-context"
import { formatPrice, type Product } from "@/lib/products"
import { toast } from "sonner"

interface CODOrderModalProps {
  product: Product
  initialQuantity?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAKISTANI_CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Larkana",
  "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan",
  "Gujrat", "Sahiwal", "Wah Cantt", "Mardan",
]

type FormState = { fullName: string; phone: string; city: string; address: string }
type Status = "idle" | "submitting" | "success"

/* ─── Shared Design Tokens ───────────────────────────────────────── */
const LABEL_CLASS =
  "text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block"

const INPUT_CLASS =
  "h-[48px] w-full bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150"

const INPUT_ERROR_CLASS =
  "h-[48px] w-full bg-neutral-50 border border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 rounded-xl px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150"

const MOTION_PROPS = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
}

export function CODOrderModal({ product, initialQuantity = 1, open, onOpenChange }: CODOrderModalProps) {
  const { addOrder } = useOrders()
  const [form, setForm] = useState<FormState>({ fullName: "", phone: "", city: "Lahore", address: "" })
  const [status, setStatus] = useState<Status>("idle")
  const [errors, setErrors] = useState<Partial<FormState>>({})

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<FormState> = {}
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = "Pura naam darj karein"
    const phoneRegex = /^(\+92|0092|03)\d{9,10}$/
    if (!phoneRegex.test(form.phone.replace(/[-\s]/g, ""))) e.phone = "Valid Pakistani number darj karein (e.g. 03XX-XXXXXXX)"
    if (!form.city) e.city = "City select karein"
    if (!form.address.trim() || form.address.trim().length < 6) e.address = "Pura ghar ka pata darj karein"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setStatus("submitting")
    await new Promise(r => setTimeout(r, 900))

    const total = product.price * initialQuantity

    addOrder({
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      quantity: initialQuantity,
      total,
      customerName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city,
    })

    toast.success(`Order placed! ${formatPrice(total)} — Pay on delivery.`)
    setStatus("success")
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(() => {
      setStatus("idle")
      setForm({ fullName: "", phone: "", city: "Lahore", address: "" })
      setErrors({})
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md p-0 gap-0 overflow-hidden border border-neutral-200/60 rounded-3xl bg-white shadow-[0_20px_60px_-12px_rgb(0,0,0,0.12)]"
      >
        <AnimatePresence mode="wait">
          {status === "success" ? (
            /* ─── Success State ─── */
            <motion.div
              key="success"
              {...MOTION_PROPS}
              className="flex flex-col items-center text-center px-8 py-12"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-2xl scale-150" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="size-10 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="font-heading text-2xl font-extrabold text-neutral-900 tracking-tight">
                Shukriya! 🎉
              </h2>
              <p className="mt-2 text-sm text-neutral-500 max-w-xs">
                Aapka COD order place ho gaya. Delivery agent jald hi contact karega.
              </p>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-700 font-semibold">
                Total: {formatPrice(product.price * initialQuantity)} — Pay on Delivery
              </div>
              <div className="mt-5 space-y-2 text-[12px] text-neutral-500">
                <div>🚚 Free Delivery Across Pakistan</div>
                <div>📦 Cash on Delivery — Ghar pe paise dein</div>
                <div>🛡️ 7-Day Replacement Warranty</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="mt-8 h-[48px] w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-sm"
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          ) : (
            /* ─── Order Form ─── */
            <motion.div
              key="form"
              {...MOTION_PROPS}
            >
              {/* Header */}
              <DialogHeader className="border-b border-neutral-200/60 px-6 py-4 bg-neutral-50/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 border border-neutral-200/60">
                    <Banknote className="size-4.5 text-neutral-700" strokeWidth={1.5} />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-neutral-900">Cash on Delivery</DialogTitle>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Pehle dekhein, phir paise dein</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="px-6 py-5 space-y-4">
                {/* Product Preview */}
                <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/60 bg-neutral-50 p-3.5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/40">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900 truncate">{product.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Qty: {initialQuantity}</p>
                    <p className="text-base font-extrabold text-neutral-900 mt-1">{formatPrice(product.price * initialQuantity)}</p>
                  </div>
                </div>

                {/* Form — 4 Fields Only */}
                <form id="cod-form" onSubmit={handleSubmit} className="space-y-3" noValidate>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="cod-name" className={LABEL_CLASS}>
                      Pura Naam *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="cod-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Muhammad Ali"
                        value={form.fullName}
                        onChange={e => set("fullName", e.target.value)}
                        className={`${errors.fullName ? INPUT_ERROR_CLASS : INPUT_CLASS} pl-10`}
                      />
                    </div>
                    {errors.fullName && <p className="mt-1 text-[11px] text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* WhatsApp / Phone */}
                  <div>
                    <label htmlFor="cod-phone" className={LABEL_CLASS}>
                      WhatsApp / Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" strokeWidth={1.5} />
                      <input
                        id="cod-phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="03XX-XXXXXXX"
                        value={form.phone}
                        onChange={e => set("phone", e.target.value)}
                        className={`${errors.phone ? INPUT_ERROR_CLASS : INPUT_CLASS} pl-10`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
                  </div>

                  {/* City Dropdown */}
                  <div>
                    <label htmlFor="cod-city" className={LABEL_CLASS}>
                      Shehar (City) *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none z-10" strokeWidth={1.5} />
                      <select
                        id="cod-city"
                        value={form.city}
                        onChange={e => set("city", e.target.value)}
                        className={`${errors.city ? INPUT_ERROR_CLASS : INPUT_CLASS} pl-10 appearance-none cursor-pointer`}
                      >
                        {PAKISTANI_CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="size-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.city && <p className="mt-1 text-[11px] text-red-500">{errors.city}</p>}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label htmlFor="cod-address" className={LABEL_CLASS}>
                      Ghar ka Pata *
                    </label>
                    <textarea
                      id="cod-address"
                      autoComplete="street-address"
                      placeholder="House #, Street, Mohalla, Area..."
                      rows={2}
                      value={form.address}
                      onChange={e => set("address", e.target.value)}
                      className={`w-full bg-neutral-50 border ${errors.address ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : "border-neutral-200 focus:border-blue-500 focus:ring-blue-500/10"} focus:ring-2 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150 resize-none`}
                    />
                    {errors.address && <p className="mt-1 text-[11px] text-red-500">{errors.address}</p>}
                  </div>
                </form>

                {/* Submit CTA */}
                <motion.button
                  type="submit"
                  form="cod-form"
                  whileTap={{ scale: 0.98 }}
                  disabled={status === "submitting"}
                  className="h-[48px] w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" strokeWidth={2} />
                      Order Place Ho Raha Hai...
                    </>
                  ) : (
                    <>
                      <Banknote className="size-4 mr-2" strokeWidth={2} />
                      Order Lagao — {formatPrice(product.price * initialQuantity)}
                    </>
                  )}
                </motion.button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Truck className="size-3" strokeWidth={1.5} />
                    Free Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="size-3" strokeWidth={1.5} />
                    Cash on Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3" strokeWidth={1.5} />
                    7-Day Warranty
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

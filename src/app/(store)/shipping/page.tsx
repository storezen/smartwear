"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import { Truck, Clock, MapPin, Banknote, Package, ShieldCheck, RotateCcw } from "lucide-react"

const policies = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "We offer free shipping on all orders across Pakistan. No minimum purchase required.",
  },
  {
    icon: Clock,
    title: "Delivery Timeline",
    desc: "Orders are delivered within 3–5 business days. Remote areas may take 5–7 business days.",
  },
  {
    icon: MapPin,
    title: "Coverage Area",
    desc: "We ship to all cities and towns across Pakistan, including AJK and Gilgit-Baltistan.",
  },
  {
    icon: Banknote,
    title: "Cash on Delivery",
    desc: "Pay in cash when your order arrives. No advance payment or credit card needed.",
  },
]

export default function ShippingPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="Shipping" description="SMARTWEAR shipping information — fast delivery across Pakistan with free shipping on orders over Rs. 3,000." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <Truck className="h-6 w-6 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-2">Shipping</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05]">Shipping information</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-[#0A0A0A]" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[#0A0A0A]/60">
                We make delivery simple and transparent. Here is everything you need to know about how we ship your orders.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {policies.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] group-hover:bg-[#F0F0F0] group-hover:border-[#0A0A0A] transition-colors">
                    <Icon className="h-5.5 w-5.5 text-[#0A0A0A]/60 group-hover:text-[#0A0A0A] transition-colors" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-bold text-[#0A0A0A] mt-5">{p.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#0A0A0A]/60">{p.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-start gap-5 px-8 py-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5]">
              <Package className="h-5.5 w-5.5 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A0A0A]">Order tracking</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#0A0A0A]/60">
                Once your order is dispatched, you will receive a tracking link via WhatsApp or SMS. You can also track your order directly from your account dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-[#E5E5E5] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-[#0A0A0A]/60">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 1-Year Warranty</span>
            <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 7-Day Returns</span>
            <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Cash on Delivery</span>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import { ShieldCheck, Clock, Wrench, FileText, Banknote, RotateCcw, Truck } from "lucide-react"

const items = [
  {
    icon: ShieldCheck,
    title: "1-Year Coverage",
    desc: "All SMARTWEAR products come with a 1-year manufacturer warranty covering manufacturing defects.",
  },
  {
    icon: Clock,
    title: "What Is Covered",
    desc: "Battery failure, charging issues, display defects, sensor malfunctions, and Bluetooth connectivity faults.",
  },
  {
    icon: Wrench,
    title: "What Is Not Covered",
    desc: "Physical damage, water damage beyond the rated IP level, unauthorized repairs, and normal wear and tear.",
  },
  {
    icon: FileText,
    title: "How to Claim",
    desc: "Contact us with your order number and a description of the issue. We will guide you through the process.",
  },
]

export default function WarrantyPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="Warranty" description="SMARTWEAR warranty information — every product is built to last with 1-year coverage." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <ShieldCheck className="h-6 w-6 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-2">Warranty</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05]">Warranty information</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-[#0A0A0A]" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[#0A0A0A]/60">
                Every product we sell is built to last. Here is how our warranty works and what to do if you run into an issue.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] group-hover:bg-[#F0F0F0] group-hover:border-[#0A0A0A] transition-colors">
                    <Icon className="h-5.5 w-5.5 text-[#0A0A0A]/60 group-hover:text-[#0A0A0A] transition-colors" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-bold text-[#0A0A0A] mt-5">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#0A0A0A]/60">{item.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-[#E5E5E5] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-[#0A0A0A]/60">
            <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 7-Day Returns</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Free Shipping</span>
            <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Cash on Delivery</span>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import Link from "next/link"
import { ShieldCheck, Banknote, Truck, Headphones, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

const values = [
  {
    icon: ShieldCheck,
    title: "Trust First",
    desc: "Every product is tested and backed by a manufacturer warranty. We only sell what we would use ourselves.",
  },
  {
    icon: Banknote,
    title: "Fair Pricing",
    desc: "No inflated markups. We price smart gadgets at what they are worth — no games, no gimmicks.",
  },
  {
    icon: Truck,
    title: "Pan-Pakistan Delivery",
    desc: "From Karachi to Gilgit, we ship to every corner of the country. Free shipping on all orders.",
  },
  {
    icon: Headphones,
    title: "Real Support",
    desc: "Not a bot. Not a ticket system. Real people who answer your questions and stand behind every sale.",
  },
]

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="About" description="Learn about SMARTWEAR — your destination for premium smart watches and accessories. Quality, innovation, and trust since 2024." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <ShieldCheck className="h-6 w-6 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-2">What We Stand For</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05]">Our values</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-[#0A0A0A]" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[#0A0A0A]/60">
                Every decision we make is guided by these four principles.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] group-hover:bg-[#F0F0F0] group-hover:border-[#0A0A0A] transition-colors">
                    <Icon className="h-5.5 w-5.5 text-[#0A0A0A]/60 group-hover:text-[#0A0A0A] transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0A0A0A] mt-5">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#0A0A0A]/60">{v.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-[#E5E5E5] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-[#0A0A0A]/60">
            <div className="flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 1-Year Warranty</span>
              <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 7-Day Returns</span>
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Free Shipping</span>
              <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Cash on Delivery</span>
            </div>
            <Link href="/contact">
              <button className="h-[48px] bg-[#0A0A0A] hover:scale-[1.02] text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-8">
                Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

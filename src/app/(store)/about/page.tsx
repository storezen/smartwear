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

      <div className="min-h-screen bg-[#F6F8FA]">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-white border border-neutral-200/60 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-neutral-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">What We Stand For</p>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl leading-[1.05]">Our values</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-neutral-900" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-neutral-500">
                Every decision we make is guided by these four principles.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-neutral-50 border border-neutral-200/60 group-hover:bg-blue-50 group-hover:border-blue-500/30 transition-colors">
                    <Icon className="h-5.5 w-5.5 text-neutral-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mt-5">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{v.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-[24px] border border-neutral-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-neutral-500">
            <div className="flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" strokeWidth={2} /> 1-Year Warranty</span>
              <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-emerald-500" strokeWidth={2} /> 7-Day Returns</span>
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-500" strokeWidth={2} /> Free Shipping</span>
              <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-emerald-500" strokeWidth={2} /> Cash on Delivery</span>
            </div>
            <Link href="/contact">
              <button className="h-[48px] bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-8">
                Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

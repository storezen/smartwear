"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import { RotateCcw, Clock, CheckCircle2, Ban, MessageCircle, ShieldCheck, Banknote, Truck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const policies = [
  {
    icon: RotateCcw,
    title: "7-Day Return Window",
    desc: "You can return any product within 7 days of delivery. The item must be unused and in its original packaging.",
  },
  {
    icon: CheckCircle2,
    title: "Full Refund",
    desc: "Once we receive and inspect the returned item, we process your refund within 24–48 hours.",
  },
  {
    icon: Clock,
    title: "Easy Process",
    desc: "Contact us on WhatsApp or email, and we will guide you through the return. We arrange the pickup.",
  },
  {
    icon: Ban,
    title: "Non-Returnable Items",
    desc: "Screen protectors and hygiene-related products (ear tips, straps) cannot be returned once opened.",
  },
]

export default function ReturnsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="Returns & Refunds" description="SMARTWEAR return policy — easy 7-day returns and exchanges. Shop with confidence." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <RotateCcw className="h-6 w-6 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-2">Returns</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05]">Returns &amp; refunds</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-[#0A0A0A]" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[#0A0A0A]/60">
                We want you to be completely satisfied. If something is not right, we will make it right.
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

          <div className="mt-8 bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-6 px-8 py-8">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5]">
                <MessageCircle className="h-5.5 w-5.5 text-[#0A0A0A]/60" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A0A0A]">Need to start a return?</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#0A0A0A]/60">
                  Reach out to us on WhatsApp or email with your order number. We will take it from there.
                </p>
              </div>
            </div>
            <Link href="/contact" className="shrink-0">
              <button className="h-[48px] bg-[#F0F0F0] hover:bg-neutral-200/80 text-neutral-800 font-semibold rounded-full transition-all duration-150 flex items-center justify-center text-sm px-8">
                Contact Us
              </button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-[#E5E5E5] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-[#0A0A0A]/60">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 1-Year Warranty</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Free Shipping</span>
            <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Cash on Delivery</span>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

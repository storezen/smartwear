"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import { Shield, ShieldCheck, Banknote, RotateCcw, Truck } from "lucide-react"

const sections = [
  {
    title: "Information we collect",
    content:
      "We collect only the information you provide when placing an order: your name, phone number, shipping address, and email address. We do not collect or store payment information — all COD transactions are handled at the time of delivery.",
  },
  {
    title: "How we use your information",
    content:
      "Your information is used solely to process and deliver your orders, communicate order updates via WhatsApp or SMS, and provide customer support. We do not sell, rent, or share your personal data with third parties.",
  },
  {
    title: "Data retention",
    content:
      "We retain your order data for as long as necessary to fulfill orders and comply with legal obligations. You may request deletion of your data at any time by contacting us.",
  },
  {
    title: "Your rights",
    content:
      "You have the right to access, correct, or delete your personal data at any time. To make a request, simply reach out to us via WhatsApp or email, and we will respond within 48 hours.",
  },
  {
    title: "Updates",
    content:
      "This policy may be updated from time to time. Any changes will be posted on this page with an updated effective date.",
    meta: "Last updated: May 2026",
  },
]

export default function PrivacyPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="Privacy Policy" description="SMARTWEAR privacy policy — how we collect, use, and protect your data." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <Shield className="h-6 w-6 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-2">Legal</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05]">Privacy policy</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-[#0A0A0A]" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[#0A0A0A]/60">
                We take your privacy seriously. Here is how we collect, use, and protect your personal information.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {sections.map((s, i) => (
              <div key={s.title} className={`bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] ${i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-0.5 w-5 rounded-full bg-[#0A0A0A]" />
                  <h2 className="text-lg font-bold text-[#0A0A0A]">{s.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-[#0A0A0A]/60">{s.content}</p>
                {s.meta && (
                  <p className="mt-3 text-xs text-[#0A0A0A]/40">{s.meta}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-[#E5E5E5] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-[#0A0A0A]/60">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 1-Year Warranty</span>
            <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 7-Day Returns</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Free Shipping</span>
            <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Cash on Delivery</span>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

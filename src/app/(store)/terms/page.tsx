"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import { FileText, ShieldCheck, Banknote, RotateCcw, Truck } from "lucide-react"

const sections = [
  {
    title: "Orders & payment",
    content: [
      "By placing an order on SMARTWEAR, you agree to provide accurate and complete information. All orders are subject to product availability. We reserve the right to cancel any order if the product is no longer in stock.",
      "Payment is collected via cash on delivery at the time your order arrives. No advance payment is required unless explicitly stated for pre-orders or special requests.",
    ],
  },
  {
    title: "Shipping & delivery",
    content: [
      "Delivery timelines are estimates and not guaranteed. While we strive to deliver within 3–5 business days, delays may occur due to factors beyond our control (weather, courier issues, etc.). We are not liable for such delays.",
    ],
  },
  {
    title: "Returns & refunds",
    content: [
      "Products may be returned within 7 days of delivery as outlined in our Returns policy. Refunds are processed within 24–48 hours after the returned item is received and inspected.",
    ],
  },
  {
    title: "Limitation of liability",
    content: [
      "SMARTWEAR shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our products. Our total liability is limited to the purchase price of the product in question.",
    ],
  },
  {
    title: "Contact",
    content: [
      "For any questions about these terms, please contact us via WhatsApp or email. We are here to help.",
    ],
  },
]

export default function TermsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="Terms of Service" description="SMARTWEAR terms of service — understand your rights and our policies." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <FileText className="h-6 w-6 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-2">Legal</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05]">Terms of service</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-[#0A0A0A]" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[#0A0A0A]/60">
                By using SMARTWEAR, you agree to the following terms and conditions governing your use of our products and services.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {sections.map((s, i) => (
              <div key={s.title} className={`bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] ${i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-0.5 w-5 rounded-full bg-[#0A0A0A]" />
                  <h2 className="text-lg font-bold text-[#0A0A0A]">{s.title}</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-[#0A0A0A]/60">
                  {s.content.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
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

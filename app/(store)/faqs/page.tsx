"use client"

import { ChevronRight, HelpCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    category: "Orders & Shipping",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery within Pakistan takes 3-5 business days. Express delivery takes 1-2 business days for major cities." },
      { q: "Do you offer free shipping?", a: "Yes, we offer complimentary standard shipping on all orders above Rs. 15,000." },
      { q: "How can I track my order?", a: "Once your order is shipped, you will receive a tracking number via email and SMS. You can also use our Track Order page." },
    ]
  },
  {
    category: "Returns & Warranty",
    items: [
      { q: "What is your return policy?", a: "We offer a 7-day return policy for unused items in their original packaging with all tags attached." },
      { q: "Do your watches come with a warranty?", a: "Yes, all our luxury timepieces come with a 1-year international warranty covering manufacturing defects." },
    ]
  },
  {
    category: "Payment",
    items: [
      { q: "What payment methods do you accept?", a: "We accept Cash on Delivery (COD), JazzCash, Easypaisa, and direct Bank Transfers." },
      { q: "Is it safe to pay online?", a: "Absolutely. Our payment gateways use bank-level encryption to ensure your financial details remain completely secure." },
    ]
  }
]

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      {/* Header */}
      <div className="relative overflow-hidden text-white pt-14 pb-6 md:pt-28 md:pb-16 border-b border-white/5 mb-4 sm:mb-6">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ background: "radial-gradient(circle, #B8860B, transparent)" }}
        />
        <div className="sw-container relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-white/70 mb-4 sm:mb-6 justify-center uppercase tracking-wide sm:tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span className="text-[#B8860B]">FAQs</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-2 sm:mb-4"
            style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif", fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Find quick answers to common questions about our products, shipping, returns, and more.
          </p>
        </div>
      </div>

      <div className="sw-container pb-12 md:pb-24">
        <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
          {faqs.map((section, index) => (
            <div key={index} className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>
                <div className="w-8 h-8 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/20 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-[#B8860B]" />
                </div>
                {section.category}
              </h2>
              <div className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl p-6 md:p-8">
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} value={`item-${index}-${i}`} className="border-white/5 py-2">
                      <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:text-[#B8860B] transition-colors hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-white/60 leading-relaxed pt-2">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

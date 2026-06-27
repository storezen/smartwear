"use client"

import { ChevronRight, RefreshCw, RotateCcw, ShieldCheck } from "lucide-react"

export default function WarrantyPage() {
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
            <span className="text-[#B8860B]">Warranty</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-2 sm:mb-4"
            style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif", fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            7-Day Replacement Warranty
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Hassle-free replacement if anything is not right with your product.
          </p>
        </div>
      </div>

      <div className="sw-container pb-12 md:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 md:mb-12">
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <RotateCcw className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>7 Days</h3>
              <p className="text-xs text-white/60">Replacement Window</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <RefreshCw className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Replacement</h3>
              <p className="text-xs text-white/60">Defective items replaced</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Hassle-Free</h3>
              <p className="text-xs text-white/60">Simple process</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:font-normal prose-headings:text-white" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>
            <h2 className="text-2xl mb-4">Our Replacement Policy</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Every Smartwear timepiece is carefully packed and quality-checked before dispatch. If you receive a product
              with a manufacturing defect or damage during transit, we offer a hassle-free <strong>7-day replacement</strong> from
              the date of delivery. We believe in making things right, no questions asked.
            </p>

            <h2 className="text-2xl mb-4">What Is Covered?</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Replacement applies to products with genuine manufacturing defects or issues that were not visible at the
              time of delivery. If a covered issue arises within 7 days, Smartwear will replace the item with an identical
              or similar model free of charge.
            </p>

            <h2 className="text-2xl mb-4">What Is Not Covered?</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Please note that replacement does not cover:
              <br />- Normal wear and tear, including scratches on the case, glass, or strap.
              <br />- Damage caused by accidents, mishandling, negligence, or impact.
              <br />- Damage resulting from improper repairs or modifications by unauthorized third parties.
              <br />- Water damage caused by exceeding the product's stated water resistance rating.
              <br />- Change of mind or preference (product must be defective for replacement).
            </p>

            <h2 className="text-2xl mb-4">How to Request a Replacement</h2>
            <p className="font-sans mb-8 leading-relaxed">
              To request a replacement, please contact our support team at <strong>concierge@smartwear.pk</strong> or call us
              at +92 300 1234567 within 7 days of delivery. You must provide:
              <br />- Your order number
              <br />- A clear photo or video showing the issue
              <br />- A brief description of the problem
              <br /><br />
              Once approved, we will arrange for the replacement to be sent to your address.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

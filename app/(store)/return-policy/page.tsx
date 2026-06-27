"use client"

import { ChevronRight, RefreshCcw, ShieldCheck, Box } from "lucide-react"

export default function ReturnPolicyPage() {
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
            <span className="text-[#B8860B]">Replacement Policy</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-2 sm:mb-4"
            style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif", fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            Replacement Policy
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Hassle-free replacement for defective or damaged items within 7 days of delivery.
          </p>
        </div>
      </div>

      <div className="sw-container pb-12 md:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 md:mb-12">
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <RefreshCcw className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>7-Day Replacement</h3>
              <p className="text-sm text-white/60">Request replacement within 7 days of receiving your order.</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <Box className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Original Packaging</h3>
              <p className="text-sm text-white/60">Items must be returned with all original packaging and accessories.</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Quality Inspected</h3>
              <p className="text-sm text-white/60">Replacement is processed after passing quality checks.</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:font-normal prose-headings:text-white" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>
            <h2 className="text-2xl mb-4">1. Eligibility for Replacement</h2>
            <p className="font-sans mb-8 leading-relaxed">
              We offer replacement within <strong>7 days</strong> of delivery for defective or damaged items. To be eligible,
              the product must be in its original condition with all packaging, warranty cards, manuals, and protective
              films intact. Please inspect your product at the time of delivery using our open-box verification option.
            </p>

            <h2 className="text-2xl mb-4">2. Non-Replaceable Items</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Please note that certain items cannot be replaced:
              <br />- Products that show signs of wear, scratches, or damage caused by misuse.
              <br />- Products that have had their straps adjusted or sized.
              <br />- Limited edition pieces or custom-ordered watches.
              <br />- Change of mind or preference (product must be defective).
            </p>

            <h2 className="text-2xl mb-4">3. How to Initiate a Replacement</h2>
            <p className="font-sans mb-8 leading-relaxed">
              To start a replacement, please contact our concierge team at <strong>concierge@smartwear.pk</strong> or call us at
              +92 300 1234567 within 7 days of delivery. Provide your order number and a clear description/photo of the
              issue. Once approved, we will arrange for the replacement item to be dispatched to your address.
            </p>

            <h2 className="text-2xl mb-4">4. Replacement Process</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Once we receive and inspect the returned item, we will notify you of the approval or rejection of your
              replacement request. If approved, the replacement item will be dispatched within 2-3 business days.
              Shipping costs for defective replacements are covered by us.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

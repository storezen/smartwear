"use client"

import { ChevronRight, RefreshCcw, ShieldCheck, Box } from "lucide-react"

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      {/* Header */}
      <div className="relative overflow-hidden text-white pt-20 pb-12 md:pt-28 md:pb-16 border-b border-white/5 mb-8">
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
          <div className="inline-flex items-center gap-2 text-xs text-white/70 mb-6 justify-center uppercase tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span className="text-[#B8860B]">Return Policy</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Return Policy
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            We stand behind the quality of our timepieces with a hassle-free return and exchange process.
          </p>
        </div>
      </div>

      <div className="sw-container pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <RefreshCcw className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>7-Day Returns</h3>
              <p className="text-sm text-white/60">Request a return within 7 days of receiving your order.</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <Box className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Original Packaging</h3>
              <p className="text-sm text-white/60">Items must be unworn with all original tags attached.</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Quality Inspected</h3>
              <p className="text-sm text-white/60">Returns are processed after passing quality checks.</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:font-normal prose-headings:text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
            <h2 className="text-2xl mb-4">1. Eligibility for Returns</h2>
            <p className="font-sans mb-8 leading-relaxed">
              We accept returns or exchanges within <strong>7 days</strong> of delivery. To be eligible for a return, the watch must be strictly unworn, unaltered, and in the exact same condition that you received it. It must also be in the original packaging, complete with all warranty cards, manuals, and protective films intact.
            </p>

            <h2 className="text-2xl mb-4">2. Non-Returnable Items</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Please note that certain items cannot be returned:
              <br />- Watches that show any signs of wear, scratches, or damage.
              <br />- Watches that have had their straps adjusted or sized.
              <br />- Limited edition pieces or custom-ordered watches.
              <br />- Gift cards.
            </p>

            <h2 className="text-2xl mb-4">3. How to Initiate a Return</h2>
            <p className="font-sans mb-8 leading-relaxed">
              To start a return, please contact our concierge team at <strong>concierge@smartwear.pk</strong> or call us at +92 300 1234567. Provide your order number and reason for return. Once approved, we will provide you with a return authorization number and instructions on how to securely ship the item back to our facility.
            </p>

            <h2 className="text-2xl mb-4">4. Refunds Process</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed to your original method of payment within 5-7 business days. Please note that original shipping costs are non-refundable.
            </p>

            <h2 className="text-2xl mb-4">5. Exchanges</h2>
            <p className="font-sans mb-8 leading-relaxed">
              If you wish to exchange your watch for a different model, the fastest way is to return the original item following the process above, and make a separate purchase for the new item. Alternatively, our concierge team can assist you with a direct exchange process subject to inventory availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

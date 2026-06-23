"use client"

import { ChevronRight, ShieldCheck, Wrench, Settings, Star } from "lucide-react"

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      {/* Header */}
      <div className="relative overflow-hidden text-white pt-16 pb-8 md:pt-28 md:pb-16 border-b border-white/5 mb-6">
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
            <span className="text-[#B8860B]">Warranty</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            International Warranty
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Our commitment to exceptional craftsmanship and reliable performance.
          </p>
        </div>
      </div>

      <div className="sw-container pb-12 md:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 md:mb-12">
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>1 Year</h3>
              <p className="text-xs text-white/60">Standard Coverage</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <Wrench className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Movement</h3>
              <p className="text-xs text-white/60">Defects Covered</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <Settings className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Parts</h3>
              <p className="text-xs text-white/60">Authentic Replacements</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <Star className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Expert Care</h3>
              <p className="text-xs text-white/60">Certified Technicians</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:font-normal prose-headings:text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
            <h2 className="text-2xl mb-4">The Smartwear Guarantee</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Every Smartwear timepiece is crafted to the highest standards using premium materials and undergoes rigorous quality testing. We are proud to offer a comprehensive <strong>1-Year International Warranty</strong> from the date of purchase, ensuring your watch functions flawlessly.
            </p>

            <h2 className="text-2xl mb-4">What Is Covered?</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Our warranty covers manufacturing defects and internal movement faults that exist at the time of delivery. If a defect covered by this warranty arises during the warranty period, Smartwear will repair or replace the defective parts free of charge. In cases where a repair is not possible, we will offer a replacement with an identical or similar model.
            </p>

            <h2 className="text-2xl mb-4">What Is Not Covered?</h2>
            <p className="font-sans mb-8 leading-relaxed">
              To keep our warranty fair and straightforward, please note that it does not cover:
              <br />- Normal wear and tear, including scratches on the case, glass, or strap.
              <br />- Damage caused by accidents, mishandling, negligence, or impact.
              <br />- Damage resulting from improper repairs or modifications by unauthorized third parties.
              <br />- Water damage caused by exceeding the watch's stated water resistance rating.
              <br />- The lifespan of the battery.
            </p>

            <h2 className="text-2xl mb-4">How to Claim Warranty Service</h2>
            <p className="font-sans mb-8 leading-relaxed">
              To request warranty service, please contact our support team at <strong>concierge@smartwear.pk</strong>. You must provide a valid proof of purchase (order confirmation or receipt) and a description of the issue. Our team will guide you through sending your watch to our authorized service center for evaluation and repair.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

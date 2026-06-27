"use client"

import { ChevronRight, Truck, Globe, Clock, ShieldCheck } from "lucide-react"

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      {/* Header */}
      <div className="relative overflow-hidden text-white  pb-6 md:pt-28 md:pb-16 border-b border-white/5 mb-4 sm:mb-6">
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
            <span className="text-[#B8860B]">Shipping Policy</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-2 sm:mb-4"
            style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif", fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            Shipping Policy
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Everything you need to know about how we securely deliver your luxury timepieces.
          </p>
        </div>
      </div>

      <div className="sw-container pb-12 md:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 md:mb-12">
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <Truck className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Nationwide Delivery</h3>
              <p className="text-sm text-white/60">We deliver across all major cities in Pakistan.</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <Clock className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Fast Dispatch</h3>
              <p className="text-sm text-white/60">Orders are processed within 24 hours.</p>
            </div>
            <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl text-center">
              <div className="w-12 h-12 mx-auto bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-4 border border-[#B8860B]/20">
                <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Insured Shipping</h3>
              <p className="text-sm text-white/60">All packages are fully insured during transit.</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-headings:font-normal prose-headings:text-white" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>
            <h2 className="text-2xl mb-4">1. Delivery Timeframes</h2>
            <p className="font-sans mb-8 leading-relaxed">
              We strive to deliver your order as quickly as possible. Standard delivery within Pakistan takes approximately <strong>3 to 5 business days</strong> from the date of dispatch. Deliveries to remote areas may take an additional 1-2 days. If you select Express Shipping (where available), your order will be prioritized for delivery within <strong>1 to 2 business days</strong>.
            </p>

            <h2 className="text-2xl mb-4">2. Shipping Costs</h2>
            <p className="font-sans mb-8 leading-relaxed">
              We are pleased to offer <strong>free standard shipping</strong> on all orders over Rs. 15,000. For orders below this amount, a flat standard shipping rate of Rs. 200 applies. Express shipping, if chosen, will be calculated at checkout based on your delivery address.
            </p>

            <h2 className="text-2xl mb-4">3. Order Tracking</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Once your order has been dispatched, you will receive a confirmation email and SMS containing your courier tracking number. You can use this number on our Track Order page to monitor the real-time status of your delivery.
            </p>

            <h2 className="text-2xl mb-4">4. Secure Packaging</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Every Smartwear timepiece is carefully inspected and securely packaged in our signature luxury watch boxes before dispatch. The outer packaging is designed to be discreet for security purposes while ensuring the watch remains perfectly protected against shock or damage during transit.
            </p>

            <h2 className="text-2xl mb-4">5. Signature Required</h2>
            <p className="font-sans mb-8 leading-relaxed">
              Due to the high value of our products, all deliveries require a signature upon receipt. Please ensure someone is available at your designated shipping address to receive and sign for the package. If no one is available, the courier will attempt delivery again the following business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

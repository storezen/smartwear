"use client"

import { useState, useEffect } from "react"
import { Shield, Users, Award, Truck, Heart, Store } from "lucide-react"

const values = [
  { icon: Shield, label: "100% Authentic", desc: "Every product we sell is verified genuine with manufacturer warranty." },
  { icon: Users, label: "50,000+ Happy Customers", desc: "Trusted by thousands across Pakistan for quality and reliability." },
  { icon: Award, label: "Premium Quality", desc: "We personally vet every product before it reaches our store." },
  { icon: Truck, label: "Nationwide Delivery", desc: "Free shipping across Pakistan with open-box verification." },
  { icon: Heart, label: "Customer First", desc: "Our support team is available 7 days a week to help you." },
  { icon: Store, label: "Lahore Boutique", desc: "Visit our physical store in Gulberg, Lahore to see products in person." },
]

export default function AboutPage() {
  const [s, setS] = useState<any>(null)
  useEffect(() => { fetch('/api/public/settings').then(r => r.json()).then(setS).catch(() => {}) }, [])
  return (
    <div className="min-h-screen bg-[#06080A]">
      <div className="sw-container max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Pakistan&apos;s Most Trusted
            <br />
            <span className="bg-gradient-to-r from-[#B8860B] via-[#F0C75A] to-[#B8860B] bg-clip-text text-transparent">
              Smartwatch Store
            </span>
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            We started Smartwear with one goal: make premium wearables accessible to everyone in Pakistan.
            No inflated prices, no fake products. Just honest quality at honest prices.
          </p>
        </div>

        {/* Story */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 mb-12 md:mb-20 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Our Story
            </h2>
            <div className="text-white/70 leading-relaxed space-y-4 text-sm md:text-base">
              <p>
                Smartwear was born in Lahore out of a simple frustration — the best smartwatches were either
                unavailable in Pakistan or carried ridiculous markups. Import duties, middlemen, and scarcity
                were being used as excuses to overcharge customers.
              </p>
              <p>
                We decided to change that. By working directly with manufacturers and handling our own logistics,
                we brought premium wearables to Pakistan at prices that actually make sense. Every product is
                personally tested by our team before listing.
              </p>
              <p>
                Today, we serve thousands of customers across all major cities in Pakistan. From Karachi to
                Peshawar, Quetta to Gilgit — our watches are on the wrists of people who value quality
                without the premium markup.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#B8860B]/10 to-transparent flex items-center justify-center">
            <div className="text-center p-6 md:p-8">
              <span className="text-6xl md:text-8xl font-bold text-[#B8860B] opacity-30" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>2024</span>
              <p className="text-white/40 text-sm mt-2">Founded in Lahore, Pakistan</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Products Delivered", value: "50,000+" },
            { label: "Cities Covered", value: "200+" },
            { label: "Customer Rating", value: "4.8 ★" },
            { label: "Happy Customers", value: "15,000+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-2xl md:text-3xl font-bold text-[#B8860B] mb-1">{stat.value}</p>
              <p className="text-white/50 text-xs md:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Why Smartwear?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {values.map((v) => (
            <div key={v.label} className="p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#B8860B]/20 transition-colors">
              <v.icon className="w-6 h-6 text-[#B8860B] mb-3" />
              <h3 className="text-white font-semibold mb-1">{v.label}</h3>
              <p className="text-white/50 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Physical Presence */}
        <div className="text-center p-8 md:p-12 rounded-2xl border border-white/10 bg-gradient-to-br from-[#B8860B]/5 to-transparent">
          <Store className="w-8 h-8 text-[#B8860B] mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Visit Our Store
          </h2>
          <p className="text-white/60 max-w-lg mx-auto leading-relaxed">
            Not ready to order online? Visit our boutique to see and try our products in person.
            <br />
            <span className="text-white/80 font-medium">{s?.store_address_line1 ? `${s.store_address_line1}${s.store_address_line2 ? `, ${s.store_address_line2}` : ''}` : 'MM Alam Road, Gulberg III'}{s?.store_city ? `, ${s.store_city}` : ', Lahore'}</span>
            <br />
            {s?.business_hours || 'Mon — Sat: 11 AM — 9 PM'}
          </p>
        </div>
      </div>
    </div>
  )
}

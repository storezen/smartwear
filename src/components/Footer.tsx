"use client"

import Link from "next/link"
import { ShieldCheck, Truck, CreditCard } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const sitemap = [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/products" },
        { label: "Accessories", href: "/products/category/accessories" },
        { label: "Charging", href: "/products/category/charging" },
        { label: "Watch Accessories", href: "/products/category/watch-accessories" },
        { label: "Acrylic Glass", href: "/products/category/acrylic-glass" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help & FAQ", href: "/contact" },
        { label: "Contact Us", href: "/contact" },
        { label: "Shipping Info", href: "/shipping" },
        { label: "Returns & Exchanges", href: "/returns" },
        { label: "Warranty", href: "/warranty" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ]
    }
  ]

  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-[#E5E5E5] pt-16 pb-8 text-[#0A0A0A]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 shrink-0 group mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A0A0A] transition-transform duration-500 group-hover:scale-105">
                <span className="text-lg font-bold text-white tracking-widest">S</span>
              </div>
              <span className="font-heading text-xl font-bold tracking-[0.15em] uppercase">
                SMARTWEAR
              </span>
            </Link>
            <p className="text-[#0A0A0A]/60 text-sm max-w-xs font-medium leading-relaxed mb-6">
              Premium smartwatches engineered for the modern aesthetic. Available nationwide.
            </p>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {sitemap.map((column, idx) => (
              <div key={idx}>
                <h4 className="font-bold uppercase tracking-wider text-sm mb-6">{column.title}</h4>
                <ul className="space-y-4">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <Link href={link.href} className="text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors text-sm font-medium">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-[#E5E5E5] mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-[#0A0A0A]/60">
            &copy; {currentYear} SmartWear. All rights reserved.
          </p>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] rounded bg-[#FAFAFA] text-xs font-bold uppercase tracking-widest text-[#0A0A0A]/80">
              <CreditCard className="h-4 w-4 text-[#0A0A0A]" /> Visa
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] rounded bg-[#FAFAFA] text-xs font-bold uppercase tracking-widest text-[#0A0A0A]/80">
              <CreditCard className="h-4 w-4 text-[#0A0A0A]" /> MC
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#10B981]/30 rounded bg-[#10B981]/10 text-xs font-bold uppercase tracking-widest text-[#10B981]">
              <Truck className="h-4 w-4" /> COD
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}

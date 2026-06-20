"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Twitter, ArrowRight } from "lucide-react"

const links = {
  shop: [
    { l: "All Watches",           h: "/products" },
    { l: "Smart Watches",         h: "/products?category=smart-watches" },
    { l: "Analog Watches",        h: "/products?category=analog-watches" },
    { l: "Ladies Watches",        h: "/products?category=ladies-watches" },
    { l: "Watch Bands & Straps",  h: "/products?category=watch-bands" },
    { l: "Phone Cases",           h: "/products?category=phone-cases" },
    { l: "Accessories",           h: "/products?category=accessories" },
    { l: "Sale",                  h: "/products?sale=true" },
  ],
  account: [
    { l: "My Account",  h: "/account" },
    { l: "Orders",      h: "/account/orders" },
    { l: "Wishlist",    h: "/wishlist" },
    { l: "Track Order", h: "/track-order" },
  ],
  support: [
    { l: "Contact Us",       h: "/contact" },
    { l: "FAQs",             h: "/faqs" },
    { l: "Shipping Policy",  h: "/shipping-policy" },
    { l: "Return Policy",    h: "/return-policy" },
    { l: "Warranty",         h: "/warranty" },
  ],
}

const social = [
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-500" },
  { icon: Facebook,  href: "#", label: "Facebook", color: "hover:text-blue-500" },
  { icon: Twitter,   href: "#", label: "Twitter", color: "hover:text-sky-400" },
  { icon: Youtube,   href: "#", label: "YouTube", color: "hover:text-red-500" },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 36 36" fill="none" width={30} height={30}>
        <rect x="12.5" y="1.5" width="11" height="4" rx="2" fill="#B8860B"/>
        <rect x="12.5" y="30.5" width="11" height="4" rx="2" fill="#B8860B"/>
        <circle cx="18" cy="18" r="14.5" fill="#0F1923" stroke="#B8860B" strokeWidth="1.5"/>
        <circle cx="18" cy="18" r="10.5" fill="#0C0F14"/>
        <line x1="18" y1="18" x2="18" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="18" y1="18" x2="23" y2="18" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="18" r="1.5" fill="#B8860B"/>
      </svg>
      <div>
        <span
          className="block text-white font-semibold"
          style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "1.1rem", letterSpacing: "-0.02em" }}
        >
          Smartwear
        </span>
        <span
          className="block text-white/60 font-medium mt-0.5"
          style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase" }}
        >
          Pakistan
        </span>
      </div>
    </div>
  )
}

export function StoreFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(to bottom, #0C0F14 0%, #06080A 100%)", color: "white" }}>
      {/* Animated Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-50" />
      
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #B8860B, transparent)" }} />

      {/* Newsletter */}
      <div className="relative border-b border-white/5 py-12 md:py-16">
        <div className="sw-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white/[0.02] border border-white/5 backdrop-blur-xl p-8 rounded-[24px]">
            <div>
              <p className="text-[#B8860B] font-semibold uppercase tracking-[0.2em] text-[0.65rem] mb-2 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-[#B8860B]" />
                Stay Updated
              </p>
              <h3
                className="text-white font-semibold mb-2"
                style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(1.5rem,3vw,2rem)" }}
              >
                The World of Smartwear
              </h3>
              <p className="text-white/60 text-sm max-w-md leading-relaxed">
                Subscribe to receive early access to new collections, exclusive events, and the latest horological news.
              </p>
            </div>
            <div className="w-full md:w-auto relative group">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full md:w-80 h-12 pl-5 pr-12 text-sm rounded-xl outline-none transition-all bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#B8860B] focus:bg-white/[0.08]"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-[#B8860B] text-[#0C0F14] hover:bg-[#D4A017] transition-colors sw-interactive">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="relative py-16 md:py-24">
        <div className="sw-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-4 pr-4">
              <Logo />
              <p className="text-white/60 text-sm mt-6 mb-8 leading-relaxed max-w-xs">
                Pakistan's premier destination for luxury timepieces. We blend timeless elegance with modern innovation, offering an unparalleled collection of smart and analog watches.
              </p>
              <div className="flex gap-4">
                {social.map((s, i) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-colors sw-interactive hover:bg-white/10 hover:border-white/20 ${s.color}`}
                    title={s.label}
                  >
                    <s.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">The Collection</h4>
              <ul className="space-y-4">
                {links.shop.map(link => (
                  <li key={link.l}>
                    <Link href={link.h} className="text-white/60 hover:text-[#B8860B] text-sm transition-colors sw-interactive inline-block">
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Account</h4>
              <ul className="space-y-4">
                {links.account.map(link => (
                  <li key={link.l}>
                    <Link href={link.h} className="text-white/60 hover:text-[#B8860B] text-sm transition-colors sw-interactive inline-block">
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4">
                {links.support.map(link => (
                  <li key={link.l}>
                    <Link href={link.h} className="text-white/60 hover:text-[#B8860B] text-sm transition-colors sw-interactive inline-block">
                      {link.l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Contact</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:concierge@smartwear.pk" className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group sw-interactive">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B8860B]/20 group-hover:text-[#B8860B] transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    concierge@smartwear.pk
                  </a>
                </li>
                <li>
                  <a href="tel:+923001234567" className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group sw-interactive">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B8860B]/20 group-hover:text-[#B8860B] transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    +92 300 1234567
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/60 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="leading-relaxed mt-1">
                    Level 3, Dolmen Mall Clifton<br/>
                    Karachi, Pakistan
                  </span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative border-t border-white/5 py-6">
        <div className="sw-container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-xs">
            © {currentYear} Smartwear Pakistan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy-policy" className="text-white/60 hover:text-white transition-colors sw-interactive">Privacy Policy</Link>
            <span className="text-white/10">•</span>
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors sw-interactive">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  MapPin, Phone, Mail, Instagram, Facebook,
  Youtube, Twitter, ArrowRight, Lock, Banknote,
  PackageOpen, Truck, ShieldCheck, RefreshCw,
} from "lucide-react"
import { useSettings } from "@/lib/use-settings"

const collectionLinks = [
  { l: "Smart Watches",        h: "/products?category=smart-watches" },
  { l: "Analog Watches",       h: "/products?category=analog-watches" },
  { l: "Ladies Watches",       h: "/products?category=ladies-watches" },
  { l: "Watch Bands & Straps", h: "/products?category=watch-bands" },
]

const links = {
  account: [
    { l: "My Account",  h: "/account" },
    { l: "Orders",      h: "/account/orders" },
    { l: "Wishlist",    h: "/wishlist" },
    { l: "Track Order", h: "/track-order" },
  ],
  support: [
    { l: "About Us",         h: "/about" },
    { l: "Contact Us",       h: "/contact" },
    { l: "FAQs",             h: "/faqs" },
    { l: "Shipping Policy",  h: "/shipping-policy" },
    { l: "Return Policy",    h: "/return-policy" },
    { l: "Warranty",         h: "/warranty" },
  ],
}

const socialIcons: Record<string, React.ElementType> = {
  Instagram, Facebook, Twitter, Youtube,
}

const iconMap: Record<string, React.ElementType> = {
  Lock: Lock, Banknote, Truck, ShieldCheck, RefreshCw, PackageOpen, MapPin, Phone, Mail,
}

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
  const { settings, loading } = useSettings()

  const s = settings || {} as any

  const buildSocial = () => {
    const map: Record<string, { icon: string; color: string }> = {
      social_instagram: { icon: "Instagram", color: "hover:text-pink-500" },
      social_facebook: { icon: "Facebook", color: "hover:text-blue-500" },
      social_twitter: { icon: "Twitter", color: "hover:text-sky-400" },
      social_youtube: { icon: "Youtube", color: "hover:text-red-500" },
    }
    return Object.entries(map)
      .filter(([key]) => s[key])
      .map(([key, cfg]) => ({
        href: s[key],
        label: key.replace("social_", "").replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()),
        icon: cfg.icon,
        color: cfg.color,
      }))
  }

  const parseJsonArray = (val: string) => {
    try { return JSON.parse(val || "[]") } catch { return [] }
  }

  const badges = parseJsonArray(s.security_badges)

  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(to bottom, #0C0F14 0%, #06080A 100%)", color: "white" }}>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-50" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #B8860B, transparent)" }} />

      {/* Newsletter */}
      <div className="relative border-b border-white/5 py-12 md:py-16">
        <div className="sw-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white/[0.02] border border-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[24px]">
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
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-[#B8860B] text-[#0C0F14] hover:bg-[#D4A017] transition-colors sw-interactive" aria-label="Subscribe">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="relative py-16 md:py-24">
        <div className="sw-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
            
            {/* Brand Column */}
            <div className="lg:col-span-4 pr-4">
              <Logo />
              <p className="text-white/60 text-sm mt-6 mb-8 leading-relaxed max-w-xs">
                {s.store_tagline 
                  ? `${s.store_name || 'Smartwear'} — ${s.store_tagline}. Genuine products at honest prices with nationwide delivery.`
                  : `Pakistan's most trusted destination for premium smartwatches and accessories.`}
              </p>
              <div className="flex gap-4">
                {buildSocial().map((soc) => {
                  const Icon = socialIcons[soc.icon as keyof typeof socialIcons]
                  if (!Icon) return null
                  return (
                    <motion.a
                      key={soc.label}
                      href={soc.href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-colors sw-interactive hover:bg-white/10 hover:border-white/20 ${soc.color}`}
                      title={soc.label}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  )
                })}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">The Collection</h4>
              <ul className="space-y-4">
                {collectionLinks.map(link => (
                  <li key={link.l}>
                    <Link href={link.h} className="text-white/60 hover:text-[#B8860B] text-sm transition-colors sw-interactive inline-block">
                      {link.l}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/products" className="text-[#B8860B] hover:text-[#D4A017] text-sm font-semibold transition-colors sw-interactive inline-flex items-center gap-1.5">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
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
                {s.support_email && (
                  <li>
                    <a href={`mailto:${s.support_email}`} className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group sw-interactive">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B8860B]/20 group-hover:text-[#B8860B] transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      {s.support_email}
                    </a>
                  </li>
                )}
                {s.support_phone && (
                  <li>
                    <a href={`tel:${s.support_phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group sw-interactive">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#B8860B]/20 group-hover:text-[#B8860B] transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      {s.support_phone}
                    </a>
                  </li>
                )}
                {(s.store_address_line1 || s.store_city) && (
                  <li className="flex items-start gap-3 text-white/60 text-sm">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="leading-relaxed mt-1">
                      {s.store_address_line1}{s.store_address_line2 ? <br/> : null}{s.store_address_line2}{s.store_address_line2 || s.store_address_line1 ? <br/> : null}
                      {s.store_city}
                    </span>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Security Badges */}
      {badges.length > 0 && (
        <div className="relative border-t border-white/5 py-4">
          <div className="sw-container">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {badges.map((badge: { label: string; icon: string }, idx: number) => {
                const BadgeIcon = iconMap[badge.icon as keyof typeof iconMap]
                return (
                  <div key={idx} className="flex items-center gap-2 text-white/40">
                    {BadgeIcon ? <BadgeIcon className="w-5 h-5" /> : null}
                    <span className="text-[11px]">{badge.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="relative border-t border-white/5 py-6">
        <div className="sw-container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-xs">
            © {currentYear} {s.store_name || 'Smartwear Pakistan'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/about" className="text-white/60 hover:text-white transition-colors sw-interactive">About</Link>
            <span className="text-white/10">•</span>
            <Link href="/privacy-policy" className="text-white/60 hover:text-white transition-colors sw-interactive">Privacy</Link>
            <span className="text-white/10">•</span>
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors sw-interactive">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

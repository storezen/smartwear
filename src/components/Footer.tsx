"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MessageCircle, MapPin, Phone, ExternalLink, Share2, Truck, PackageCheck, ShieldCheck, Zap } from "lucide-react"
import { useCategories } from "@/lib/categories-context"

const supportLinks = [
  { label: "Contact Us",          href: "/contact" },
  { label: "Shipping Info",       href: "/shipping" },
  { label: "Returns & Exchanges", href: "/returns" },
  { label: "Warranty",            href: "/warranty" },
]

const companyLinks = [
  { label: "About Us",         href: "/about" },
  { label: "Privacy Policy",   href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
}

export function Footer() {
  const { activeCategories } = useCategories()
  const categoryLinks = activeCategories.slice(0, 5).map((c) => ({
    label: c.name,
    href: `/products/category/${c.slug}`,
  }))

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={containerVariants}
      className="bg-neutral-950 text-white relative border-t-0"
    >
      {/* Layered top border gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Top trust bar */}
      <div className="border-b border-white/5 bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-neutral-400">
            <span className="flex items-center gap-2"><Truck className="size-4 text-emerald-400" strokeWidth={1.5} /> <span className="text-white font-medium">Free Delivery Across Pakistan</span></span>
            <span className="flex items-center gap-2"><PackageCheck className="size-4 text-emerald-400" strokeWidth={1.5} /> <span className="text-white font-medium">Cash on Delivery Available</span></span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-400" strokeWidth={1.5} /> <span className="text-white font-medium">7-Day Replacement Warranty</span></span>
            <span className="flex items-center gap-2"><Zap className="size-4 text-amber-400" strokeWidth={1.5} /> <span className="text-white font-medium">Same Day Dispatch</span></span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:py-20">

          {/* Brand Column */}
          <motion.div variants={itemVariants} className="space-y-5 sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-[0_0_16px_rgba(37,99,235,0.3)] transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(37,99,235,0.5)] group-hover:scale-105">
                <span className="text-sm font-extrabold text-white tracking-widest">S</span>
              </div>
              <div>
                <span className="font-heading text-xl font-extrabold tracking-tight text-white block leading-none">
                  SMARTWEAR
                </span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase">Pakistan&apos;s Tech Store</span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-neutral-400 max-w-xs">
              Premium smart watches and accessories — curated for those who demand more from their tech.
            </p>

            {/* WhatsApp Contact */}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-200 w-fit group"
            >
              <MessageCircle className="size-4.5 text-emerald-400" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold text-emerald-400">Order via WhatsApp</p>
                <p className="text-[11px] text-neutral-400">0300-1234567</p>
              </div>
            </a>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:border-white/20 transition-all shadow-sm">
                <ExternalLink className="size-4" strokeWidth={1.5} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:border-white/20 transition-all shadow-sm">
                <Share2 className="size-4" strokeWidth={1.5} />
              </a>
              <a href="https://wa.me/923001234567" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-sm">
                <MessageCircle className="size-4" strokeWidth={1.5} />
              </a>
            </div>
          </motion.div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 gap-8 sm:col-span-2 lg:col-span-3 sm:grid-cols-3">
            {/* Shop */}
            <motion.div variants={itemVariants}>
              <h4 className="text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase mb-4">Shop</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/products" className="text-sm text-neutral-400 hover:text-white transition-colors">
                    All Products
                  </Link>
                </li>
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Help & Policies */}
            <motion.div variants={itemVariants}>
              <h4 className="text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase mb-4">Help & Policies</h4>
              <ul className="space-y-2.5">
                {[...supportLinks, ...companyLinks].slice(0, 6).map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div variants={itemVariants}>
              <h4 className="text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase mb-4">Newsletter</h4>
              <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
                Subscribe to receive updates, access to exclusive deals, and more.
              </p>
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                />
                <button 
                  type="submit" 
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-white text-neutral-950 font-bold text-xs rounded-md hover:bg-neutral-100 transition-colors tracking-wide"
                >
                  Subscribe
                </button>
              </form>

              {/* Location */}
              <div className="mt-8 flex items-start gap-2 text-xs text-neutral-400">
                <MapPin className="size-3.5 shrink-0 mt-0.5 text-neutral-500" strokeWidth={1.5} />
                <span>Lahore, Punjab<br />Pakistan</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4 border-t border-white/5 py-6 sm:flex-row sm:justify-between"
        >
          <div className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} SMARTWEAR. All rights reserved. <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            Made with ❤️ for Pakistan
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-neutral-500 mr-1">Secure Payments:</span>
            {["COD", "Bank Transfer", "Cards"].map((method) => (
              <div key={method} className="flex h-7 px-2.5 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[10px] font-bold tracking-tight text-neutral-400">
                {method}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}

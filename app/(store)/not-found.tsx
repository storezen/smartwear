"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search, ArrowLeft, Home, Package, MessageCircle, Phone,
  ShoppingBag, HelpCircle, ShieldCheck, Truck, RefreshCw
} from "lucide-react"
import { Input } from "@/components/ui/input"

const quickLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Track Order", href: "/track-order", icon: Package },
  { label: "FAQs", href: "/faqs", icon: HelpCircle },
  { label: "Shipping Policy", href: "/shipping-policy", icon: Truck },
  { label: "Return Policy", href: "/return-policy", icon: RefreshCw },
]

const categories = [
  { label: "Smart Watches", href: "/products?category=smart-watches" },
  { label: "Analog Watches", href: "/products?category=analog-watches" },
  { label: "Ladies Watches", href: "/products?category=ladies-watches" },
  { label: "Watch Bands", href: "/products?category=watch-bands" },
  { label: "Phone Cases", href: "/products?category=phone-cases" },
  { label: "Audio", href: "/products?category=audio" },
]

export default function NotFound() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="min-h-[calc(100vh-480px)] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 mb-6">
            <span className="text-4xl font-bold font-heading sw-gold-text">404</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">
            Page Not Found
          </h1>
          <p className="text-foreground/60 text-lg mb-8 max-w-md mx-auto">
            Sorry, we couldn&apos;t find what you were looking for. It may have been moved or no longer exists.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10"
        >
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <Input
              type="text"
              placeholder="Search our store..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-20 h-14 rounded-2xl bg-card border-border/60 text-base shadow-sm focus-visible:ring-gold/30"
            />
            <button
              type="submit"
              className="sw-btn-gold absolute right-1.5 top-1/2 -translate-y-1/2 h-10 px-5 text-xs"
            >
              Search
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/60 hover:border-gold/30 hover:bg-gold/5 text-foreground/80 hover:text-foreground transition-all text-sm font-medium"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="gold-divider mb-8" />
          <p className="text-xs uppercase tracking-[2px] text-foreground/40 font-semibold mb-4">
            Browse Popular Categories
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="text-sm text-foreground/60 hover:text-gold transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-10 flex items-center justify-center gap-6 text-sm text-foreground/40"
        >
          <a
            href="tel:+923001234567"
            className="flex items-center gap-2 hover:text-gold transition-colors"
          >
            <Phone className="w-4 h-4" />
            Need Help?
          </a>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <Link
            href="/contact"
            className="flex items-center gap-2 hover:text-gold transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

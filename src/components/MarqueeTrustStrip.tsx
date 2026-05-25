"use client"

import { useEffect, useRef, useState } from "react"
import { X, Truck, PackageCheck, ShieldCheck, Star, Flame, Phone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const ITEMS = [
  { icon: Truck,        text: "Free Delivery Across Pakistan" },
  { icon: PackageCheck, text: "Cash on Delivery Available" },
  { icon: Star,         text: "4.9 ★ — 10,000+ Happy Customers" },
  { icon: ShieldCheck,  text: "7-Day Replacement Warranty" },
  { icon: Flame,        text: "New Arrivals Every Week" },
  { icon: Phone,        text: "WhatsApp Order Support" },
  { icon: Truck,        text: "Same Day Dispatch — Lahore" },
  { icon: PackageCheck, text: "Pehle Dekhein, Phir Paise Dein" },
]

// Duplicate for seamless loop
const TRACK = [...ITEMS, ...ITEMS, ...ITEMS]

export function MarqueeTrustStrip() {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = sessionStorage.getItem("promo-strip-dismissed")
    if (stored === "1") setDismissed(true)
  }, [])

  function dismiss() {
    setDismissed(true)
    sessionStorage.setItem("promo-strip-dismissed", "1")
  }

  if (!mounted || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden bg-neutral-950 border-b border-white/5"
      >
        {/* Subtle shimmer line at top */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex items-center overflow-hidden py-2.5">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-neutral-950 to-transparent" />
          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-neutral-950 to-transparent" />

          {/* Marquee track */}
          <div
            className="flex items-center gap-0 whitespace-nowrap"
            style={{ animation: "marquee-ltr 38s linear infinite" }}
          >
            {TRACK.map((item, i) => {
              const Icon = item.icon
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-6 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80"
                >
                  <Icon className="size-3 shrink-0 text-white/50" strokeWidth={2} />
                  {item.text}
                  <span className="text-white/20 ml-4">·</span>
                </span>
              )
            })}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          aria-label="Close announcement bar"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-5 w-5 items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

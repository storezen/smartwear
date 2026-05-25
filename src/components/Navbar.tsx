"use client"

import { useState, useEffect, useRef, startTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, Menu, X, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/lib/cart-context"
import { CartSheet } from "@/components/CartSheet"
import { MarqueeTrustStrip } from "@/components/MarqueeTrustStrip"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { getItemCount } = useCart()
  const count = getItemCount()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const links = [
    { href: "/products", label: "Shop All" },
    { href: "/products/category/accessories", label: "Accessories" },
    { href: "/products/category/charging", label: "Charging" }
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { startTransition(() => setMobileOpen(false)) }, [pathname])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 bg-[#FAFAFA]/80 backdrop-blur-xl",
          scrolled ? "border-b border-[#E5E5E5]" : "border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 sm:h-[72px] max-w-[1200px] items-center justify-between px-4 sm:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A0A0A] transition-transform duration-500 cubic-bezier(0.23, 1, 0.32, 1) group-hover:scale-105">
              <span className="text-sm font-bold text-white tracking-widest">S</span>
            </div>
            <span className="font-heading text-lg font-bold tracking-[0.15em] text-[#0A0A0A] uppercase transition-colors">
              SMARTWEAR
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/")
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300",
                    active ? "text-[#0A0A0A]" : "text-[#0A0A0A]/50 hover:text-[#0A0A0A]"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/923001234567?text=Hi!%20I%20want%20to%20place%20a%20COD%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-wider"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              WhatsApp
            </a>

            <Link href="/search" className="hidden md:flex h-10 w-10 items-center justify-center rounded-full text-[#0A0A0A] hover:bg-[#0A0A0A]/5 transition-colors">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#0A0A0A] hover:bg-[#0A0A0A]/5 transition-colors"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0A0A0A] text-[9px] font-bold text-[#FAFAFA]"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-[#0A0A0A] hover:bg-[#0A0A0A]/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-[#E5E5E5] bg-[#FAFAFA] overflow-hidden"
            >
              <nav className="flex flex-col px-4 py-4 gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#0A0A0A]"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-[#E5E5E5] my-2 mx-4" />
                <a
                  href="https://wa.me/923001234567"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-[#10B981]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Order via WhatsApp
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}

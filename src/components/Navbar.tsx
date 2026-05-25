"use client"

import { useState, useEffect, useRef, startTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBag, Menu, X, ChevronRight, MessageCircle, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from "@/lib/cart-context"
import { CartSheet } from "@/components/CartSheet"
import { MarqueeTrustStrip } from "@/components/MarqueeTrustStrip"
import { cn } from "@/lib/utils"
import { useCategories } from "@/lib/categories-context"

const MAX_NAVBAR_CATS = 4

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] as const },
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const linkStagger = {
  open: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
  closed: {},
}

const linkItem = {
  open:   { opacity: 1, x: 0,   transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
  closed: { opacity: 0, x: -12, transition: { duration: 0.2 } },
}

export function Navbar() {
  const { navbarCategories, categories } = useCategories()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { getItemCount } = useCart()
  const count = getItemCount()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const staticLinks = [{ href: "/products", label: "Collection" }]

  const navCategoryLinks = navbarCategories.slice(0, MAX_NAVBAR_CATS).map((c) => ({
    href: `/products/category/${c.slug}`,
    label: c.name,
  }))

  const allCategoryLinks = categories
    .filter((c) => c.active !== false)
    .sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99))
    .map((c) => ({ href: `/products/category/${c.slug}`, label: c.name }))

  const desktopLinks = [...staticLinks, ...navCategoryLinks]
  const mobileLinks  = [...staticLinks, ...allCategoryLinks]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { startTransition(() => setMobileOpen(false)) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handleClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false) }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [mobileOpen])

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href.split("?")[0])
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 will-change-transform bg-white/80 backdrop-blur-xl border-b",
          scrolled
            ? "border-neutral-200/60 shadow-sm"
            : "border-neutral-200/40"
        )}
      >
        <MarqueeTrustStrip />
        <div className="mx-auto flex h-16 sm:h-20 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-neutral-950 transition-transform duration-300 group-hover:scale-105">
              <span className="text-sm font-bold text-white tracking-widest">S</span>
            </div>
            <span className="font-heading text-lg sm:text-xl font-bold tracking-[0.1em] text-neutral-950 uppercase transition-colors group-hover:text-neutral-600">
              SMARTWEAR
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {desktopLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative text-[13px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 py-2",
                    active
                      ? "text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-1 h-0.5 bg-neutral-950 transition-transform duration-300 origin-left",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-1 md:flex">
            {/* WhatsApp COD Shortcut */}
            <a
              href="https://wa.me/923001234567?text=Hi!%20I%20want%20to%20place%20a%20COD%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/80 border border-emerald-500/25 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-500/40 transition-all duration-200 text-sm font-semibold"
            >
              <MessageCircle className="size-3.5" strokeWidth={1.5} />
              Order via WhatsApp
            </a>

              <Link href="/search" className="ml-1">
                <button className="flex items-center justify-center h-9 w-9 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-black/5 transition-all duration-200">
                <Search className="size-4.5" strokeWidth={1.5} />
              </button>
            </Link>

              <button
                className="relative flex items-center justify-center h-9 w-9 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-black/5 transition-all duration-200"
                onClick={() => setCartOpen(true)}
                aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
              >
              <ShoppingBag className="size-4.5" strokeWidth={1.5} />
              <AnimatePresence mode="wait">
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -right-1 -top-1 flex h-4.5 w-4.5 min-w-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(37,99,235,0.7)]"
                  >
                    {count > 9 ? "9+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">
              <Link href="/search">
                <button className="flex items-center justify-center h-10 w-10 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors">
                  <Search className="size-4.5" strokeWidth={1.5} />
                </button>
              </Link>
              <button
                className="relative flex items-center justify-center h-10 w-10 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
            >
              <ShoppingBag className="size-4.5" strokeWidth={1.5} />
              <AnimatePresence mode="wait">
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 min-w-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white"
                  >
                    {count > 9 ? "9+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
              <button
                className="flex items-center justify-center h-10 w-10 rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="size-4.5" strokeWidth={1.5} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="size-4.5" strokeWidth={1.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              ref={mobileMenuRef}
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden border-t border-black/5 glass-sheet md:hidden"
            >
              <motion.nav
                variants={linkStagger}
                initial="closed"
                animate="open"
                className="flex flex-col px-4 py-3 sm:px-6 gap-0.5"
              >
                {mobileLinks.map((link) => {
                  const active = isActive(link.href)
                  return (
                    <motion.div key={link.href} variants={linkItem}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition-colors min-h-[48px]",
                          active
                            ? "bg-blue-50/80 text-blue-600 border border-blue-500/20"
                            : "text-neutral-500 hover:bg-black/5 hover:text-neutral-900"
                        )}
                      >
                        {link.label}
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      </Link>
                    </motion.div>
                  )
                })}

                <motion.div variants={linkItem}>
                  <Link
                    href="/categories"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium text-neutral-600 hover:bg-black/5 hover:text-neutral-900 transition-colors min-h-[48px]"
                  >
                    All Categories <ChevronRight className="size-4 ml-auto" strokeWidth={1.5} />
                  </Link>
                </motion.div>

                <motion.div variants={linkItem} className="mt-2 pt-3 border-t border-black/5">
                  <a
                    href="https://wa.me/923001234567?text=Hi!%20I%20want%20to%20place%20a%20COD%20order."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-emerald-600 bg-emerald-50/80 border border-emerald-500/20 hover:bg-emerald-50 transition-colors min-h-[48px]"
                  >
                    <MessageCircle className="size-4.5" strokeWidth={1.5} />
                    Order via WhatsApp
                  </a>
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from "lucide-react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useAuth } from "@/context/auth-context"
import { categories, products, formatPrice } from "@/lib/mock-data"
import Image from "next/image"
import { SmartSearch } from "@/components/store/smart-search"

/* ── Logo ── */
function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 group shrink-0 ${className}`}>
      <motion.div
        whileHover={{ rotate: 180 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="relative"
      >
        <svg viewBox="0 0 36 36" fill="none" width={34} height={34} className="shrink-0 relative z-10">
          <rect x="12.5" y="1.5" width="11" height="4" rx="2" fill="#B8860B"/>
          <rect x="12.5" y="30.5" width="11" height="4" rx="2" fill="#B8860B"/>
          <circle cx="18" cy="18" r="14.5" fill="#0F1923" stroke="#B8860B" strokeWidth="1.5"/>
          <circle cx="18" cy="18" r="10.5" fill="#0C0F14"/>
          {[0,90,180,270].map((a,i) => (
            <line key={i}
              x1={18 + 9.5 * Math.sin(a*Math.PI/180)}
              y1={18 - 9.5 * Math.cos(a*Math.PI/180)}
              x2={18 + 7.5 * Math.sin(a*Math.PI/180)}
              y2={18 - 7.5 * Math.cos(a*Math.PI/180)}
              stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"
            />
          ))}
          <line x1="18" y1="18" x2="18" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="18" y1="18" x2="23" y2="18" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="18" cy="18" r="1.5" fill="#B8860B"/>
        </svg>
        <motion.div
          className="absolute inset-0 bg-[#B8860B] rounded-full blur-[10px] opacity-0 group-hover:opacity-40 transition-opacity"
        />
      </motion.div>
      <div className="leading-none">
        <span
          className="block text-white font-semibold group-hover:text-[#B8860B] transition-colors"
          style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "1.0625rem", letterSpacing: "-0.02em" }}
        >
          Smartwear
        </span>
        <span
          className="block text-white/70 font-medium mt-0.5"
          style={{ fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase" }}
        >
          Pakistan
        </span>
      </div>
    </Link>
  )
}

/* ── NavLink ── */
function NavLink({ href, label, isActive, gold }: { href: string, label: string, isActive: boolean, gold?: boolean }) {
  return (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-medium tracking-wide group ${
        gold ? "text-[#B8860B]" : isActive ? "text-white" : "text-white/70 hover:text-white"
      } transition-colors`}
    >
      {label}
      <span className={`absolute left-4 right-4 bottom-1 h-px bg-gradient-to-r from-[#B8860B] to-transparent origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${isActive ? "scale-x-100" : ""}`} />
    </Link>
  )
}

/* ── Badge ── */
function NavBadge({ count }: { count: number }) {
  if (!count) return null
  return (
    <motion.span
      key={count}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full font-bold bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-[#0C0F14] shadow-[0_0_10px_rgba(184,134,11,0.5)]"
      style={{ fontSize: "0.6rem", border: "2px solid #0C0F14" }}
    >
      {count > 9 ? "9+" : count}
    </motion.span>
  )
}

/* ── Announcement Text (dynamic from settings) ── */
function AnnouncementText() {
  const [text, setText] = useState("")
  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => {
        const threshold = data.free_delivery_threshold ? Number(data.free_delivery_threshold).toLocaleString() : null
        const line1 = data.announcement_line1 || ""
        const freeMsg = threshold ? `Free Delivery on Orders Over Rs. ${threshold}` : ""
        const parts = [
          data.announcement_line1?.includes("Free Delivery") ? freeMsg : data.announcement_line1,
          data.announcement_line2,
          data.announcement_line3,
        ].filter(Boolean)
        setText(parts.join(" · "))
      })
      .catch(() => setText("Free Delivery · Open Box · 100% COD"))
  }, [])
  return <>{text}</>
}

/* ══════════════════════════════
   NAVBAR
   ══════════════════════════════ */
export function PremiumNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { scrollY } = useScroll()
  
  const [searchQ, setSearchQ] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { itemCount } = useCart()
  const { itemCount: wCount } = useWishlist()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
    setScrolled(latest > 20)
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop Collection" },
    { href: "/products?sale=true", label: "Exclusive Offers", gold: true },
    { href: "/track-order", label: "Track Order" },
  ]

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="relative z-50 bg-gradient-to-r from-[#B8860B]/10 via-[#B8860B]/5 to-[#B8860B]/10 border-b border-[#B8860B]/10">
        <div className="sw-container">
          <div className="flex items-center justify-center h-9 md:h-10 px-4">
            <p className="text-[11px] md:text-xs text-white/70 font-medium tracking-wide">
              <AnnouncementText />{/* */}
            </p>
          </div>
        </div>
      </div>

      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{
          background: scrolled ? "rgba(12, 15, 20, 0.85)" : "rgba(12, 15, 20, 1)",
          backdropFilter: scrolled ? "blur(24px) saturate(150%)" : "none",
        }}
      >
        <div className="sw-container">
          <div className="flex items-center justify-between h-[80px]">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white sw-interactive"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              <Logo />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive(link.href)}
                  gold={link.gold}
                />
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 justify-end">
              {/* Search */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowSearch(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all sw-interactive group"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm">Search...</span>
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0C0F14] border border-white/5 text-[10px] font-mono opacity-50 group-hover:opacity-100 transition-opacity">
                    <span>⌘</span><span>K</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowSearch(true)}
                  className="md:hidden relative z-10 w-11 h-11 flex items-center justify-center rounded-full transition-colors sw-interactive text-white/70 hover:text-white hover:bg-white/5"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors sw-interactive"
              >
                <Heart className="w-5 h-5" />
                <NavBadge count={wCount} />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative w-11 h-11 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors sw-interactive"
              >
                <ShoppingCart className="w-5 h-5" />
                <NavBadge count={itemCount} />
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0C0F14]/95 backdrop-blur-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/70 hover:text-white bg-white/5 rounded-full sw-interactive"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 flex flex-col justify-center px-8 gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`text-3xl font-light tracking-wide ${link.gold ? 'text-[#B8860B]' : 'text-white'}`}
                    style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">Categories</div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(c => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm text-white/60 hover:text-[#B8860B] py-2 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 my-4" />
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-2xl font-bold tracking-wider text-white/60 hover:text-white"
              >
                <User className="w-6 h-6" /> Admin
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <SmartSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  )
}
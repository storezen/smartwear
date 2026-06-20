"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion"
import {
  ArrowRight, Shield, Truck, RefreshCw, CreditCard, ChevronRight,
  Zap, Star, Heart, Watch, Smartphone, Battery, Headphones,
  Package, Clock, Send, CheckCircle2, Sparkles, ChevronDown
} from "lucide-react"
import { ProductCard } from "@/components/store/premium-product-card"
import { categories as storeCategories } from "@/lib/mock-data"
import {
  buildCategoryImageMap,
  getCategoriesWithProducts,
  HOMEPAGE_CARDS_PER_SECTION,
  HOMEPAGE_CATEGORY_GROUPS,
  pickBalancedNewArrivals,
  pickBalancedProducts,
  pickFromCategory,
} from "@/lib/homepage-helpers"
import { normalizeCategorySlug, normalizeProductList } from "@/lib/normalize-product"

/* ════════════════════════════════════════════════════════
   SHARED ANIMATION VARIANTS
   ════════════════════════════════════════════════════════ */

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.1 },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const staggerItem: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[#B8860B] tracking-[0.25em] text-xs font-bold uppercase mb-3 flex items-center gap-2">
      <span className="w-8 h-[1px] bg-[#B8860B]" />
      {text}
      <span className="w-8 h-[1px] bg-[#B8860B]" />
    </p>
  )
}

const SECTION_PAD = "py-10 md:py-14"

function SectionTitle({ children, className = "", large = false }: { children: React.ReactNode; className?: string; large?: boolean }) {
  return (
    <h2
      className={`font-bold text-white ${large ? "text-3xl md:text-4xl lg:text-5xl" : "text-2xl md:text-3xl"} ${className}`}
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      {children}
    </h2>
  )
}

/* ════════════════════════════════════════════════════════
   1. HERO BANNER — Cinematic Full-Screen
   ════════════════════════════════════════════════════════ */

function HeroBanner() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 30, stiffness: 100 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)
  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15])
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], [-15, 15])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <section 
      className="relative min-h-[72svh] md:min-h-[82svh] flex items-center justify-center overflow-x-hidden bg-[#0C0F14]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] rounded-full bg-[#B8860B]/[0.04] blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[#B8860B]/[0.03] blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      <div className="sw-container relative z-10 w-full" style={{ maxWidth: "1536px" }}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-20 lg:py-32 relative z-10 mt-16 md:mt-0">
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={staggerItem} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/20 text-[#B8860B] text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" /> Pakistan&apos;s #1 Smart Watch Store
                </span>
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Elevate Your
                <br />
                <span className="bg-gradient-to-r from-[#B8860B] via-[#D4A017] to-[#B8860B] bg-clip-text text-transparent">
                  Wrist Game
                </span>
              </motion.h1>

              <motion.p variants={staggerItem} className="text-white/60 text-base md:text-lg max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Discover premium smartwatches, bands & accessories with
                <strong className="text-white"> free delivery</strong> across Pakistan.
                Pay on delivery — no risk, just style.
              </motion.p>

              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/products" className="w-full sm:w-auto sw-btn-gold px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl min-h-[44px]">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/products?category=smart-watches" className="w-full sm:w-auto sw-btn-ghost-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl min-h-[44px]">
                  Explore Collections
                </Link>
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={staggerItem} className="mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-8 justify-center lg:justify-start">
                {[
                  { value: "10K+", label: "Happy Customers" },
                  { value: "500+", label: "Products" },
                  { value: "4.9", label: "Avg Rating" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left min-w-[100px] sm:min-w-0">
                    <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{stat.value}</p>
                    <p className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Hero Watch Image */}
          <div className="order-1 lg:order-2 flex justify-center relative">
            <motion.div
              style={{ x: translateX, y: translateY }}
              className="relative w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px] lg:w-[520px] lg:h-[520px] mt-8 md:mt-0"
            >
              <div className="absolute inset-[-20px] rounded-full border border-[#B8860B]/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-[-40px] rounded-full border border-[#B8860B]/10 animate-[spin_30s_linear_infinite_reverse]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-[#B8860B]/15 blur-[60px]" />

              <Image
                src="/hero-watch-transparent.png"
                alt="Premium Smartwatch"
                fill
                className="object-contain drop-shadow-[0_20px_60px_rgba(184,134,11,0.3)] z-10"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   2. TRUST BADGES
   ════════════════════════════════════════════════════════ */

const trustBadges = [
  { icon: Truck, label: "Fast Delivery", desc: "Across Pakistan" },
  { icon: Shield, label: "1 Year Warranty", desc: "Local Support" },
  { icon: RefreshCw, label: "7-Day Returns", desc: "Easy & Hassle-Free" },
  { icon: CreditCard, label: "Cash on Delivery", desc: "Pay When You Receive" },
  { icon: CheckCircle2, label: "Secure Checkout", desc: "100% Safe Payment" },
]

function TrustBadges() {
  return (
    <section className="py-6 sm:py-8 bg-[#0A0D11] border-y border-white/5 overflow-hidden">
      <div className="sw-container">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 sm:gap-x-8 sm:gap-y-6 md:gap-x-12 lg:gap-x-16 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:flex-wrap md:justify-center">
          {trustBadges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 snap-start shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/20 flex items-center justify-center text-[#B8860B] shrink-0">
                <b.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">{b.label}</p>
                <p className="text-white/40 text-[10px]">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   3. SHOP BY CATEGORY
   ════════════════════════════════════════════════════════ */

const categoryIcons: Record<string, typeof Watch> = {
  "smart-watches": Watch,
  "analog-watches": Clock,
  "ladies-watches": Sparkles,
  "watch-bands": Heart,
  "phone-cases": Smartphone,
  "watch-cases": Shield,
  "power-banks": Battery,
  audio: Headphones,
  chargers: Zap,
  accessories: Package,
}

type ShopCategoryCard = {
  name: string
  slug: string
  image: string
  icon: typeof Watch
  description: string
}

function GroupedCategories({
  items,
  counts,
}: {
  items: ShopCategoryCard[]
  counts: Record<string, number>
}) {
  const bySlug = Object.fromEntries(items.map((c) => [c.slug, c]))

  return (
    <section className={`${SECTION_PAD} bg-[#0C0F14]`}>
      <div className="sw-container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <SectionLabel text="Browse" />
            <SectionTitle>Shop by Category</SectionTitle>
            <p className="text-white/50 text-sm mt-2 max-w-md">
              Watches, bands, cases, audio & chargers — organized the way you shop.
            </p>
          </div>
          <Link
            href="/products"
            className="text-[#B8860B] hover:text-[#D4A017] text-xs font-bold uppercase tracking-widest flex items-center gap-2 shrink-0"
          >
            Full Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-8">
          {HOMEPAGE_CATEGORY_GROUPS.map((group) => {
            const groupItems = group.slugs
              .map((slug) => bySlug[slug])
              .filter(Boolean) as ShopCategoryCard[]
            if (!groupItems.length) return null

            return (
              <div key={group.id}>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {groupItems.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <Link
                        key={cat.slug}
                        href={`/products?category=${cat.slug}`}
                        className="group flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-[#B8860B]/30 hover:bg-white/[0.04] transition-all duration-300"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                          <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="56px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                            <h3 className="text-white text-sm font-semibold truncate">{cat.name}</h3>
                          </div>
                          <p className="text-white/40 text-[11px] mt-0.5">{counts[cat.slug] ?? 0} products</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#B8860B] shrink-0 transition-colors" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   4. DISCOVER — tabbed products (Trending / New / Category)
   ════════════════════════════════════════════════════════ */

type DiscoverTab = "trending" | "new" | "category"

function ProductGrid({ products }: { products: any[] }) {
  if (!products.length) {
    return (
      <p className="text-white/40 text-sm py-12 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
        No products in this collection yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
      {products.slice(0, HOMEPAGE_CARDS_PER_SECTION).map((product: any, i: number) => (
        <motion.div
          key={product.id || i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  )
}

function DiscoverSection({
  bestsellers,
  newArrivals,
  productsByCategory,
  categoryOptions,
}: {
  bestsellers: any[]
  newArrivals: any[]
  productsByCategory: Record<string, any[]>
  categoryOptions: { slug: string; name: string }[]
}) {
  const [tab, setTab] = useState<DiscoverTab>("trending")
  const [activeCat, setActiveCat] = useState(categoryOptions[0]?.slug ?? "smart-watches")

  const viewAllHref =
    tab === "category" && activeCat
      ? `/products?category=${activeCat}`
      : "/products"

  const activeProducts =
    tab === "trending"
      ? bestsellers
      : tab === "new"
        ? newArrivals
        : productsByCategory[activeCat] ?? []

  const tabs: { id: DiscoverTab; label: string }[] = [
    { id: "trending", label: "Trending" },
    { id: "new", label: "New Arrivals" },
    { id: "category", label: "By Category" },
  ]

  return (
    <section className={`${SECTION_PAD} bg-[#080A0D] border-y border-white/5`}>
      <div className="sw-container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <SectionLabel text="Discover" />
            <SectionTitle>Curated For You</SectionTitle>
          </div>
          <Link
            href={viewAllHref}
            className="text-white/50 hover:text-[#B8860B] text-xs font-bold uppercase tracking-widest flex items-center gap-2 shrink-0"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all"
              style={{
                background: tab === t.id ? "linear-gradient(135deg, #B8860B, #D4A017)" : "rgba(255,255,255,0.03)",
                color: tab === t.id ? "#000" : "rgba(255,255,255,0.55)",
                borderColor: tab === t.id ? "transparent" : "rgba(255,255,255,0.06)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "category" && (
            <motion.div
              key="cat-chips"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-5 overflow-hidden"
            >
              {categoryOptions.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCat(cat.slug)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
                  style={{
                    background: activeCat === cat.slug ? "rgba(184,134,11,0.15)" : "transparent",
                    color: activeCat === cat.slug ? "#D4A017" : "rgba(255,255,255,0.5)",
                    borderColor: activeCat === cat.slug ? "rgba(184,134,11,0.35)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${tab}-${tab === "category" ? activeCat : tab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ProductGrid products={activeProducts} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   5. VALUE STRIP + TESTIMONIALS (compact)
   ════════════════════════════════════════════════════════ */

const testimonials = [
  {
    name: "Ahmed Khan",
    city: "Karachi",
    rating: 5,
    text: "Ordered the Ultra Sport watch and it arrived in 3 days! Quality is amazing, exactly as shown. Will definitely order again.",
    avatar: "AK",
  },
  {
    name: "Sara Malik",
    city: "Lahore",
    rating: 5,
    text: "The COD option gave me confidence. The watch exceeded my expectations — the battery lasts a full week!",
    avatar: "SM",
  },
  {
    name: "Usman Ali",
    city: "Islamabad",
    rating: 5,
    text: "Received my smartwatch with a beautiful strap. Premium packaging and gorgeous watch. 100% recommend!",
    avatar: "UA",
  },
  {
    name: "Fatima Noor",
    city: "Rawalpindi",
    rating: 4,
    text: "Great health tracking and helpful customer support when I had setup questions.",
    avatar: "FN",
  },
]

const valueProps = [
  { icon: Shield, title: "1 Year Warranty", desc: "Local support across Pakistan" },
  { icon: Truck, title: "Fast Delivery", desc: "PostEx to every major city" },
  { icon: RefreshCw, title: "7-Day Returns", desc: "Hassle-free if not satisfied" },
]

function ValueAndReviews() {
  const featured = testimonials.slice(0, 2)

  return (
    <section className={`${SECTION_PAD} bg-[#0C0F14]`}>
      <div className="sw-container space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {valueProps.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="w-11 h-11 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/20 flex items-center justify-center text-[#B8860B] shrink-0">
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{f.title}</p>
                <p className="text-white/45 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <SectionLabel text="Reviews" />
          <SectionTitle className="mb-6">Loved by Customers</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            {featured.map((t) => (
              <div
                key={t.name}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s < t.rating ? "fill-[#B8860B] text-[#B8860B]" : "text-white/20"}`} />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] flex items-center justify-center text-black text-[10px] font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   6. NEWSLETTER SIGNUP
   ════════════════════════════════════════════════════════ */

function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail("")
      setTimeout(() => setSubmitted(false), 4000)
    }
  }

  return (
    <section className={`${SECTION_PAD} bg-[#080A0D] border-t border-white/5 relative overflow-hidden`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#B8860B]/[0.04] blur-[100px] pointer-events-none" />

      <div className="sw-container relative z-10">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div variants={staggerItem}><SectionLabel text="Newsletter" /></motion.div>
          <motion.div variants={staggerItem}>
            <SectionTitle>Get New Drops & Offers</SectionTitle>
          </motion.div>
          <motion.p variants={staggerItem} className="text-white/50 mt-3 mb-6 text-sm">
            Early access to arrivals and exclusive discounts.
          </motion.p>

          <motion.form
            variants={staggerItem}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 sm:py-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-all min-h-[44px]"
            />
            <button
              type="submit"
              className="sw-btn-gold px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl shrink-0 min-h-[44px]"
            >
              {submitted ? (
                <><CheckCircle2 className="w-4 h-4" /> Subscribed!</>
              ) : (
                <><Send className="w-4 h-4" /> Subscribe</>
              )}
            </button>
          </motion.form>

          <motion.p variants={staggerItem} className="text-white/30 text-xs mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   MAIN HOMEPAGE EXPORT
   ════════════════════════════════════════════════════════ */

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        if (Array.isArray(data)) {
          setAllProducts(normalizeProductList(data))
        }
      } catch (e) {
        console.error("Failed to fetch products")
      }
      setLoading(false)
    }
    load()
  }, [])

  const categoryImageMap = useMemo(
    () => buildCategoryImageMap(allProducts),
    [allProducts]
  )

  const shopCategoryCards = useMemo<ShopCategoryCard[]>(
    () =>
      storeCategories
        .filter((cat) =>
          allProducts.some(
            (p) => normalizeCategorySlug(p.category_slug) === cat.slug && p.is_active !== false
          )
        )
        .map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          image: categoryImageMap[cat.slug] || cat.image,
          icon: categoryIcons[cat.slug] ?? Package,
          description: cat.description,
        })),
    [categoryImageMap, allProducts]
  )

  const bestsellers = useMemo(
    () =>
      pickBalancedProducts(allProducts, {
        perCategory: 1,
        maxTotal: HOMEPAGE_CARDS_PER_SECTION,
        sortFn: (a, b) => {
          if (!!a.is_featured !== !!b.is_featured) return a.is_featured ? -1 : 1
          return (b.rating || 0) - (a.rating || 0)
        },
      }),
    [allProducts]
  )

  const newArrivals = useMemo(
    () => pickBalancedNewArrivals(allProducts, 1, HOMEPAGE_CARDS_PER_SECTION),
    [allProducts]
  )

  const productsByCategory = useMemo(
    () =>
      Object.fromEntries(
        storeCategories.map((cat) => [
          cat.slug,
          pickFromCategory(allProducts, cat.slug, HOMEPAGE_CARDS_PER_SECTION),
        ])
      ) as Record<string, any[]>,
    [allProducts]
  )

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const cat of storeCategories) {
      counts[cat.slug] = allProducts.filter(
        (p) => normalizeCategorySlug(p.category_slug) === cat.slug && p.is_active !== false
      ).length
    }
    return counts
  }, [allProducts])

  const categoryOptions = useMemo(
    () => getCategoriesWithProducts(allProducts).map((c) => ({ slug: c.slug, name: c.name })),
    [allProducts]
  )

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <HeroBanner />
      <TrustBadges />
      <GroupedCategories items={shopCategoryCards} counts={categoryCounts} />
      {!loading && (
        <DiscoverSection
          bestsellers={bestsellers}
          newArrivals={newArrivals}
          productsByCategory={productsByCategory}
          categoryOptions={categoryOptions}
        />
      )}
      <ValueAndReviews />
      <NewsletterSignup />
    </div>
  )
}
"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion"
import {
  ArrowRight, Shield, Truck, RefreshCw, CreditCard, ChevronRight,
  Zap, Star, Heart, Watch, Smartphone, Battery, Headphones,
  Package, Award, Clock, Activity, HeartPulse, Wifi,
  Send, Quote, CheckCircle2, Sparkles, ChevronDown
} from "lucide-react"
import { ProductCard } from "@/components/store/premium-product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { categories as storeCategories, formatPrice } from "@/lib/mock-data"
import {
  buildCategoryImageMap,
  HOMEPAGE_CARDS_PER_SECTION,
  HOMEPAGE_SHOWCASE_PER_CATEGORY,
  HOMEPAGE_SHOWCASE_SLUGS,
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

const SECTION_PAD = "py-8 md:py-12"
const SECTION_HEAD_MB = "mb-8 md:mb-10"

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[#B8860B] tracking-[0.25em] text-xs font-bold uppercase mb-3 flex items-center gap-2">
      <span className="w-8 h-[1px] bg-[#B8860B]" />
      {text}
      <span className="w-8 h-[1px] bg-[#B8860B]" />
    </p>
  )
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white ${className}`} style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
      {children}
    </h2>
  )
}

/* ════════════════════════════════════════════════════════
   1. HERO BANNER — Series 11 flagship showcase
   ════════════════════════════════════════════════════════ */

type HeroFeatured = {
  name: string
  slug: string
  image: string
  price: number
}

const HERO_FALLBACK: HeroFeatured = {
  name: "Series 11",
  slug: "series-11-(allow-to-open-|-cash-on-delivery)",
  image: "/hero-watch-transparent.png",
  price: 5500,
}

/** Box/packaging shots and chat exports clash with the dark cinematic hero. */
const HERO_IMAGE_BLOCKLIST = /dee74f9feeac670bfa2db80404362205|screenshot|whatsapp/i

function isHeroQualityImage(url: string): boolean {
  return Boolean(url) && !HERO_IMAGE_BLOCKLIST.test(url)
}

function pickHeroImage(images: string[] | undefined): string {
  if (!images?.length) return HERO_FALLBACK.image

  const capture = images.find((u) => /\/Capture[^/?]*\.png/i.test(u) && isHeroQualityImage(u))
  if (capture) return capture

  const listing = images.find((u) => /s-l1600.*\.webp/i.test(u) && isHeroQualityImage(u))
  if (listing) return listing

  const acceptable = images.find(isHeroQualityImage)
  return acceptable || HERO_FALLBACK.image
}

const heroSpecs = [
  { icon: Activity, label: "2.05″ AMOLED" },
  { icon: Shield, label: "IP67 Rated" },
  { icon: Battery, label: "420mAh Cell" },
  { icon: Wifi, label: "BT Calling" },
]

const heroFloatChips = [
  { icon: HeartPulse, label: "Health Suite", className: "top-[8%] -left-2 md:left-0" },
  { icon: Clock, label: "Always-On", className: "top-[42%] -right-1 md:right-2" },
  { icon: Truck, label: "COD Pakistan", className: "bottom-[12%] left-[5%]" },
]

function HeroWatchFace() {
  return (
    <div className="absolute -bottom-6 -left-4 md:-left-8 z-20 w-[88px] h-[88px] md:w-[104px] md:h-[104px] rounded-[22px] bg-[#0A0D11]/90 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#B8860B]/20 via-transparent to-transparent" />
      <div className="relative p-3 h-full flex flex-col justify-between">
        <p className="text-[8px] uppercase tracking-[0.2em] text-[#B8860B] font-bold">Series 11</p>
        <p className="text-white text-xl md:text-2xl font-semibold tabular-nums leading-none" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          10:09
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-white/50">72 BPM</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function HeroBanner({ featured = HERO_FALLBACK }: { featured?: HeroFeatured }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 28, stiffness: 120 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)
  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], [-18, 18])
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], [-18, 18])
  const productHref = `/products/${encodeURIComponent(featured.slug)}`

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <section
      className="relative min-h-[90svh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#06080A]"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 72% 42%, rgba(184,134,11,0.14) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 15% 80%, rgba(184,134,11,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-[#B8860B]/25 to-transparent opacity-60" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="sw-container relative z-10 w-full" style={{ maxWidth: "1536px" }}>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 md:py-24 lg:py-28 mt-14 md:mt-0">
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={staggerItem} className="mb-5">
                <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/25 text-[#D4A017] text-[10px] md:text-xs font-bold uppercase tracking-[0.22em]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8860B] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8860B]" />
                  </span>
                  Flagship Drop · {featured.name}
                </span>
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-[2rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-white leading-[1.05] mb-5"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Thinner Profile.
                <br />
                <span className="bg-gradient-to-r from-[#B8860B] via-[#F0C75A] to-[#B8860B] bg-clip-text text-transparent">
                  Bigger Display.
                </span>
              </motion.h1>

              <motion.p variants={staggerItem} className="text-white/55 text-sm md:text-lg max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
                The <strong className="text-white font-medium">{featured.name}</strong> brings a cinematic 2.05″ always-on AMOLED face, Bluetooth calling, and IP67 durability — delivered across Pakistan with{" "}
                <strong className="text-[#D4A017]">Cash on Delivery</strong>. Open the parcel. Love it. Then pay.
              </motion.p>

              <motion.div variants={staggerItem} className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/8 mb-7">
                <span className="text-white/40 text-xs uppercase tracking-widest">From</span>
                <span className="text-white text-xl md:text-2xl font-bold" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {formatPrice(featured.price)}
                </span>
                <span className="text-[10px] text-emerald-400/90 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  In Stock
                </span>
              </motion.div>

              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href={productHref} className="w-full sm:w-auto sw-btn-gold px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl min-h-[44px]">
                  Shop {featured.name} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/products?category=smart-watches" className="w-full sm:w-auto sw-btn-ghost-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl min-h-[44px]">
                  All Smart Watches
                </Link>
              </motion.div>

              <motion.div variants={staggerItem} className="mt-8 flex flex-wrap gap-2.5 justify-center lg:justify-start">
                {heroSpecs.map((spec) => (
                  <span
                    key={spec.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/8 text-white/60 text-[11px] font-medium"
                  >
                    <spec.icon className="w-3 h-3 text-[#B8860B]" />
                    {spec.label}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center relative px-2 sm:px-0">
            <motion.div
              style={{ x: translateX, y: translateY }}
              className="relative w-[260px] h-[300px] sm:w-[340px] sm:h-[380px] md:w-[420px] md:h-[460px] lg:w-[500px] lg:h-[540px] flex items-center justify-center"
            >
              <div className="absolute inset-[8%] rounded-full bg-[#B8860B]/10 blur-[80px]" />
              <div className="absolute inset-[-16px] rounded-full border border-[#B8860B]/15 animate-[spin_24s_linear_infinite]" />
              <div className="absolute inset-[-32px] rounded-full border border-dashed border-[#B8860B]/10 animate-[spin_36s_linear_infinite_reverse]" />

              <div className="relative w-[85%] aspect-square rounded-full overflow-hidden ring-2 ring-[#B8860B]/20 ring-offset-[6px] ring-offset-[#06080A] shadow-[0_0_60px_rgba(184,134,11,0.15)]">
                <Image
                  src={featured.image}
                  alt={`${featured.name} smartwatch`}
                  fill
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 420px, 500px"
                  className="object-contain object-center drop-shadow-[0_20px_60px_rgba(184,134,11,0.3)] z-10 p-4 md:p-6"
                  priority
                />
              </div>

              <HeroWatchFace />

              {heroFloatChips.map((chip, i) => (
                <motion.div
                  key={chip.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: 0.4 + i * 0.15, duration: 0.5 },
                    y: { delay: 0.8 + i * 0.2, duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className={`absolute z-20 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0C0F14]/85 border border-white/10 backdrop-blur-md shadow-lg ${chip.className}`}
                >
                  <chip.icon className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">{chip.label}</span>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute top-4 right-2 md:right-6 z-20 px-3 py-1.5 rounded-full bg-[#B8860B] text-[#0C0F14] text-[10px] font-black uppercase tracking-[0.18em] shadow-[0_8px_24px_rgba(184,134,11,0.4)]"
              >
                New 2026
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-white/30"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Discover</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </section>
  )
}

function pickHeroFeatured(products: any[]): HeroFeatured {
  const match =
    products.find(
      (p) =>
        p.is_active !== false &&
        normalizeCategorySlug(p.category_slug) === "smart-watches" &&
        /\bseries\s*11\b/i.test(`${p.name || ""} ${p.slug || ""}`)
    ) ??
    products.find(
      (p) =>
        p.is_active !== false &&
        normalizeCategorySlug(p.category_slug) === "smart-watches" &&
        p.images?.[0]
    )

  if (!match?.images?.length) return HERO_FALLBACK

  return {
    name: "Series 11",
    slug: match.slug || HERO_FALLBACK.slug,
    image: pickHeroImage(match.images),
    price: match.price ?? HERO_FALLBACK.price,
  }
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

function ShopByCategory({ items }: { items: ShopCategoryCard[] }) {
  if (!items.length) return null

  const carouselNavClass =
    "hidden md:flex h-10 w-10 border-white/10 bg-[#0C0F14]/95 text-white hover:bg-[#B8860B] hover:text-[#0C0F14] hover:border-[#B8860B] disabled:opacity-30"

  return (
    <section className={`${SECTION_PAD} bg-[#0C0F14]`}>
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className={SECTION_HEAD_MB}
        >
          <motion.div variants={staggerItem}><SectionLabel text="Browse" /></motion.div>
          <motion.div variants={staggerItem}><SectionTitle>Shop by Category</SectionTitle></motion.div>
        </motion.div>

        <Carousel opts={{ align: "start", loop: false }} className="relative w-full px-0 md:px-6">
          <CarouselContent className="-ml-4">
            {items.map((cat, i) => (
              <CarouselItem
                key={cat.slug}
                className="pl-4 basis-[78%] sm:basis-1/2 lg:basis-1/4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="group block relative rounded-[24px] overflow-hidden border border-white/5 hover:border-[#B8860B]/30 transition-all duration-500 aspect-[4/5] sm:aspect-square lg:aspect-[3/4]"
                  >
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F14] via-[#0C0F14]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                      <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white mb-4 group-hover:bg-[#B8860B] group-hover:border-[#B8860B] group-hover:text-[#0C0F14] group-hover:-translate-y-1 transition-all duration-500 shadow-lg">
                        <cat.icon className="w-5 h-5" />
                      </div>

                      <h3
                        className="text-white text-xl font-bold mb-1 tracking-wide"
                        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                      >
                        {cat.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-6 line-clamp-1">{cat.description}</p>

                      <div className="mt-auto">
                        <span className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-xl group-hover:bg-[#B8860B] group-hover:border-[#B8860B] group-hover:text-[#0C0F14] transition-all duration-500 shadow-xl">
                          Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className={`${carouselNavClass} -left-1 lg:-left-4`} />
          <CarouselNext className={`${carouselNavClass} -right-1 lg:-right-4`} />
        </Carousel>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   4. PRODUCT SECTION (Bestsellers / New Arrivals)
   ════════════════════════════════════════════════════════ */

function ProductSection({
  label,
  title,
  products,
  badge,
  viewAllHref = "/products",
  limit = HOMEPAGE_CARDS_PER_SECTION,
}: {
  label: string
  title: string
  products: any[]
  badge?: string
  viewAllHref?: string
  limit?: number
}) {
  if (!products?.length) return null

  return (
    <section className={`${SECTION_PAD} bg-[#0C0F14]`}>
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-end ${SECTION_HEAD_MB} gap-4`}
        >
          <div>
            <motion.div variants={staggerItem}><SectionLabel text={label} /></motion.div>
            <motion.div variants={staggerItem}><SectionTitle>{title}</SectionTitle></motion.div>
          </div>
          <motion.div variants={staggerItem}>
            <Link href={viewAllHref} className="text-white/50 hover:text-[#B8860B] text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
          {products.slice(0, limit).map((product: any, i: number) => (
            <motion.div
              key={product.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="snap-start shrink-0 w-[240px] sm:w-[280px] md:w-auto"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   5. WHY CHOOSE SMARTWEAR
   ════════════════════════════════════════════════════════ */

const features = [
  { icon: Award, title: "Premium Build Quality", desc: "Handpicked watches with military-grade durability and premium materials that last." },
  { icon: HeartPulse, title: "Advanced Health Tracking", desc: "Heart rate, SpO2, sleep analysis, and 100+ sport modes to keep you at your best." },
  { icon: Battery, title: "Long Battery Life", desc: "Up to 14 days battery life so your watch works as hard as you do." },
  { icon: Shield, title: "1 Year Warranty", desc: "Full local warranty with dedicated Pakistani customer support team." },
  { icon: Truck, title: "Fast Delivery via PostEx", desc: "Reliable delivery to every city in Pakistan within 2-5 business days." },
  { icon: RefreshCw, title: "Easy 7-Day Returns", desc: "Not satisfied? Return hassle-free within 7 days, no questions asked." },
]

function WhyChooseUs() {
  return (
    <section className={`${SECTION_PAD} bg-[#080A0D] border-y border-white/5`}>
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className={SECTION_HEAD_MB}
        >
          <motion.div variants={staggerItem}><SectionLabel text="Our Promise" /></motion.div>
          <motion.div variants={staggerItem}><SectionTitle>Why Choose Smartwear?</SectionTitle></motion.div>
          <motion.p variants={staggerItem} className="text-white/50 mt-4 max-w-2xl text-sm md:text-base">
            We&apos;re not just selling watches — we&apos;re delivering confidence, reliability, and premium experiences to every customer.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-[#B8860B]/20 hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#B8860B]/10 border border-[#B8860B]/20 flex items-center justify-center text-[#B8860B] mb-5 group-hover:bg-[#B8860B] group-hover:text-black transition-all duration-300">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   6. COLLECTIONS BANNER
   ════════════════════════════════════════════════════════ */

const collectionMeta = [
  { name: "Pro Series", desc: "Built for athletes and adventurers", tag: "MOST POPULAR", slug: "smart-watches" as const },
  { name: "Classic Series", desc: "Timeless design meets modern tech", tag: "PREMIUM", slug: "analog-watches" as const },
  { name: "Sport Series", desc: "Lightweight & durable for workouts", tag: "BESTSELLER", slug: "ladies-watches" as const },
]

function CollectionsBanner({ categoryImages }: { categoryImages: Record<string, string> }) {
  const collections = collectionMeta.map((col) => ({
    ...col,
    image: categoryImages[col.slug] || storeCategories.find((c) => c.slug === col.slug)?.image || "",
    href: `/products?category=${col.slug}`,
  }))
  return (
    <section className={`${SECTION_PAD} bg-[#0C0F14]`}>
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className={SECTION_HEAD_MB}
        >
          <motion.div variants={staggerItem}><SectionLabel text="Curated" /></motion.div>
          <motion.div variants={staggerItem}><SectionTitle>Smartwatch Collections</SectionTitle></motion.div>
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-3 md:gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
          {collections.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-auto"
            >
              <Link href={col.href} className="group block relative rounded-[24px] overflow-hidden border border-white/5 hover:border-[#B8860B]/30 transition-all duration-500 aspect-[4/3]">
                <Image src={col.image} alt={col.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#B8860B]/20 border border-[#B8860B]/30 text-[#B8860B] text-[9px] font-bold uppercase tracking-widest">
                    {col.tag}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>{col.name}</h3>
                  <p className="text-white/50 text-sm mb-3">{col.desc}</p>
                  <span className="inline-flex items-center gap-2 text-[#B8860B] text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   7. CATEGORY SHOWCASE — balanced across all categories
   ════════════════════════════════════════════════════════ */

function CategoryShowcase({
  productsByCategory,
}: {
  productsByCategory: Record<string, any[]>
}) {
  const rows = HOMEPAGE_SHOWCASE_SLUGS.map((slug) => {
    const cat = storeCategories.find((c) => c.slug === slug)
    if (!cat) return null
    const products = productsByCategory[slug] ?? []
    return products.length ? { cat, products } : null
  }).filter((row): row is { cat: (typeof storeCategories)[number]; products: any[] } => row !== null)

  if (!rows.length) return null

  return (
    <section className={`${SECTION_PAD} bg-[#080A0D] border-y border-white/5`}>
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className={`flex flex-col sm:flex-row justify-between items-start sm:items-end ${SECTION_HEAD_MB} gap-4`}
        >
          <div>
            <motion.div variants={staggerItem}><SectionLabel text="Every Collection" /></motion.div>
            <motion.div variants={staggerItem}><SectionTitle>Shop All Categories</SectionTitle></motion.div>
            <motion.p variants={staggerItem} className="text-white/50 mt-3 text-sm max-w-lg">
              Top picks from our most popular lines — explore the full catalog anytime.
            </motion.p>
          </div>
          <motion.div variants={staggerItem}>
            <Link href="/products" className="text-white/50 hover:text-[#B8860B] text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0">
              Browse Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="space-y-8 md:space-y-10">
          {rows.map(({ cat, products }, rowIndex) => (
            <div key={cat.slug}>
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3
                  className="text-white text-xl md:text-2xl font-bold"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {cat.name}
                </h3>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="text-[#B8860B] hover:text-[#D4A017] text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
                >
                  View All
                </Link>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
                {products.map((product: any, i: number) => (
                  <motion.div
                    key={product.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: rowIndex * 0.05 + i * 0.08, duration: 0.5 }}
                    className="snap-start shrink-0 w-[240px] sm:w-[280px] md:w-auto"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   8. CUSTOMER TESTIMONIALS
   ════════════════════════════════════════════════════════ */

const testimonials = [
  {
    name: "Ahmed Khan",
    city: "Karachi",
    rating: 5,
    text: "Ordered the Ultra Sport watch and it arrived in 3 days! Quality is amazing, exactly as shown. Will definitely order again. Best smartwatch store in Pakistan.",
    avatar: "AK",
  },
  {
    name: "Sara Malik",
    city: "Lahore",
    rating: 5,
    text: "I was skeptical about ordering online but the COD option gave me confidence. The watch exceeded my expectations — the battery lasts a full week!",
    avatar: "SM",
  },
  {
    name: "Usman Ali",
    city: "Islamabad",
    rating: 5,
    text: "Received my smartwatch with a beautiful strap. The packaging was premium and the watch itself is absolutely gorgeous. 100% recommend Smartwear Pakistan!",
    avatar: "UA",
  },
  {
    name: "Fatima Noor",
    city: "Rawalpindi",
    rating: 4,
    text: "Great health tracking features and the customer support was really helpful when I had questions about setup. Love the gold strap I got for my watch!",
    avatar: "FN",
  },
]

function CustomerTestimonials() {
  return (
    <section className={`${SECTION_PAD} bg-[#0C0F14]`}>
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className={SECTION_HEAD_MB}
        >
          <motion.div variants={staggerItem}><SectionLabel text="Reviews" /></motion.div>
          <motion.div variants={staggerItem}><SectionTitle>What Our Customers Say</SectionTitle></motion.div>
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-[#B8860B]/20 transition-all duration-500 flex flex-col snap-start shrink-0 w-[280px] sm:w-[320px] md:w-auto"
            >
              <Quote className="w-8 h-8 text-[#B8860B]/30 mb-4 shrink-0" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s < t.rating ? "fill-[#B8860B] text-[#B8860B]" : "text-white/20"}`} />
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed flex-1 mb-6">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] flex items-center justify-center text-black text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.city}, Pakistan</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


/* ════════════════════════════════════════════════════════
   9. NEWSLETTER SIGNUP
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
            <SectionTitle>Stay Updated with New Drops & Offers</SectionTitle>
          </motion.div>
          <motion.p variants={staggerItem} className="text-white/50 mt-4 mb-8 text-sm md:text-base">
            Get early access to new arrivals, exclusive discounts, and smartwatch tips delivered to your inbox.
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
          description: cat.description ?? "",
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

  const showcaseByCategory = useMemo(
    () =>
      Object.fromEntries(
        HOMEPAGE_SHOWCASE_SLUGS.map((slug) => [
          slug,
          pickFromCategory(allProducts, slug, HOMEPAGE_SHOWCASE_PER_CATEGORY),
        ])
      ) as Record<string, any[]>,
    [allProducts]
  )

  const heroFeatured = useMemo(() => pickHeroFeatured(allProducts), [allProducts])

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <HeroBanner featured={heroFeatured} />
      <TrustBadges />
      <ShopByCategory items={shopCategoryCards} />
      {!loading && (
        <ProductSection
          label="Trending"
          title="Bestsellers"
          products={bestsellers}
          badge="Bestseller"
        />
      )}
      <CollectionsBanner categoryImages={categoryImageMap} />
      {!loading && (
        <ProductSection
          label="Fresh Drops"
          title="New Arrivals"
          products={newArrivals}
          badge="Just Arrived"
        />
      )}
      <WhyChooseUs />
      {!loading && <CategoryShowcase productsByCategory={showcaseByCategory} />}
      <CustomerTestimonials />
      <NewsletterSignup />
    </div>
  )
}
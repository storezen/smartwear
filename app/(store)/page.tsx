"use client"

import { useEffect, useState, useRef } from "react"
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
import { formatPrice } from "@/lib/mock-data"

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

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white ${className}`} style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
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
      className="relative min-h-[85svh] md:min-h-screen flex items-center justify-center overflow-x-hidden bg-[#0C0F14]"
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

const shopCategories = [
  {
    name: "Smart Watches",
    slug: "smart-watches",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
    icon: Watch,
    description: "Latest tech on your wrist",
  },
  {
    name: "Analog Watches",
    slug: "analog-watches",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop",
    icon: Clock,
    description: "Heritage timepieces",
  },
  {
    name: "Ladies Watches",
    slug: "ladies-watches",
    image: "https://images.unsplash.com/photo-1549972574-8742bba40a7a?w=800&h=600&fit=crop",
    icon: Sparkles,
    description: "Elegant & graceful designs",
  },
  {
    name: "Bands & Straps",
    slug: "watch-bands",
    image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&h=600&fit=crop",
    icon: Heart,
    description: "Style your watch your way",
  },
  {
    name: "Phone Cases",
    slug: "phone-cases",
    image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800&h=600&fit=crop",
    icon: Smartphone,
    description: "Ultimate protection",
  },
  {
    name: "Camera Protectors",
    slug: "camera-protectors",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
    icon: Shield,
    description: "Crystal clear safety",
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop",
    icon: Battery,
    description: "Keep your gear powered",
  },
]

function ShopByCategory() {
  return (
    <section className="py-8 md:py-16 lg:py-24 bg-[#0C0F14]">
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="mb-10 md:mb-14"
        >
          <motion.div variants={staggerItem}><SectionLabel text="Browse" /></motion.div>
          <motion.div variants={staggerItem}><SectionTitle>Shop by Category</SectionTitle></motion.div>
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
          {shopCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={`/products?category=${cat.slug}`} className="group block relative rounded-[24px] overflow-hidden border border-white/5 hover:border-[#B8860B]/30 transition-all duration-500 aspect-[4/5] sm:aspect-square lg:aspect-[3/4] snap-start shrink-0 w-[75vw] sm:w-auto">
                <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F14] via-[#0C0F14]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                  <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white mb-4 group-hover:bg-[#B8860B] group-hover:border-[#B8860B] group-hover:text-[#0C0F14] group-hover:-translate-y-1 transition-all duration-500 shadow-lg">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  
                  <h3 className="text-white text-xl font-bold mb-1 tracking-wide" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
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
          ))}
        </div>
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
}: {
  label: string
  title: string
  products: any[]
  badge?: string
  viewAllHref?: string
}) {
  if (!products?.length) return null

  return (
    <section className="py-8 md:py-16 lg:py-24 bg-[#0C0F14]">
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-14 gap-4"
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
          {products.slice(0, 8).map((product: any, i: number) => (
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
    <section className="py-8 md:py-16 lg:py-24 bg-[#080A0D] border-y border-white/5">
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="mb-10 md:mb-14"
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
              className="group p-8 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-[#B8860B]/20 hover:bg-white/[0.04] transition-all duration-500"
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

const collections = [
  { name: "Pro Series", desc: "Built for athletes and adventurers", tag: "MOST POPULAR", image: "https://images.unsplash.com/photo-1557438159-51eec7dbc7a1?w=600&h=400&fit=crop" },
  { name: "Classic Series", desc: "Timeless design meets modern tech", tag: "PREMIUM", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=400&fit=crop" },
  { name: "Sport Series", desc: "Lightweight & durable for workouts", tag: "BESTSELLER", image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=400&fit=crop" },
]

function CollectionsBanner() {
  return (
    <section className="py-8 md:py-16 lg:py-24 bg-[#0C0F14]">
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="mb-10 md:mb-14"
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
              <Link href="/products" className="group block relative rounded-[24px] overflow-hidden border border-white/5 hover:border-[#B8860B]/30 transition-all duration-500 aspect-[4/3]">
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
   7. ACCESSORIES HIGHLIGHT
   ════════════════════════════════════════════════════════ */

function AccessoriesHighlight({ products }: { products: any[] }) {
  const accessories = products.filter((p: any) =>
    (p.category_slug || p.category || '').toString().toLowerCase().includes('strap') ||
    (p.category_slug || p.category || '').toString().toLowerCase().includes('accessor') ||
    (p.category_slug || p.category || '').toString().toLowerCase().includes('band') ||
    (p.category_slug || p.category || '').toString().toLowerCase().includes('charger')
  )

  const displayProducts = accessories.length >= 4 ? accessories.slice(0, 4) : products.slice(-4)
  if (!displayProducts.length) return null

  return (
    <section className="py-8 md:py-16 lg:py-24 bg-[#080A0D] border-y border-white/5">
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 md:mb-14 gap-4"
        >
          <div>
            <motion.div variants={staggerItem}><SectionLabel text="Enhance" /></motion.div>
            <motion.div variants={staggerItem}><SectionTitle>Complete Your Experience</SectionTitle></motion.div>
            <motion.p variants={staggerItem} className="text-white/50 mt-3 text-sm max-w-lg">
              Premium straps, chargers, and accessories to match every style.
            </motion.p>
          </div>
          <motion.div variants={staggerItem}>
            <Link href="/products" className="text-white/50 hover:text-[#B8860B] text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shrink-0">
              Shop Accessories <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
          {displayProducts.map((product: any, i: number) => (
            <motion.div
              key={product.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
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
    <section className="py-8 md:py-16 lg:py-24 bg-[#0C0F14]">
      <div className="sw-container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="mb-10 md:mb-14"
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
    <section className="py-8 md:py-16 lg:py-24 bg-[#080A0D] border-t border-white/5 relative overflow-hidden">
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
          setAllProducts(data)
        }
      } catch (e) {
        console.error("Failed to fetch products")
      }
      setLoading(false)
    }
    load()
  }, [])

  const bestsellers = allProducts.filter((p: any) => p.is_featured || p.rating >= 4.5).slice(0, 8)
  const fallbackBestsellers = bestsellers.length >= 4 ? bestsellers : allProducts.slice(0, 8)

  const newArrivals = [...allProducts]
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <HeroBanner />
      <TrustBadges />
      <ShopByCategory />
      {!loading && (
        <ProductSection
          label="Trending"
          title="Bestsellers"
          products={fallbackBestsellers}
          badge="Bestseller"
        />
      )}
      <CollectionsBanner />
      {!loading && (
        <ProductSection
          label="Fresh Drops"
          title="New Arrivals"
          products={newArrivals}
          badge="Just Arrived"
        />
      )}
      <WhyChooseUs />
      {!loading && <AccessoriesHighlight products={allProducts} />}
      <CustomerTestimonials />
      <NewsletterSignup />
    </div>
  )
}
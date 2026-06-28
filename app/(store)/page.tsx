"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight, Shield, Truck, RefreshCw, CreditCard,
  Zap, Star, Heart, Watch, Smartphone, Battery, Headphones,
  Package, Award, Clock, Activity, HeartPulse,
  Send, Quote, CheckCircle2, Sparkles, PackageOpen, Banknote
} from "lucide-react"
import { ProductCard } from "@/components/store/premium-product-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { categories as storeCategories } from "@/lib/mock-data"
import {
  buildCategoryImageMap,
  HOMEPAGE_CARDS_PER_SECTION,
  HOMEPAGE_SHOWCASE_PER_CATEGORY,
  HOMEPAGE_SHOWCASE_SLUGS,
  pickBalancedNewArrivals,
  pickBalancedProducts,
  pickFromCategory,
  pickTopProducts,
  pickNewArrivals,
  pickCategoryProducts,
  pickAccessoriesForWatches,
} from "@/lib/homepage-helpers"
import { normalizeCategorySlug, normalizeProductList } from "@/lib/normalize-product"
import { TikTokEvents } from '@/lib/tiktok-pixel'

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

const SECTION_PAD = "py-6 md:py-12"
const SECTION_HEAD_MB = "mb-6 md:mb-10"

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
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white ${className}`} style={{ fontFamily: "var(--font-heading), 'Poppins', system-ui, sans-serif" }}>
      {children}
    </h2>
  )
}

function HeroBanner() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch('/api/public/settings').then(r => r.json()).then(setSettings).catch(() => {})
  }, [])

  return (
    <section className="relative min-h-[90svh] md:min-h-screen flex items-center overflow-hidden bg-[#06080A]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] md:w-[900px] aspect-square rounded-full bg-[#B8860B]/6 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] aspect-square rounded-full bg-[#B8860B]/3 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.4) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B8860B]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="sw-container relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-20 py-10 md:py-24 mt-0 md:mt-0">
          <div className="flex-1 text-center lg:text-left lg:max-w-[48%]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/8 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
                <span className="text-white/40 text-[11px] sm:text-[10px] uppercase tracking-[0.2em] font-medium">{settings?.hero_badge_text || "Pakistan's Premium Watch Store"}</span>
              </div>

              <h1 className="text-[2.2rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-bold text-white leading-[1.1] sm:leading-[1] mb-4 sm:mb-6" style={{ fontFamily: "var(--font-heading), 'Poppins', system-ui, sans-serif" }}>
                {settings?.hero_headline ? (
                  (() => {
                    const parts = settings.hero_headline.split('.')
                    return (
                      <>
                        {parts[0] || 'Premium Quality'}{parts[0] ? '.' : ''}
                        <br />
                        <span className="bg-gradient-to-r from-[#B8860B] via-[#F0C75A] to-[#B8860B] bg-clip-text text-transparent">
                          {parts.slice(1).join('.').trim() || 'No Premium Price'}
                        </span>
                      </>
                    )
                  })()
                ) : (
                  <>
                    Premium Quality.
                    <br />
                    <span className="bg-gradient-to-r from-[#B8860B] via-[#F0C75A] to-[#B8860B] bg-clip-text text-transparent">
                      No Premium Price.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-white/45 text-sm md:text-base max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                {settings?.hero_subtitle || "Smart Watches · Analog Classics · Premium Accessories — curated for those who value both tradition and technology."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/products" className="group sw-btn-gold px-8 py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 rounded-xl min-h-[52px]">
                  Shop Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/products?category=analog-watches" className="px-8 py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl min-h-[52px] border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all">
                  <Clock className="w-4 h-4" /> Analog Watches
                </Link>
              </div>

              <div className="mt-8 sm:mt-10 flex items-center gap-6 sm:gap-8 justify-center lg:justify-start text-white/25 text-[11px] sm:text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Truck className="w-3 h-3" /> Free Delivery</span>
                <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3" /> 7-Day Replacement</span>
                <span className="flex items-center gap-1.5"><PackageOpen className="w-3 h-3" /> Open Box Check</span>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex items-center justify-center relative w-full min-h-[40vh] md:min-h-[55vh] lg:min-h-[75vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] flex items-center justify-center">
                <div className="absolute inset-[8%] rounded-full bg-[#B8860B]/8 blur-[80px]" />
                <div className="absolute inset-0 rounded-full border border-[#B8860B]/6" />
                <div className="absolute inset-[15%] rounded-full border border-dashed border-[#B8860B]/5 animate-[spin_35s_linear_infinite]" />
                <div className="absolute inset-[30%] rounded-full border border-[#B8860B]/4" />

                <div className="absolute top-[8%] right-[8%] w-8 h-8 rounded-full bg-white/[0.03] border border-white/8 flex items-center justify-center">
                  <span className="text-white/30 text-[10px]">⚡</span>
                </div>
                <div className="absolute bottom-[12%] left-[5%] w-10 h-10 rounded-full bg-white/[0.03] border border-white/8 flex items-center justify-center">
                  <span className="text-white/30 text-xs">⌚</span>
                </div>

                <div className="relative w-[68%] aspect-square">
                  <Image
                    src="/hero-watch-transparent.png"
                    alt="Smart Watch"
                    fill
                    sizes="(max-width: 640px) 218px, (max-width: 1024px) 340px, 408px"
                    className="object-contain drop-shadow-[0_50px_120px_rgba(184,134,11,0.3)] scale-110"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}


const badgeIconMap: Record<string, React.ElementType> = {
  Truck: Truck, Shield: Shield, RefreshCw, CreditCard, CheckCircle2,
  Star: Heart, Clock: Clock, Award, Package: Package, Zap: Zap, Sparkles, Activity,
}

const trustBadgesFallback = [
  { icon: "RefreshCw", label: "7-Day Replacement", desc: "Hassle-free" },
  { icon: "CreditCard", label: "Cash on Delivery", desc: "Pay When You Receive" },
  { icon: "PackageOpen", label: "Open Box Check", desc: "Inspect before paying" },
  { icon: "Truck", label: "Nationwide Delivery", desc: "Across Pakistan" },
  { icon: "CheckCircle2", label: "Secure Checkout", desc: "100% Safe Payment" },
]

function TrustBadges() {
  const [badges, setBadges] = useState<any[] | null>(null)

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => {
        try {
          const parsed = JSON.parse(data.trust_badges || '[]')
          setBadges(parsed)
        } catch { setBadges(null) }
      })
      .catch(() => setBadges(null))
  }, [])

  const items: any[] = badges || trustBadgesFallback

  return (
    <section className="py-6 sm:py-8 bg-[#0A0D11] border-y border-white/5 overflow-hidden">
      <div className="sw-container">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 sm:gap-x-8 sm:gap-y-6 md:gap-x-12 lg:gap-x-16 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:flex-wrap md:justify-center">
          {items.map((b: any, i: number) => {
            const Icon = badgeIconMap[b.icon as keyof typeof badgeIconMap]
            return (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 snap-start shrink-0"
              >
                <div className="w-10 h-10 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/20 flex items-center justify-center text-[#B8860B] shrink-0">
                  {Icon ? <Icon className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-white text-xs font-bold">{b.label}</p>
                  <p className="text-white/40 text-[11px]">{b.desc}</p>
                </div>
            </motion.div>
          )
        })
        }
        </div>
      </div>
    </section>
  )
}

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
                        style={{ fontFamily: "var(--font-heading), 'Poppins', system-ui, sans-serif" }}
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

function ProductSection({
  label,
  title,
  products,
  badge,
  viewAllHref = "/products",
  limit = 8,
}: {
  label: string
  title: string
  products: any[]
  badge?: string
  viewAllHref?: string
  limit?: number
}) {
  const [showAll, setShowAll] = useState(false)
  const initialCount = 8
  const displayed = showAll ? products.slice(0, limit) : products.slice(0, initialCount)
  const hasMore = products.length > initialCount && !showAll

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

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {displayed.map((product: any, i: number) => (
            <motion.div
              key={product.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-8"
          >
            <button
              onClick={() => setShowAll(true)}
              className="group px-10 py-3.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 text-sm font-bold uppercase tracking-widest transition-all bg-transparent hover:bg-white/[0.03]"
            >
              Load More ({products.length - initialCount})
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

const features = [
  { icon: Award, title: "Premium Build Quality", desc: "Handpicked watches with military-grade durability and premium materials that last." },
  { icon: HeartPulse, title: "Advanced Health Tracking", desc: "Heart rate, SpO2, sleep analysis, and 100+ sport modes to keep you at your best." },
  { icon: Battery, title: "Long Battery Life", desc: "Up to 14 days battery life so your watch works as hard as you do." },
  { icon: RefreshCw, title: "7-Day Replacement", desc: "Hassle-free replacement within 7 days if anything is not right." },
  { icon: Truck, title: "Fast Delivery via PostEx", desc: "Reliable delivery to every city in Pakistan within 2-5 business days." },
  { icon: Banknote, title: "Cash on Delivery", desc: "Pay only when your parcel arrives at your doorstep. No online payment needed." },
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
              <h3 className="text-white text-lg font-bold mb-2" style={{ fontFamily: "var(--font-heading), 'Poppins', system-ui, sans-serif" }}>{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const collectionMeta = [
  { name: "Pro Series", desc: "Built for athletes and adventurers", tag: "MOST POPULAR", slug: "smart-watches" as const },
  { name: "Classic Series", desc: "Timeless design meets modern tech", tag: "PREMIUM", slug: "analog-watches" as const },
  { name: "Sport Series", desc: "Lightweight & durable for workouts", tag: "BESTSELLER", slug: "ladies-watches" as const },
]

function CollectionsBanner({
  categoryImages,
  collectionProducts,
}: {
  categoryImages: Record<string, string>
  collectionProducts: Record<string, any[]>
}) {
  const collections = collectionMeta.map((col) => ({
    ...col,
    image: categoryImages[col.slug] || storeCategories.find((c) => c.slug === col.slug)?.image || "",
    href: `/products?category=${col.slug}`,
    products: collectionProducts[col.slug] || [],
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

        <div className="space-y-10">
          {collections.map((col, i) => (
            <div key={col.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <Link href={col.href} className="group block relative rounded-[24px] overflow-hidden border border-white/5 hover:border-[#B8860B]/30 transition-all duration-500 aspect-[4/3] md:aspect-[5/2]">
                  <Image src={col.image} alt={col.name} fill sizes="100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#B8860B]/20 border border-[#B8860B]/30 text-[#B8860B] text-[10px] sm:text-[9px] font-bold uppercase tracking-widest">
                      {col.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-heading), 'Poppins', system-ui, sans-serif" }}>{col.name}</h3>
                    <p className="text-white/50 text-sm mb-3">{col.desc}</p>
                    <span className="inline-flex items-center gap-2 text-[#B8860B] text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>

              {col.products.length > 0 && (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="mt-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white/70 text-sm font-semibold uppercase tracking-widest">
                      From this collection
                    </h4>
                    <Link href={col.href} className="text-[#B8860B]/70 hover:text-[#B8860B] text-xs font-bold uppercase tracking-widest transition-colors">
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                    {col.products.map((product: any, pi: number) => (
                      <motion.div
                        key={product.id || pi}
                        variants={staggerItem}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

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
                  style={{ fontFamily: "var(--font-heading), 'Poppins', system-ui, sans-serif" }}
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

function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      TikTokEvents.subscribe(email)
    } catch {}
    setSubmitted(true)
    setEmail("")
    setTimeout(() => setSubmitted(false), 4000)
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
      pickTopProducts(allProducts, {
        maxTotal: 8,
        sortFn: (a, b) => {
          if (!!a.is_featured !== !!b.is_featured) return a.is_featured ? -1 : 1
          return (b.rating || 0) - (a.rating || 0)
        },
      }),
    [allProducts]
  )

  const newArrivals = useMemo(
    () => pickNewArrivals(allProducts, 8),
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

  const collectionProducts = useMemo(
    () => ({
      'smart-watches': pickCategoryProducts(allProducts, 'smart-watches', 4),
      'analog-watches': pickCategoryProducts(allProducts, 'analog-watches', 4),
      'ladies-watches': pickCategoryProducts(allProducts, 'ladies-watches', 4),
    }),
    [allProducts]
  )

  const watchAccessories = useMemo(
    () => pickAccessoriesForWatches(allProducts, 4),
    [allProducts]
  )

  return (
    <main className="min-h-screen bg-[#06080A]">
      <HeroBanner />
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
      <CollectionsBanner
        categoryImages={categoryImageMap}
        collectionProducts={collectionProducts}
      />
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
      {!loading && watchAccessories.length > 0 && (
        <ProductSection
          label="Complete Your Setup"
          title="Essential Accessories"
          products={watchAccessories}
          viewAllHref="/products?category=accessories"
        />
      )}
      <CustomerTestimonials />
      <NewsletterSignup />
    </main>
  )
}

"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Minus, Plus, Star, Heart, Shield, Truck, RotateCcw, ChevronRight, Zap, CheckCircle2, Banknote, PackageOpen, Clock, Lock } from 'lucide-react'
import { ProductCard } from '@/components/store/premium-product-card'
import { formatPrice } from '@/lib/mock-data'
import type { Review } from '@/types'
import { generateProductReviews, submitReview } from '@/lib/reviews-data'
import { decodeProductSlug, productApiPath, resolveProductSlug } from '@/lib/product-url'
import { useSettings } from '@/lib/use-settings'
import { useCart } from '@/context/cart-context'
import { TikTokEvents } from '@/lib/tiktok-pixel'
import { useWishlist } from '@/context/wishlist-context'
import { ProductSchema } from '@/components/store/product-schema'
import { cn } from '@/lib/utils'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { PurchaseNotification } from '@/components/store/purchase-notification'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.08 },
  }),
}

function parseDescription(html: string) {
  if (!html) return { html: '' };

  const sanitized = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*\S+/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*\S+/gi, '')

  const imgBlockRegex = /(<p[^>]*>\s*<img[^>]*>\s*<\/p>|<(?:div|span)[^>]*>\s*<img[^>]*>\s*<\/(?:div|span)>|<img[^>]*>)/gi
  const imgPositions: { index: number; end: number; block: string }[] = []
  let m: RegExpExecArray | null
  while ((m = imgBlockRegex.exec(sanitized)) !== null) {
    imgPositions.push({ index: m.index, end: m.index + m[0].length, block: m[0] })
  }

  if (imgPositions.length < 2) return { html: sanitized }

  const groups: { blocks: string[]; start: number; end: number }[] = []
  let current: { blocks: string[]; start: number; end: number } | null = null
  for (const pos of imgPositions) {
    if (current && pos.index - current.end < 100) {
      current.end = pos.end
      current.blocks.push(pos.block)
    } else {
      if (current) groups.push(current)
      current = { blocks: [pos.block], start: pos.index, end: pos.end }
    }
  }
  if (current) groups.push(current)

  let result = sanitized
  let offset = 0
  for (const g of groups) {
    if (g.blocks.length < 2) continue
    const orig = g.blocks.join('')
    const wrapped = `<div class="img-grid">${orig}</div>`
    const idx = result.indexOf(orig, g.start + offset)
    if (idx !== -1) {
      result = result.slice(0, idx) + wrapped + result.slice(idx + orig.length)
      offset += wrapped.length - orig.length
    }
  }

  return { html: result };
}

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  silver: '#C0C0C0',
  gold: '#D4A017',
  rosegold: '#B76E79',
  rose_gold: '#B76E79',
  'rose gold': '#B76E79',
  blue: '#1E3A8A',
  navy: '#1B2838',
  green: '#16A34A',
  red: '#DC2626',
  brown: '#8B4513',
  tan: '#D2B48C',
  grey: '#808080',
  gray: '#808080',
  champagne: '#F7E7CE',
  pink: '#EC4899',
  purple: '#7C3AED',
  orange: '#F59E0B',
  'stainless steel': '#C0C0C0',
  titanium: '#8C8C8C',
  leather: '#5C4033',
  silicone: '#64748B',
  midnight: '#191970',
  starlight: '#F8F6F0',
  spaceblack: '#2C2C2E',
  space_black: '#2C2C2E',
  'space black': '#2C2C2E',
  productred: '#E31837',
  product_red: '#E31837',
  yellow: '#EAB308',
}

function resolveColorHex(color: string): string {
  const key = color.toLowerCase().trim().replace(/\s+/g, '')
  return COLOR_MAP[key] || COLOR_MAP[color.toLowerCase().trim()] || '#CCCCCC'
}

function SkeletonPDP() {
  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <div className="sw-container pt-12 md:pt-16 pb-8 md:pb-12">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="aspect-[4/3] lg:aspect-auto lg:h-[600px] xl:h-[700px] w-full rounded-[24px] md:rounded-[32px] bg-white/5" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 md:w-28 aspect-square rounded-[12px] bg-white/5" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-4 w-20 bg-white/5 rounded" />
            <Skeleton className="h-8 w-3/4 bg-white/5 rounded" />
            <Skeleton className="h-6 w-1/3 bg-white/5 rounded mt-2" />
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl mt-4" />
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-48 w-full bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentlyViewed({ currentId, currentSlug }: { currentId: string; currentSlug: string }) {
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('sw_recently_viewed')
    const parsed: string[] = stored ? JSON.parse(stored) : []
    const filtered = parsed.filter(s => s !== currentSlug)
    const updated = [currentSlug, ...filtered].slice(0, 8)
    localStorage.setItem('sw_recently_viewed', JSON.stringify(updated))
  }, [currentId, currentSlug])

  useEffect(() => {
    const stored = localStorage.getItem('sw_recently_viewed')
    const slugs: string[] = stored ? JSON.parse(stored) : []
    const filtered = slugs.filter(s => s !== currentSlug).slice(0, 4)
    if (filtered.length === 0) return
    Promise.all(
      filtered.map(slug =>
        fetch(productApiPath(slug)).then(r => r.ok ? r.json() : null)
      )
    ).then(results => {
      setRecent(results.filter(Boolean))
    })
  }, [currentId, currentSlug])

  if (recent.length === 0) return null

  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mt-6 md:mt-12">
      <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#B8860B]" />
          <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Recently Viewed</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {recent.map((p) => (
          <ProductCard key={p.id} product={p as any} />
        ))}
      </div>
    </motion.div>
  )
}

export default function ProductPage() {
  const params = useParams()
  const slug = resolveProductSlug(decodeProductSlug((params.slug as string) || ''))
  const [product, setProduct] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading')
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setProduct(null)
      setRelatedProducts([])

      try {
        const res = await fetch(productApiPath(slug))
        if (res.ok) {
          const realProduct = await res.json()
          if (!cancelled) {
            setProduct(realProduct)
            setStatus('ready')

            if (realProduct.category_slug) {
              try {
                const catRes = await fetch(`/api/products?category=${realProduct.category_slug}`)
                if (catRes.ok) {
                  const allCat = await catRes.json()
                  const filtered = (Array.isArray(allCat) ? allCat : []).filter(
                    (p: any) => p.id !== realProduct.id
                  ).slice(0, 4)
                  if (!cancelled) setRelatedProducts(filtered)
                }
              } catch {}
            }
          }
          return
        }
      } catch {}

      if (!cancelled) setStatus('not-found')
    }

    load()
    return () => { cancelled = true }
  }, [slug])

  if (status === 'loading') {
    return <SkeletonPDP />
  }

  if (status === 'not-found' || !product) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-[#B8860B] text-xs font-bold uppercase tracking-[0.25em] mb-3">Not Found</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-heading), 'Poppins', system-ui, sans-serif" }}>
            This timepiece isn&apos;t in our catalog
          </h1>
          <p className="text-white/55 text-sm mb-4 md:mb-8">
            The link may be outdated or the product was removed. Browse the collection to find your next watch.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 sw-btn-gold px-6 py-3.5 text-sm font-bold uppercase tracking-widest rounded-xl"
          >
            Shop Collection <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return <ProductContent product={product} relatedProducts={relatedProducts} slug={slug} />
}

function ProductContent({ product, relatedProducts, slug }: { product: any; relatedProducts: any[]; slug: string }) {
  const router = useRouter()
  const { settings } = useSettings()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product?.id || '')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const slideDir = useRef(1)
  const thumbsRef = useRef<HTMLDivElement>(null)

  const goToImage = (idx: number) => {
    const total = product?.images?.length || 1
    const next = ((idx % total) + total) % total
    slideDir.current = next > selectedImage ? 1 : -1
    setSelectedImage(next)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      const total = product?.images?.length || 1
      const next = dx < 0 ? selectedImage + 1 : selectedImage - 1
      goToImage(next)
    }
  }

  useEffect(() => {
    if (!thumbsRef.current) return
    const active = thumbsRef.current.children[selectedImage] as HTMLElement
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedImage])

  const [viewers] = useState(() => Math.floor(Math.random() * 25) + 12)
  const stockLeft = product.stock

  const [lumeMode, setLumeMode] = useState(false)
  const productColors = product?.specifications?._colors || product?.colors || []
  const [selectedColor, setSelectedColor] = useState<string | null>(productColors[0] || null)

  const { html: descriptionHtml } = useMemo(() => parseDescription(product?.description || ''), [product?.description])
  const heroRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768)
    const handleResize = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (product) TikTokEvents.viewContent(product, product.category?.name || '')
  }, [product])

  const reviews = useMemo(() =>
    generateProductReviews(
      product.id || '',
      product.category_slug || '',
      product.rating || 4.5,
      product.reviews_count || 10
    ),
    [product.id, product.category_slug, product.rating, product.reviews_count]
  )
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ user_name: "", rating: 5, comment: "" })
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent')
  useEffect(() => setAllReviews(reviews), [reviews])
  const sortedReviews = useMemo(() => {
    const sorted = [...allReviews]
    if (sortBy === 'highest') sorted.sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'lowest') sorted.sort((a, b) => a.rating - b.rating)
    else sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return sorted
  }, [allReviews, sortBy])
  const displayedReviews = sortedReviews
  const recommendPct = allReviews.length > 0
    ? Math.max(62, Math.round((allReviews.filter(r => r.rating >= 4).length / allReviews.length) * 100))
    : 82

  const handleSubmitReview = () => {
    if (!reviewForm.user_name.trim() || !reviewForm.comment.trim()) {
      toast.error("Please fill in your name and review")
      return
    }
    const newReview = submitReview({
      product_id: product.id || '',
      user_id: '',
      user_name: reviewForm.user_name.trim(),
      rating: reviewForm.rating,
      title: '',
      comment: reviewForm.comment.trim(),
    })
    setAllReviews(prev => [newReview, ...prev])
    setShowReviewForm(false)
    setReviewForm({ user_name: "", rating: 5, comment: "" })
    toast.success("Your review has been submitted! Thank you.")
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const specs = Object.entries(product.specifications || {})

  const trustBadges = useMemo(() => {
    try {
      if (settings?.trust_badges) {
        const parsed = typeof settings.trust_badges === 'string' ? JSON.parse(settings.trust_badges) : settings.trust_badges
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [
      { label: 'Free Delivery', icon: 'Truck', detail: 'Across Pakistan — no minimum order' },
      { label: 'Cash on Delivery', icon: 'Banknote', detail: 'Pay when you receive' },
      { label: '7-Day Replacement', icon: 'RotateCcw', detail: 'Hassle-free replacement' },
      { label: 'Open Box Check', icon: 'PackageOpen', detail: 'Inspect before paying' },
    ]
  }, [settings])

  const handleQuickBuy = () => {
    setIsAddingToCart(true)
    addToCart(product, quantity, selectedColor || undefined)
    setTimeout(() => {
      router.push('/checkout')
    }, 300)
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor || undefined)
    toast.success(`Added to cart!`, {
      description: `${product.name} x${quantity} added to your cart`,
      action: {
        label: 'View Cart',
        onClick: () => router.push('/checkout'),
      },
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isDesktop) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  const iconMap: Record<string, any> = {
    Truck, Banknote, RotateCcw, PackageOpen, Shield, Lock, CheckCircle2, RefreshCw: RotateCcw,
  }

  const renderBadgeIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Shield
    return <Icon className="w-4 h-4 text-[#B8860B]" />
  }

  return (
    <div className={cn("min-h-screen text-white overflow-x-hidden w-full max-w-full transition-colors duration-1000", lumeMode ? "bg-[#000000]" : "bg-[#0C0F14]")}>
      <ProductSchema product={product} />
      <div className={cn("fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-all duration-1000", lumeMode ? "opacity-[0.1] bg-emerald-500" : "opacity-[0.15] bg-[#B8860B]")} />
      <div className={cn("fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none transition-all duration-1000", lumeMode ? "opacity-[0.05] bg-green-400" : "opacity-[0.1] bg-[#D4A017]")} />

      <div className="sw-container pt-12 md:pt-16 pb-2 md:pb-3 relative z-10">
        <motion.div
          initial="hidden" animate="show" variants={fadeUp} custom={0}
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[10px] text-white/70 uppercase tracking-[0.15em] sm:tracking-[0.2em] w-full"
        >
          <Link href="/" className="hover:text-[#B8860B] transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
          <Link href="/products" className="hover:text-[#B8860B] transition-colors shrink-0">Shop</Link>
          <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
          <span className="text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md" title={product.name}>{product.name}</span>
        </motion.div>
      </div>

      <div className="sw-container pb-8 md:pb-12 relative z-10" ref={heroRef}>
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">

          {/* LEFT: Cinematic Image Gallery */}
          <motion.div
            initial="hidden" animate="show" variants={scaleIn}
            className="lg:col-span-7 flex flex-col gap-6 perspective-[2000px] min-w-0 w-full"
          >
            {/* Main Image with Zoom */}
            <SpotlightCard className={cn("aspect-[4/3] md:aspect-square lg:aspect-auto lg:h-[600px] xl:h-[700px] relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden p-1 transition-colors duration-1000", lumeMode ? "bg-black/50 border border-emerald-500/20" : "bg-white/[0.02] border-white/5")}>
              <motion.div
                ref={imageRef}
                style={{ y: imageY, scale: imageScale }}
                className={cn("relative w-full h-full rounded-[20px] md:rounded-[28px] overflow-hidden transition-shadow duration-700 transform-gpu cursor-crosshair", lumeMode ? "bg-black shadow-[0_0_80px_rgba(16,185,129,0.3)]" : "bg-[#0C0F14]")}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => isDesktop && setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  onClick={() => setLumeMode(!lumeMode)}
                  className="absolute top-6 right-6 z-50 bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-black/60 hover:scale-110 transition-all group"
                  title="Toggle Lume Mode (Night Glow)"
                >
                  <Zap className={cn("w-5 h-5 transition-all duration-700", lumeMode ? "fill-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "text-white/70 group-hover:text-white")} />
                </button>
                <AnimatePresence custom={slideDir.current}>
                  <motion.div
                    key={selectedImage}
                    custom={slideDir.current}
                    initial={{ opacity: 0, x: slideDir.current * 120 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: slideDir.current * -120 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-transparent via-transparent to-[#0C0F14]/5 pointer-events-none" />
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      fill
                      priority
                      className={cn("object-cover transition-all duration-1000", lumeMode && "drop-shadow-[0_0_20px_rgba(52,211,153,0.6)] saturate-150 brightness-110 contrast-125")}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {isDesktop && isZooming && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 120px at ${zoomPos.x}% ${zoomPos.y}%, transparent 0%, rgba(0,0,0,0.4) 100%)`,
                    }}
                  />
                )}

                {isDesktop && isZooming && (
                  <div
                    className="absolute z-30 w-[280px] h-[280px] rounded-full border-2 border-[#B8860B]/40 shadow-[0_0_30px_rgba(184,134,11,0.2)] pointer-events-none overflow-hidden bg-[#0C0F14]"
                    style={{
                      left: `calc(${zoomPos.x}% - 140px)`,
                      top: `calc(${zoomPos.y}% - 140px)`,
                    }}
                  >
                    <Image
                      src={product.images[selectedImage]}
                      alt="Zoom"
                      width={280}
                      height={280}
                      className="absolute object-cover"
                      style={{
                        width: '400%',
                        height: '400%',
                        maxWidth: 'none',
                        left: `${-zoomPos.x * 3.6}%`,
                        top: `${-zoomPos.y * 3.6}%`,
                      }}
                    />
                  </div>
                )}

                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                  {discount > 0 && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg transition-colors", lumeMode ? "bg-emerald-500 text-black" : "bg-[#B8860B] text-[#0C0F14]")}>
                      Save {discount}%
                    </motion.div>
                  )}
                  {product.is_featured && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      Premium
                    </motion.div>
                  )}
                </div>

                {/* Mobile dot indicators */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 md:hidden">
                    {product.images.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => goToImage(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === selectedImage
                            ? "bg-[#B8860B] w-4"
                            : "bg-white/40 hover:bg-white/70"
                        )}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </SpotlightCard>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div ref={thumbsRef} className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 hide-scrollbar mt-2 w-full">
                {product.images.map((img: string, idx: number) => (
                  <SpotlightCard key={idx} className={cn("p-1 shrink-0 w-20 md:w-28 transition-colors duration-1000", lumeMode ? "bg-black/50 border border-emerald-500/20" : "")}>
                    <button
                      onClick={() => goToImage(idx)}
                      className={cn(
                        "relative protected-img aspect-square w-full rounded-[12px] md:rounded-[14px] overflow-hidden sw-interactive snap-start transition-colors duration-1000 flex items-center justify-center",
                        lumeMode ? "bg-black" : "bg-transparent",
                        selectedImage === idx ? (lumeMode ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-black" : "ring-2 ring-[#B8860B] ring-offset-2 ring-offset-[#0C0F14]") : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
                    </button>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Floating Product Info Panel */}
          <div className="lg:col-span-5 pb-16 md:pb-0 min-w-0 w-full">
            <div className="md:sticky md:top-32 flex flex-col space-y-6 md:space-y-8">
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={1}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#B8860B] text-xs font-bold uppercase tracking-[0.2em]">{product.brand}</span>
                  <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    <Star className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
                    <span className="text-xs font-semibold text-white">{product.rating}</span>
                    <span className="text-xs text-white/60">({product.reviews_count})</span>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 text-white/80 bg-white/5 border border-white/10 w-fit px-3 py-1.5 rounded-full text-xs font-medium tracking-wide mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="font-bold text-white mr-0.5">{viewers}</span>
                  <span className="whitespace-nowrap">people are viewing this right now</span>
                </motion.div>

                <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug tracking-wide" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>
                  {product.name}
                </h1>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-baseline gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                      className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#B8860B] to-[#D4A017]"
                    >
                      {formatPrice(product.price)}
                    </motion.div>
                    {product.compare_price && (
                      <span className="text-lg text-white/60 line-through decoration-white/20">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="bg-[#B8860B]/10 border border-[#B8860B]/30 text-[#D4A017] text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ml-auto">
                        You Save {discount}%
                      </span>
                    )}
                  </div>

                  {stockLeft > 0 && stockLeft <= 5 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] md:text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-red-400 shrink-0" /> High Demand
                        </span>
                        <span className="text-[11px] md:text-xs text-white/80">Only <strong className="text-white">{stockLeft} left</strong>!</span>
                      </div>
                      <div className="w-full bg-[#0F1923] h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "100%" }} animate={{ width: `${(stockLeft / (stockLeft + 15)) * 100}%` }} transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Status / Shipping mini banner (from settings) */}
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3} className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-[#B8860B]/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#B8860B]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Status</p>
                    <p className="text-sm font-semibold text-white">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-full bg-[#B8860B]/20 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-[#B8860B]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/70">Shipping</p>
                    <p className="text-sm font-semibold text-white">
                      Free — All Pakistan
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Trust & Guarantees (from settings) */}
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3} className="grid grid-cols-2 gap-y-5 gap-x-2 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                {trustBadges.map((badge: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-white">
                      {renderBadgeIcon(badge.icon || '')}
                      <span className="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
                    </div>
                    <span className="text-[11px] sm:text-[10px] text-white/50 pl-6 leading-tight">{badge.detail || ''}</span>
                  </div>
                ))}
              </motion.div>

              {/* Color Selection with Swatches */}
              {productColors.length > 0 && (
                <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3.5} className="space-y-3">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    Select Color: <span className="text-white ml-1">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {productColors.map((color: string) => {
                      const hex = resolveColorHex(color)
                      const isSelected = selectedColor === color
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-300 min-w-[64px]",
                            isSelected
                              ? "bg-[#B8860B]/10 border-[#B8860B] text-[#D4A017] shadow-[0_0_15px_rgba(184,134,11,0.2)]"
                              : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/30"
                          )}
                        >
                          <span
                            className={cn(
                              "w-6 h-6 rounded-full border border-white/20 shrink-0",
                              isSelected && "ring-2 ring-[#B8860B] ring-offset-2 ring-offset-[#0C0F14]"
                            )}
                            style={{ backgroundColor: hex }}
                          />
                          <span className="capitalize text-[10px] leading-tight mt-0.5">{color}</span>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#B8860B] rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-2.5 h-2.5 text-[#0C0F14]" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Quantity & Actions */}
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={4} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-[#0F1923] border border-white/10 rounded-xl p-1 h-12">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors sw-interactive" aria-label="Decrease quantity">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-white">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors sw-interactive" aria-label="Increase quantity">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
                    className={cn(
                      "w-12 h-12 rounded-xl border flex items-center justify-center transition-all sw-interactive shrink-0",
                      isWishlisted ? "bg-[#B8860B]/10 border-[#B8860B] text-[#B8860B]" : "bg-[#0F1923] border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20"
                    )}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={cn("w-5 h-5 transition-all", isWishlisted && "fill-current scale-110")} />
                  </button>

                </div>

                <button
                  onClick={handleQuickBuy}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="group relative w-full h-16 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4A017] overflow-hidden shadow-[0_0_30px_rgba(184,134,11,0.3)] hover:shadow-[0_0_40px_rgba(184,134,11,0.5)] transition-all sw-interactive disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <div className="relative flex flex-col items-center justify-center h-full">
                    <div className="flex items-center gap-3 text-[#0C0F14] font-bold text-base uppercase tracking-widest">
                      {isAddingToCart ? (
                        <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Adding...</>
                      ) : (
                        <><Truck className="w-5 h-5" /> Quick Buy — Pay on Delivery</>
                      )}
                    </div>
                    <span className="text-[#0C0F14]/70 text-[10px] font-medium tracking-widest uppercase mt-0.5">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs (with Reviews integrated) */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={6} className="mt-8 lg:mt-12 pb-12 md:pb-0">
          {/* Tab Navigation */}
          <div className="p-1 rounded-2xl bg-white/[0.02] border border-white/10 w-fit mb-3 md:mb-4 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-1">
              {[
                { key: 'description' as const, label: 'Description' },
                { key: 'specs' as const, label: 'Specifications' },
                { key: 'reviews' as const, label: `Reviews (${allReviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "relative px-4 sm:px-6 py-3 text-xs font-semibold tracking-widest uppercase rounded-xl transition-all whitespace-nowrap sw-interactive",
                    activeTab === tab.key
                      ? "text-[#0C0F14] bg-gradient-to-r from-[#B8860B] to-[#D4A017] shadow-[0_4px_16px_rgba(184,134,11,0.3)]"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div key="description" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <div className="max-w-none">
                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {specs.slice(0, 4).map(([k, v]) => (
                          <span key={k} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white/70 text-xs font-medium">
                            <span className="text-white/40 capitalize">{k.replace(/_/g, ' ')}: </span>
                            {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div
                      className="description-content text-white/70 leading-[1.75] text-sm md:text-base
                      [&_h1]:text-xl [&_h1]:font-light [&_h1]:tracking-wide [&_h1]:text-white/90 [&_h1]:mt-10 [&_h1]:mb-5
                      [&_h2]:text-lg [&_h2]:font-light [&_h2]:tracking-wide [&_h2]:text-white/85 [&_h2]:mt-10 [&_h2]:mb-4
                      [&_h3]:text-base [&_h3]:font-normal [&_h3]:tracking-wide [&_h3]:text-white/80 [&_h3]:mt-8 [&_h3]:mb-3
                      [&_h4]:text-sm [&_h4]:font-normal [&_h4]:text-white/75 [&_h4]:mt-6 [&_h4]:mb-3
                      [&_p]:mb-5 [&_p]:leading-[1.75]
                      [&_ul]:list-none [&_ul]:pl-0 [&_ul]:mb-5 [&_ul]:space-y-2
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_ol]:space-y-1.5
                      [&_li]:text-white/65 [&_li]:pl-0
                      [&_ul_li]:relative [&_ul_li]:pl-4
                      [&_ul_li:before]:content-['—'] [&_ul_li:before]:absolute [&_ul_li:before]:left-0 [&_ul_li:before]:text-white/30
                      [&_strong]:text-white/90 [&_strong]:font-medium
                      [&_a]:text-[#B8860B] [&_a]:hover:text-[#D4A017] [&_a]:no-underline [&_a]:border-b [&_a]:border-white/10 [&_a]:hover:border-[#D4A017]/50 [&_a]:transition-colors
[&_.img-grid]:columns-2 [&_.img-grid]:md:columns-3 [&_.img-grid]:gap-4 [&_.img-grid]:my-6 [&_.img-grid]:space-y-2 [&_.img-grid]:md:space-y-3
[&_.img-grid_img]:!my-0 [&_.img-grid_img]:!rounded-lg [&_.img-grid_img]:!shadow-sm [&_.img-grid_img]:!border [&_.img-grid_img]:!border-white/[0.06] [&_.img-grid_img]:!w-full [&_.img-grid_img]:!h-auto [&_.img-grid_img]:!object-contain [&_.img-grid_img]:break-inside-avoid [&_.img-grid>*]:break-inside-avoid [&_.img-grid_p]:!mb-0 [&_.img-grid_p]:!mt-0
                      [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-6 [&_img]:shadow-sm [&_img]:border [&_img]:border-white/[0.06] [&_img]:opacity-95 [&_img]:hover:opacity-100 [&_img]:transition-opacity
                      [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:text-sm
                      [&_table_td]:border-b [&_table_td]:border-white/[0.06] [&_table_td]:px-4 [&_table_td]:py-3.5 [&_table_td]:text-white/65 [&_table_td]:align-top
                      [&_table_th]:border-b [&_table_th]:border-white/[0.08] [&_table_th]:px-4 [&_table_th]:py-3.5 [&_table_th]:text-left [&_table_th]:text-xs [&_table_th]:font-medium [&_table_th]:tracking-widest [&_table_th]:uppercase [&_table_th]:text-white/40
                      [&_tr]:border-none
                      [&_table_td:first-child]:text-white/80 [&_table_td:first-child]:font-medium
                      [&_div.product-description]:space-y-3
                      [&_span]:text-white/65"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  </div>
                </motion.div>
              )}
              {activeTab === 'specs' && (
                <motion.div key="specs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  {specs.length > 0 ? (
                    <div className="max-w-3xl rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
                      {specs.map(([k, v], i) => (
                        <div
                          key={k}
                          className={cn(
                            "flex items-center justify-between px-5 py-4 md:px-6 md:py-4",
                            i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                          )}
                        >
                          <span className="text-white/50 text-sm capitalize">{k.replace(/_/g, ' ')}</span>
                          <span className="text-white font-medium text-sm text-right ml-4">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-3xl p-10 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
                      <p className="text-white/50 text-sm">No specifications available for this product.</p>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <div className="max-w-3xl space-y-5">
                    {/* Reviews Summary */}
                    <div className="flex items-center justify-between flex-wrap gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-[#B8860B]">{product.rating}</div>
                          <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={cn("w-3 h-3", s <= Math.round(product.rating || 0) ? "fill-[#B8860B] text-[#B8860B]" : "fill-white/10 text-white/10")} />
                            ))}
                          </div>
                          <span className="text-[11px] text-white/50 mt-1 block">{allReviews.length} reviews</span>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-white/10" />
                        <div className="hidden sm:block">
                          <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full">{recommendPct}% of customers recommend this</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-white/5 border border-white/10 text-[10px] text-white/70 rounded-lg px-2 h-8 outline-none focus:border-[#B8860B] transition-colors"
                        >
                          <option value="recent" className="bg-[#0C0F14]">Most Recent</option>
                          <option value="highest" className="bg-[#0C0F14]">Highest Rated</option>
                          <option value="lowest" className="bg-[#0C0F14]">Lowest Rated</option>
                        </select>
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="sw-btn-gold px-4 h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg whitespace-nowrap"
                        >
                          + Write Review
                        </button>
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-3">
                      {displayedReviews.slice(0, showAllReviews ? 50 : 5).map((rev) => (
                        <div key={rev.id} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                          <div className="w-9 h-9 rounded-full bg-[#B8860B]/20 flex items-center justify-center text-[#B8860B] font-bold text-sm shrink-0">
                            {rev.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-white truncate max-w-[150px]">{rev.user_name}</p>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3", i < rev.rating ? "fill-[#B8860B] text-[#B8860B]" : "fill-white/5 text-white/10")} />
                                ))}
                              </div>
                              {rev.is_verified && (
                                <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">Verified Purchase</span>
                              )}
                              {rev.helpful_count != null && rev.helpful_count > 0 && (
                                <span className="text-[10px] text-white/40">👍 {rev.helpful_count}</span>
                              )}
                            </div>
                            <p className="text-sm text-white/60 mt-1 line-clamp-3 leading-relaxed">{rev.comment}</p>
                            <p className="text-[10px] text-white/30 mt-1.5">{new Date(rev.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {allReviews.length > 5 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="w-full py-3 text-xs font-semibold text-[#B8860B] hover:text-[#D4A017] transition-colors border border-white/10 rounded-xl hover:bg-white/5"
                      >
                        {showAllReviews ? "Show Less" : `View All ${allReviews.length} Reviews`}
                      </button>
                    )}

                    {/* Write Review Form */}
                    {showReviewForm && (
                      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-white">Share Your Experience</p>
                          <button
                            onClick={() => { setShowReviewForm(false); setReviewForm({ user_name: "", rating: 5, comment: "" }) }}
                            className="text-[11px] text-white/40 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                        <input
                          type="text"
                          value={reviewForm.user_name}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, user_name: e.target.value }))}
                          placeholder="Your name"
                          className="w-full h-10 px-3 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#B8860B] outline-none transition-all"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/50">Rating:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((s) => (
                              <button key={s} type="button" onClick={() => setReviewForm(prev => ({ ...prev, rating: s }))}>
                                <Star className={cn("w-6 h-6 transition-all", s <= reviewForm.rating ? "fill-[#B8860B] text-[#B8860B]" : "fill-white/10 text-white/10 hover:fill-[#B8860B]/30")} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder={reviewForm.rating >= 4 ? "Apna experience share karein..." : "Kya improve kar sakte hain?"}
                          rows={3}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-[#B8860B] outline-none transition-all resize-none"
                        />
                        <button
                          onClick={handleSubmitReview}
                          className="sw-btn-gold px-6 h-10 text-xs font-bold uppercase tracking-widest rounded-lg"
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Related Products (from API) */}
        {relatedProducts.length > 0 && (
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mt-8 md:mt-16">
            <div className="flex items-center justify-between mb-4 md:mb-6 border-b border-white/5 pb-3">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Complete Your Collection</h3>
              <Link href={`/products?category=${product.category_slug}`} className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors sw-interactive font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed currentId={product.id} currentSlug={slug} />
      </div>

      <PurchaseNotification productName={product.name} />

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0C0F14]/90 backdrop-blur-xl border-t border-white/10 p-4 md:hidden pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={handleQuickBuy}
          disabled={product.stock === 0 || isAddingToCart}
          className="group relative w-full h-14 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4A017] overflow-hidden shadow-[0_0_20px_rgba(184,134,11,0.3)] disabled:opacity-50 flex items-center justify-center sw-interactive"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative z-10 flex items-center justify-center gap-2 sm:hidden text-[#0C0F14] font-bold uppercase tracking-widest">
            {isAddingToCart ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <Truck className="w-4 h-4 shrink-0" />
            )}
            <span className="text-[13px]">{isAddingToCart ? 'Adding...' : 'Quick Buy — COD'}</span>
            <span className="text-sm font-black ml-auto">{formatPrice(product.price * quantity)}</span>
          </div>
          <div className="relative z-10 hidden sm:flex items-center justify-center gap-3 text-[#0C0F14] font-bold text-xs uppercase tracking-widest">
            {isAddingToCart ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Adding...</>
            ) : (
              <><Truck className="w-4 h-4" /><span>Quick Buy — Pay on Delivery</span><span className="text-sm font-black">{formatPrice(product.price * quantity)}</span></>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

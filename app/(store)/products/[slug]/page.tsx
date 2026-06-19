"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Minus, Plus, Star, Heart, ShoppingBag, Shield, Truck, RotateCcw, ChevronRight, Zap, CheckCircle2, Banknote } from 'lucide-react'
import { ProductCard } from '@/components/store/premium-product-card'
import { getProductBySlug as getProductBySlugMock, getReviewsByProduct, formatPrice, products } from '@/lib/mock-data'

import { useCart } from '@/context/cart-context'
import { TikTokEvents } from '@/lib/tiktok-pixel'
import { cn } from '@/lib/utils'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { QuickBuyModal } from '@/components/store/quick-buy-modal'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.08 },
  }),
}

function parseDescription(html: string) {
  if (!html) return { textOnlyHtml: '', images: [] };
  
  const images: string[] = [];
  const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/gi;
  
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  
  // Remove images from HTML
  let textOnlyHtml = html.replace(/<img[^>]*>/gi, '');
  
  // Clean up empty paragraph tags that wrapped the images
  textOnlyHtml = textOnlyHtml.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
  
  return { textOnlyHtml, images };
}

const scaleIn: any = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${resolvedParams.slug}`)
        if (res.ok) {
          const realProduct = await res.json()
          setProduct(realProduct)
        } else {
          throw new Error('Not found')
        }
      } catch (err) {
        const mock = getProductBySlugMock(resolvedParams.slug)
        setProduct(mock)
      }
    }
    load()
  }, [resolvedParams.slug])

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0C0F14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-transparent"
            style={{ borderTopColor: '#D4A017', borderRightColor: '#B8860B' }}
          />
          <p className="text-white/60 text-sm tracking-widest uppercase">Loading Timepiece…</p>
        </div>
      </div>
    )
  }

  return <ProductContent product={product} />
}

function ProductContent({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false)
  
  // Psychological Triggers (FOMO & Urgency)
  const [viewers] = useState(() => Math.floor(Math.random() * 25) + 12)
  const [stockLeft] = useState(() => (product.stock > 10 ? Math.floor(Math.random() * 6) + 3 : product.stock))
  


  // Innovation: Lume Mode State (Glow in the dark)
  const [lumeMode, setLumeMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(product?.colors?.[0] || null)
  
  const { textOnlyHtml, images: descriptionImages } = useMemo(() => parseDescription(product?.description || ''), [product?.description])
  const heroRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  useEffect(() => {
    if (product) TikTokEvents.viewContent(product)
  }, [product])

  const reviews = getReviewsByProduct(product.id || '')
  // Mock related products
  const relatedProducts = products.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 4)

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const handleAddToCart = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return
    }
    addToCart(product, quantity, selectedColor || undefined)
    TikTokEvents.addToCart(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2200)
  }

  const specs = Object.entries(product.specifications || {})

  return (
    <div className={cn("min-h-screen text-white overflow-x-hidden w-full max-w-full transition-colors duration-1000", lumeMode ? "bg-[#000000]" : "bg-[#0C0F14]")}>
      {/* Background glow elements */}
      <div className={cn("fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] pointer-events-none transition-all duration-1000", lumeMode ? "opacity-[0.1] bg-emerald-500" : "opacity-[0.15] bg-[#B8860B]")} />
      <div className={cn("fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] pointer-events-none transition-all duration-1000", lumeMode ? "opacity-[0.05] bg-green-400" : "opacity-[0.1] bg-[#D4A017]")} />

      {/* Breadcrumb */}
      <div className="sw-container pt-28 pb-4 relative z-10">
        <motion.div
          initial="hidden" animate="show" variants={fadeUp} custom={0}
          className="flex flex-wrap items-center gap-2 text-[10px] text-white/70 uppercase tracking-[0.2em] w-full"
        >
          <Link href="/" className="hover:text-[#B8860B] transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
          <Link href="/products" className="hover:text-[#B8860B] transition-colors shrink-0">Shop</Link>
          <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
          <span className="text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md" title={product.name}>{product.name}</span>
        </motion.div>
      </div>

      <div className="sw-container pb-24 relative z-10" ref={heroRef}>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LEFT: Cinematic Image Gallery */}
          <motion.div
            initial="hidden" animate="show" variants={scaleIn}
            className="lg:col-span-7 flex flex-col gap-6 perspective-[2000px] min-w-0 w-full"
          >
            {/* Main Image */}
            <SpotlightCard className={cn("aspect-[4/3] md:aspect-square lg:aspect-auto lg:h-[600px] xl:h-[700px] relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden p-1 transition-colors duration-1000", lumeMode ? "bg-black/50 border border-emerald-500/20" : "bg-white/[0.02] border-white/5")}>
              <motion.div 
                style={{ y: imageY, scale: imageScale }} 
                className={cn("relative w-full h-full rounded-[20px] md:rounded-[28px] overflow-hidden transition-shadow duration-700 transform-gpu", lumeMode ? "bg-black shadow-[0_0_80px_rgba(16,185,129,0.3)]" : "bg-[#0C0F14]")}
              >
                {/* Lume Mode Toggle */}
                <button 
                  onClick={() => setLumeMode(!lumeMode)}
                  className="absolute top-6 right-6 z-50 bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-black/60 hover:scale-110 transition-all group"
                  title="Toggle Lume Mode (Night Glow)"
                >
                  <Zap className={cn("w-5 h-5 transition-all duration-700", lumeMode ? "fill-emerald-400 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "text-white/70 group-hover:text-white")} />
                </button>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
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
                
                {/* Badges */}
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
              </motion.div>
            </SpotlightCard>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 hide-scrollbar mt-2 w-full">
                {product.images.map((img: string, idx: number) => (
                  <SpotlightCard key={idx} className={cn("p-1 shrink-0 w-20 md:w-28 transition-colors duration-1000", lumeMode ? "bg-black/50 border border-emerald-500/20" : "")}>
                    <button
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "relative aspect-square w-full rounded-[12px] md:rounded-[14px] overflow-hidden sw-interactive snap-start transition-colors duration-1000 flex items-center justify-center",
                        lumeMode ? "bg-black" : "bg-transparent",
                        selectedImage === idx ? (lumeMode ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-black" : "ring-2 ring-[#B8860B] ring-offset-2 ring-offset-[#0C0F14]") : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                    </button>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Floating Product Info Panel */}
          <div className="lg:col-span-5 pb-24 md:pb-0 min-w-0 w-full">
            <div className="md:sticky md:top-32 flex flex-col space-y-6 md:space-y-8">
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={1}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#B8860B] text-xs font-bold uppercase tracking-[0.2em]">{product.brand}</span>
                  <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    <Star className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
                    <span className="text-xs font-semibold text-white">{product.rating}</span>
                    <span className="text-xs text-white/60">({product.reviews})</span>
                  </div>
                </div>
                
                {/* Social Proof (Viewers) */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 text-white/80 bg-white/5 border border-white/10 w-fit px-3 py-1.5 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-white">{viewers}</span> people are viewing this right now
                </motion.div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
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
                  
                  {/* Urgency / Scarcity (Stock Left) */}
                  {product.stock > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] md:text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-red-400 shrink-0" /> High Demand
                        </span>
                        <span className="text-[10px] md:text-xs text-white/80">Only <strong className="text-white">{stockLeft} left</strong>!</span>
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


              {/* Status / Shipping mini banner */}
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
                    <p className="text-sm font-semibold text-white">Free & Fast</p>
                  </div>
                </div>
              </motion.div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3.5} className="space-y-3">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    Select Color: <span className="text-white ml-1">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300",
                          selectedColor === color
                            ? "bg-[#B8860B]/10 border-[#B8860B] text-[#D4A017] shadow-[0_0_15px_rgba(184,134,11,0.2)]"
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:border-white/30"
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quantity & Actions */}
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={4} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-[#0F1923] border border-white/10 rounded-xl p-1 h-12">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors sw-interactive">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-white">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors sw-interactive">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={cn(
                      "w-12 h-12 rounded-xl border flex items-center justify-center transition-all sw-interactive shrink-0",
                      isWishlisted ? "bg-[#B8860B]/10 border-[#B8860B] text-[#B8860B]" : "bg-[#0F1923] border-white/10 text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20"
                    )}
                  >
                    <Heart className={cn("w-5 h-5 transition-all", isWishlisted && "fill-current scale-110")} />
                  </button>
                </div>

                <div className="flex flex-col space-y-3 mt-4 md:mt-0">
                  <button
                    onClick={() => setIsQuickBuyOpen(true)}
                    disabled={product.stock === 0}
                    className="group relative w-full h-16 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all sw-interactive disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="relative flex flex-col items-center justify-center h-full">
                      <div className="flex items-center gap-2 text-white font-bold text-base uppercase tracking-widest">
                        <Zap className="w-5 h-5 fill-white animate-pulse" /> Quick Buy (COD)
                      </div>
                      <span className="text-white/80 text-[10px] font-medium tracking-widest uppercase mt-0.5">Order in 30 seconds</span>
                    </div>
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="relative w-full h-14 rounded-xl bg-[#0F1923] border border-white/10 text-white text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 hover:border-[#B8860B]/50 transition-colors flex items-center justify-center sw-interactive"
                  >
                    <AnimatePresence mode="wait">
                      {addedToCart ? (
                        <motion.div key="success" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2 text-[#B8860B]">
                          <CheckCircle2 className="w-4 h-4" /> Added to Cart
                        </motion.div>
                      ) : (
                        <motion.div key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" /> Add to Cart
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>

              {/* Trust & Guarantees */}
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={5} className="pt-6 border-t border-white/5 grid grid-cols-2 gap-y-5 gap-x-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#B8860B]" />
                    <span className="text-xs font-bold uppercase tracking-wider">100% Original</span>
                  </div>
                  <span className="text-[10px] text-white/50 pl-6 leading-tight">Guaranteed Authentic</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white">
                    <Banknote className="w-4 h-4 text-[#B8860B]" />
                    <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</span>
                  </div>
                  <span className="text-[10px] text-white/50 pl-6 leading-tight">Pay when you receive</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="w-4 h-4 text-[#B8860B]" />
                    <span className="text-xs font-bold uppercase tracking-wider">1 Year Warranty</span>
                  </div>
                  <span className="text-[10px] text-white/50 pl-6 leading-tight">International Coverage</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-white">
                    <RotateCcw className="w-4 h-4 text-[#B8860B]" />
                    <span className="text-xs font-bold uppercase tracking-wider">7 Days Return</span>
                  </div>
                  <span className="text-[10px] text-white/50 pl-6 leading-tight">Money Back Guarantee</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0C0F14]/90 backdrop-blur-md border-t border-white/10 p-4 md:hidden flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white shrink-0 disabled:opacity-50"
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Add</span>
        </button>
        <button
          onClick={() => setIsQuickBuyOpen(true)}
          disabled={product.stock === 0}
          className="flex-1 h-14 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 relative overflow-hidden"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center gap-1.5 text-white font-bold text-sm uppercase tracking-widest relative z-10">
            <Zap className="w-4 h-4 fill-white animate-pulse" /> Quick Buy
          </div>
          <span className="text-white/80 text-[9px] font-medium tracking-widest uppercase relative z-10 mt-0.5">Order via COD</span>
        </button>
      </div>

        {/* Product Details Tabs */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} custom={6} className="mt-24 lg:mt-32 pb-24 md:pb-0">
          <div className="flex items-center gap-6 sm:gap-8 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('description')}
              className={cn(
                "pb-4 text-sm font-semibold tracking-widest uppercase transition-all relative sw-interactive shrink-0",
                activeTab === 'description' ? "text-[#B8860B]" : "text-white/60 hover:text-white"
              )}
            >
              Description
              {activeTab === 'description' && <motion.div layoutId="tabLine" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#B8860B]" />}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={cn(
                "pb-4 text-sm font-semibold tracking-widest uppercase transition-all relative sw-interactive shrink-0",
                activeTab === 'specs' ? "text-[#B8860B]" : "text-white/60 hover:text-white"
              )}
            >
              Specifications
              {activeTab === 'specs' && <motion.div layoutId="tabLine" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#B8860B]" />}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={cn(
                "pb-4 text-sm font-semibold tracking-widest uppercase transition-all relative sw-interactive shrink-0",
                activeTab === 'reviews' ? "text-[#B8860B]" : "text-white/60 hover:text-white"
              )}
            >
              Reviews ({reviews.length})
              {activeTab === 'reviews' && <motion.div layoutId="tabLine" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#B8860B]" />}
            </button>
          </div>

          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div key="description" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Text (Editorial Style) */}
                    <div className={cn("order-2 lg:order-1", descriptionImages.length > 0 ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-12")}>
                      <div 
                        className="text-white/80 leading-relaxed text-sm md:text-base prose prose-invert max-w-none
                        [&_span]:!text-white/80 [&_p]:!text-white/80 [&_div]:!text-white/80 [&_li]:!text-white/80
                        [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_strong]:!text-white
                        prose-a:!text-[#B8860B] hover:prose-a:!text-[#D4A017]
                        prose-ul:list-disc prose-ol:list-decimal prose-li:my-1
                        [&_iframe]:!w-full [&_iframe]:!max-w-full [&_iframe]:aspect-video [&_iframe]:!h-auto [&_iframe]:rounded-xl [&_iframe]:my-6
                        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:inline-block [&_img]:align-middle"
                        dangerouslySetInnerHTML={{ __html: textOnlyHtml }}
                      />
                    </div>
                    {/* Right Column: Masonry Gallery */}
                    {descriptionImages.length > 0 && (
                      <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
                        <div className="columns-2 gap-4 space-y-4">
                          {descriptionImages.map((src, i) => (
                            <div key={i} className="break-inside-avoid relative rounded-[20px] overflow-hidden shadow-xl border border-white/5 hover:border-[#B8860B]/30 hover:shadow-[0_8px_32px_rgba(184,134,11,0.15)] transition-all duration-500 group">
                              <img src={src} alt={`Product Detail ${i + 1}`} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {activeTab === 'specs' && (
                <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {specs.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl">
                      {specs.map(([k, v]) => (
                        <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/5">
                          <span className="text-white/60 text-sm capitalize">{k.replace('_', ' ')}</span>
                          <span className="text-white font-medium text-sm mt-1 sm:mt-0">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60">No specifications available for this product.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-3xl">
                  {reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <SpotlightCard key={rev.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#B8860B]/20 flex items-center justify-center text-[#B8860B] font-bold text-lg">
                              {rev.user_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{rev.user_name}</p>
                              <p className="text-xs text-white/60">{new Date(rev.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3.5 h-3.5", i < rev.rating ? "fill-[#B8860B] text-[#B8860B]" : "fill-white/5 text-white/10")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">{rev.comment}</p>
                      </SpotlightCard>
                    ))
                  ) : (
                    <p className="text-white/60">No reviews yet. Be the first to review this timepiece.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mt-32">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Complete Your Collection</h3>
              <Link href={`/products?category=${product.category_slug}`} className="text-sm text-[#B8860B] hover:text-[#D4A017] transition-colors sw-interactive font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <QuickBuyModal 
        product={product} 
        quantity={quantity}
        isOpen={isQuickBuyOpen} 
        onClose={() => setIsQuickBuyOpen(false)} 
      />

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0C0F14]/90 backdrop-blur-xl border-t border-white/10 p-4 md:hidden flex gap-3 pb-8">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="flex-1 h-12 rounded-xl bg-[#0F1923] border border-white/10 text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center sw-interactive"
        >
          <ShoppingBag className="w-4 h-4 mr-1.5" /> Cart
        </button>
        <button
          onClick={() => setIsQuickBuyOpen(true)}
          disabled={product.stock === 0}
          className="flex-[1.5] h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center sw-interactive"
        >
          <Zap className="w-4 h-4 mr-1.5 fill-white" /> Quick Buy
        </button>
      </div>
    </div>
  )
}
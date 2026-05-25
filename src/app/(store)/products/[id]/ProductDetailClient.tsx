"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { ChevronRight, ShoppingBag, Check, Star, Heart, Share2, Minus, Plus, Zap, ShieldCheck, MessageCircle, PackageOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"
import { CODOrderModal } from "@/components/CODOrderModal"
import { formatPrice, type Product, type ProductVariant } from "@/lib/products"
import { useCategories } from "@/lib/categories-context"
import { useCart } from "@/lib/cart-context"
import { PageTransition } from "@/components/PageTransition"
import { AnimatedSection } from "@/components/AnimatedSection"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import { StockBadge } from "@/components/storefront/StockBadge"
import { ProductPrice } from "@/components/storefront/ProductPrice"
import { ProductImageGallery } from "@/components/storefront/ProductImageGallery"
import { VariantSelector } from "@/components/storefront/VariantSelector"
import { ProductTrustBadges } from "@/components/storefront/ProductTrustBadges"
import { ProductInfo } from "@/components/storefront/ProductInfo"
import { toast } from "sonner"
import { useLiveStock } from "@/lib/hooks/use-live-stock"
import { UrgencyTriggers } from "@/components/storefront/UrgencyTriggers"
import { LiveSocialProof } from "@/components/storefront/LiveSocialProof"

function getColorHex(value: string): string | null {
  const colorMap: Record<string, string> = {
    black: "#000000", white: "#FFFFFF", silver: "#C0C0C0", blue: "#0000FF", red: "#FF0000",
    green: "#008000", grey: "#808080", gray: "#808080", pink: "#FFC0CB", purple: "#800080",
    orange: "#FFA500", yellow: "#FFFF00", gold: "#FFD700", midnight: "#1A1A2E",
    starlight: "#F5F5DC", titanium: "#8A8C91", "titanium-natural": "#8A8C91"
  }
  return colorMap[value.toLowerCase().replace(/\s+/g, "")] || null
}

interface ProductDetailClientProps {
  product: Product
  related: Product[]
}

export default function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const { addItem } = useCart()
  const { getCategoryBySlug } = useCategories()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [codModalOpen, setCodModalOpen] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  
  const [showStickyBar, setShowStickyBar] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowStickyBar(latest > 600)
  })

  const initialInventory = product.quantity
  const liveStock = useLiveStock(product.id, initialInventory)

  const images = product.images?.length ? product.images : [product.image]
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const hasVariants = product.variants && product.variants.length > 0
  const optionNames = product.optionNames || (hasVariants ? getOptionNames(product.variants!) : undefined)

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null
    return findSelectedVariant(product.variants!, optionNames, selectedOptions)
  }, [product.variants, optionNames, selectedOptions])

  const displayPrice = selectedVariant?.price ?? product.price
  const displayOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice
  const displayInStock = selectedVariant ? selectedVariant.inStock : product.inStock
  const displayInventory = selectedVariant?.inventory ?? product.quantity
  const displaySku = selectedVariant?.sku ?? product.sku
  const variantImage = selectedVariant?.image

  const selectedColorOption = Object.entries(selectedOptions).find(([k]) => /color|colour/i.test(k))
  const ambientGlowColor = selectedColorOption ? getColorHex(selectedColorOption[1]) || "rgba(37, 99, 235, 0.15)" : "rgba(37, 99, 235, 0.15)"

  const needsVariantSelection = hasVariants && optionNames && optionNames.length > 0
  const allOptionsSelected = needsVariantSelection
    ? optionNames!.every((name) => selectedOptions[name])
    : true

  function handleAddToCart() {
    if (needsVariantSelection && !allOptionsSelected) {
      const missing = optionNames!.filter((n) => !selectedOptions[n])
      toast.error(`Please select ${missing.join(" and ")}`)
      return
    }

    const itemId = selectedVariant?.sku
      ? `${product.id}-${selectedVariant.sku}`
      : product.id

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: itemId,
        name: product.name,
        price: displayPrice,
        image: variantImage || product.image,
        variantLabel: selectedVariant?.label || undefined,
        variantSku: displaySku || undefined,
      })
    }

    toast.success(`${quantity > 1 ? `${quantity}x ` : ""}${product.name} added to cart`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const productCategory = getCategoryBySlug(product.category.toLowerCase().replace(/\s+/g, "-")) || getCategoryBySlug(product.category)
  const rating = product.rating || 4.5
  const reviewCount = product.reviews || 24

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/50 mb-8 overflow-x-auto">
            <Link href="/" className="transition-colors hover:text-[#0A0A0A] whitespace-nowrap">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href="/categories" className="transition-colors hover:text-[#0A0A0A] whitespace-nowrap">Categories</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            {productCategory ? (
              <Link href={`/products/category/${productCategory.slug}`} className="transition-colors hover:text-[#0A0A0A] whitespace-nowrap">{product.category}</Link>
            ) : (
              <span className="text-[#0A0A0A] font-bold truncate">{product.category}</span>
            )}
            {product.status !== "published" && (
              <span className="rounded bg-[#0A0A0A] px-2 py-0.5 text-[10px] font-bold text-[#FAFAFA] ml-2">
                {product.status === "archived" ? "Archived" : "Draft"}
              </span>
            )}
          </nav>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left — Image Gallery */}
            <div className="lg:col-span-7 space-y-4 relative bg-transparent p-0 flex flex-col justify-center min-h-[500px]">
              {/* Dynamic Ambient Glow */}
              <motion.div
                animate={{ backgroundColor: ambientGlowColor }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 -z-10 blur-[80px] opacity-40 rounded-full mix-blend-multiply scale-[0.8]"
              />
              <ProductImageGallery
                images={images}
                productName={product.name}
                discount={discount}
                variantImage={variantImage}
              />
            </div>

            {/* Right — Product Info */}
            <div className="lg:col-span-5 bg-transparent p-0 flex flex-col lg:sticky lg:top-24 lg:self-start space-y-8 relative">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold tracking-[0.15em] uppercase text-neutral-400">
                      {product.category}
                    </p>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">
                      {product.name}
                    </h1>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={() => {
                        setWishlisted(!wishlisted)
                        toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist")
                      }}
                      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`h-5 w-5 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href)
                        toast.success("Link copied to clipboard")
                      }}
                      aria-label="Copy product link"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < Math.floor(rating) ? "fill-amber-accent text-amber-accent" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{rating}</span>
                  <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
                </div>

                {/* Price */}
                <ProductPrice
                  price={displayPrice}
                  compareAtPrice={displayOriginalPrice}
                  size="lg"
                />

                {/* Stock Status + SKU */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <StockBadge
                      quantity={liveStock.loading ? displayInventory : liveStock.stockCount}
                      threshold={product.lowStockThreshold || 5}
                    />
                    {displaySku && (
                      <span className="text-[11px] font-mono text-muted-foreground">
                        SKU: {displaySku}
                      </span>
                    )}
                  </div>
                  {!liveStock.loading && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {liveStock.message}
                    </p>
                  )}
                </div>

                {/* Urgency Triggers */}
                <UrgencyTriggers />
              </div>

              {/* Variant Selector */}
              {hasVariants && optionNames && optionNames.length > 0 && (
                <VariantSelector
                  variants={product.variants!}
                  selected={selectedOptions}
                  onChange={setSelectedOptions}
                />
              )}

              {/* No variants case: always in stock */}
              {!hasVariants && (
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
              )}

              <div className="bg-[#F6F8FA] border border-neutral-200/60 p-5 sm:p-6 rounded-[24px] space-y-5">
                {/* COD Header */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <PackageOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-neutral-900">Pehle Dekhein, Phir Paise Dein</p>
                    <p className="text-sm font-medium text-neutral-500">Check parcel before payment</p>
                  </div>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center bg-background border border-border rounded-full">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-12 w-12 rounded-full hover:bg-muted"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="flex w-12 sm:w-16 items-center justify-center text-base font-semibold text-primary select-none">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-12 w-12 rounded-full hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    size="lg"
                    disabled={!displayInStock || (needsVariantSelection && !allOptionsSelected)}
                    onClick={handleAddToCart}
                    variant="outline"
                    className={`flex-1 h-12 rounded-full text-base font-bold transition-all border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#0A0A0A]/5 ${added ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : ""}`}
                  >
                    {added ? (
                      <><Check className="h-5 w-5 mr-2" /> Added</>
                    ) : (
                      <><ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart</>
                    )}
                  </Button>
                </div>

                {/* Buy Now & WhatsApp */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    disabled={!displayInStock || (needsVariantSelection && !allOptionsSelected)}
                    onClick={() => setCodModalOpen(true)}
                    className="group relative w-full h-14 overflow-hidden rounded-full bg-[#0A0A0A] text-sm font-bold uppercase tracking-wider text-[#FAFAFA] hover:bg-[#0A0A0A]/90"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Zap className="mr-2 h-5 w-5" /> Order Now (COD)
                  </Button>
                  
                  <Link href="https://wa.me/923000000000" target="_blank" className="block w-full">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 rounded-full border-[#10B981] bg-transparent text-sm font-bold uppercase tracking-wider text-[#10B981] hover:bg-[#10B981] hover:text-[#FAFAFA] transition-colors"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" /> Order via WhatsApp
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <ProductTrustBadges />
              </div>
            </div>
          </div>

          {/* Product Info — Description / Specs / Shipping / Reviews */}
          <AnimatedSection className="mt-10 sm:mt-12">
            <div className="w-full bg-white rounded-[32px] p-6 sm:p-8 sm:px-10 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
              <ProductInfo
                description={product.description}
                specs={product.specs || []}
                tags={product.tags}
                rating={product.rating}
                reviewCount={product.reviews}
              />
            </div>
          </AnimatedSection>

          {/* Trust Features */}
          <AnimatedSection className="mt-8 sm:mt-10">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-4 bg-white p-5 sm:p-6 border border-neutral-200/60 rounded-2xl shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">100% Original Guaranteed</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    We only sell authentic products with complete brand warranty.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white p-5 sm:p-6 border border-neutral-200/60 rounded-2xl shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <PackageOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Pehle Dekhein, Phir Paise Dein</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    Check your parcel before paying the rider. No advance payment required.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white p-5 sm:p-6 border border-neutral-200/60 rounded-2xl shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Fast Nationwide Delivery</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                    Free shipping via premium couriers. Delivery in 24-48 hours across Pakistan.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Related Products */}
          {related.length > 0 && (
            <AnimatedSection className="mt-10 sm:mt-14">
              <div className="text-center mb-8">
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-muted-foreground mb-2">
                  You may also like
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                  Similar Products
                </h2>
              </div>
              <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.slice(0, 4).map((rp) => (
                  <StaggerItem key={rp.id}>
                    <ProductCard product={rp} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </AnimatedSection>
          )}
        </div>

        <CODOrderModal
          product={product}
          initialQuantity={quantity}
          open={codModalOpen}
          onOpenChange={setCodModalOpen}
        />

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-md border-t border-neutral-200/60 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <Button
            size="lg"
            disabled={!displayInStock || (needsVariantSelection && !allOptionsSelected)}
            onClick={() => setCodModalOpen(true)}
            className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20"
          >
            <Zap className="h-5 w-5 mr-2 animate-pulse" /> Order Now — Cash on Delivery
          </Button>
        </div>

        {/* Desktop Sticky Header */}
        <AnimatePresence>
          {showStickyBar && (
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 right-0 z-50 hidden lg:flex items-center justify-between px-8 py-3 bg-white/90 backdrop-blur-md border-b border-neutral-200/60 shadow-sm"
            >
              <div className="flex items-center gap-4">
                {product.image && (
                  <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                )}
                <div>
                  <p className="text-sm font-bold text-neutral-900">{product.name}</p>
                  <p className="text-xs text-neutral-500">{formatPrice(displayPrice)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  disabled={!displayInStock || (needsVariantSelection && !allOptionsSelected)}
                  onClick={() => setCodModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  <Zap className="h-4 w-4 mr-1.5 animate-pulse" /> Order Now — Pay on Delivery
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Social Proof */}
        <LiveSocialProof />
      </div>
    </PageTransition>
  )
}

function getOptionNames(variants: ProductVariant[]): string[] {
  const multiOption = variants.find((v) => v.option1Name)
  if (multiOption) {
    const names: string[] = []
    if (multiOption.option1Name) names.push(multiOption.option1Name)
    if (multiOption.option2Name) names.push(multiOption.option2Name)
    if (multiOption.option3Name) names.push(multiOption.option3Name)
    return names.length > 0 ? names : [...new Set(variants.map((v) => v.name))]
  }
  return [...new Set(variants.map((v) => v.name))]
}

interface SelectedVariantInfo {
  variant?: ProductVariant
  price: number
  originalPrice?: number
  inStock: boolean
  inventory: number
  sku?: string
  image?: string
  label?: string
}

function findSelectedVariant(
  variants: ProductVariant[],
  optionNames: string[] | undefined,
  selected: Record<string, string>,
): SelectedVariantInfo | null {
  const entries = Object.entries(selected).filter(([, v]) => v)
  if (entries.length === 0) return null

  const basePrice = 0

  if (optionNames && optionNames.length > 0) {
    const match = variants.find((v) => {
      const opt1 = optionNames[0] ? selected[optionNames[0]] : undefined
      const opt2 = optionNames[1] ? selected[optionNames[1]] : undefined
      const opt3 = optionNames[2] ? selected[optionNames[2]] : undefined
      return (
        (!opt1 || v.option1 === opt1 || v.value === opt1) &&
        (!opt2 || v.option2 === opt2) &&
        (!opt3 || v.option3 === opt3)
      )
    })

    if (match) {
      const label = optionNames
        .map((name) => `${name}: ${selected[name] || ""}`)
        .filter((s) => !s.endsWith(": "))
        .join(", ")

      return {
        variant: match,
        price: basePrice + (match.priceAdjustment || 0),
        originalPrice: undefined,
        inStock: match.inStock !== false,
        inventory: 0,
        sku: match.sku,
        image: match.image,
        label,
      }
    }
  }

  const [name, value] = entries[0]
  const match = variants.find((v) => v.name === name && v.value === value)

  if (match) {
    return {
      variant: match,
      price: basePrice + (match.priceAdjustment || 0),
      originalPrice: undefined,
      inStock: match.inStock !== false,
      inventory: 0,
      sku: match.sku,
      image: match.image,
      label: `${name}: ${value}`,
    }
  }

  return null
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Banknote } from "lucide-react"

export interface Product {
  id: string
  name: string
  handle?: string
  price: number
  originalPrice?: number
  image: string
  inStock?: boolean
}

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price)

  const formattedComparePrice = product.originalPrice
    ? new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(product.originalPrice)
    : null

  const handle = product.handle || product.id
  const available = product.inStock !== false

  return (
    <div className="group relative flex flex-col bg-[#FAFAFA]">
      {/* Image Container */}
      <Link href={`/products/${handle}`} className="block relative aspect-[4/5] overflow-hidden rounded-xl bg-[#F0F0F0] border border-[#E5E5E5] mb-4">
        {/* COD Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 shadow-sm border border-[#E5E5E5]/50">
            <Banknote className="h-3.5 w-3.5 text-[#10B981]" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A]">
              COD Available
            </span>
          </div>
        </div>

        {/* Product Image */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-center transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) group-hover:scale-105"
        />

        {/* Slide-up Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) group-hover:translate-y-0 group-hover:opacity-100">
          <button 
            disabled={!available}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95 disabled:bg-[#0A0A0A]/50 disabled:cursor-not-allowed hover:bg-[#0A0A0A]/90"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            {available ? "Quick Add" : "Sold Out"}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col px-1">
        <Link href={`/products/${handle}`} className="group-hover:opacity-80 transition-opacity">
          <h3 className="text-sm font-medium tracking-tight text-[#0A0A0A] line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#0A0A0A]">
            {formattedPrice}
          </span>
          {formattedComparePrice && (
            <span className="text-xs font-medium text-[#0A0A0A]/40 line-through">
              {formattedComparePrice}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

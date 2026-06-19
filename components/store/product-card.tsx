"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Product } from '@/types'
import { formatPrice } from '@/lib/mock-data'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart, isInCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const inWishlist = isInWishlist(product.id)
  const inCart = isInCart(product.id)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
  }

  return (
    <Card className={cn("group overflow-hidden border-border hover:shadow-lg transition-all duration-300", className)}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-3 right-3 bg-card/80 backdrop-blur-sm hover:bg-card",
              inWishlist && "text-destructive"
            )}
            onClick={handleWishlistClick}
          >
            <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
          </Button>

          {/* Quick Add Button */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              className="w-full"
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {inCart ? 'Added' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Brand */}
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {product.brand}
          </p>

          {/* Name */}
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.rating)
                      ? "text-warning fill-warning"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews_count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-xs text-destructive mt-2">
              Only {product.stock} left in stock!
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
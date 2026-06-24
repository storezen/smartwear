'use client'

import { useEffect } from 'react'

interface ProductSchemaProps {
  product: {
    id: string
    name: string
    description?: string
    price: number
    images?: string[]
    brand?: string
    stock?: number
    rating?: number
    reviews_count?: number
    slug?: string
    category?: { name?: string }
  }
}

export function ProductSchema({ product }: ProductSchemaProps) {
  useEffect(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: (product.description || product.name || '').substring(0, 5000),
      image: Array.isArray(product.images) && product.images[0] ? product.images[0] : undefined,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Smartwear',
      },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'PKR',
        availability: (product.stock ?? 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        url: typeof window !== 'undefined'
          ? window.location.href
          : undefined,
      },
    }

    if (product.rating && product.rating > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews_count || 0,
      }
    }

    if (product.category?.name) {
      schema.category = product.category.name
    }

    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.textContent = JSON.stringify(schema, null, 2)
    document.head.appendChild(el)
    return () => { el.remove() }
  }, [product])

  return null
}

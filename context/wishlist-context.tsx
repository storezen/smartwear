"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, WishlistItem } from '@/types'
import { toast } from 'sonner'
import Image from 'next/image'
import { TikTokEvents } from '@/lib/tiktok-pixel'

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    const savedWishlist = localStorage.getItem('techmart_wishlist')
    if (savedWishlist) {
      setItems(JSON.parse(savedWishlist))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('techmart_wishlist', JSON.stringify(items))
  }, [items])

  const itemCount = items.length

  const addToWishlist = (product: Product) => {
    setItems(prevItems => {
      const exists = prevItems.some(item => item.product_id === product.id)
      if (exists) return prevItems
      
      toast(
        <div className="flex items-center gap-3 w-full">
          {product.images?.[0] && (
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1">
              <Image src={product.images[0]} alt={product.name} width={40} height={40} className="object-contain" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{product.name}</p>
            <p className="text-xs text-rose-400 mt-0.5 flex items-center gap-1">Saved to wishlist ❤️</p>
          </div>
        </div>,
        { duration: 3000 }
      )
      try { TikTokEvents.addToWishlist(product) } catch {}
      return [...prevItems, {
        id: Date.now().toString(),
        user_id: '',
        product_id: product.id,
        product,
        created_at: new Date().toISOString()
      }]
    })
  }

  const removeFromWishlist = (productId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.product_id === productId)
      if (itemToRemove) {
        toast(
          <div className="flex items-center gap-3 w-full">
            {itemToRemove.product.images?.[0] && (
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1 opacity-50">
                <Image src={itemToRemove.product.images[0]} alt={itemToRemove.product.name} width={40} height={40} className="object-contain grayscale" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white/70 truncate line-through">{itemToRemove.product.name}</p>
              <p className="text-xs text-white/40 mt-0.5">Removed from wishlist</p>
            </div>
          </div>,
          { duration: 3000 }
        )
      }
      return prevItems.filter(item => item.product_id !== productId)
    })
  }

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId)
  }

  const clearWishlist = () => {
    setItems([])
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

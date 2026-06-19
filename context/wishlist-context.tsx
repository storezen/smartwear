"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, WishlistItem } from '@/types'
import { toast } from 'sonner'

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
      
      
      toast.success(`${product.name} added to wishlist`, {
        icon: '❤️'
      })
      
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
        toast.info(`${itemToRemove.product.name} removed from wishlist`)
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

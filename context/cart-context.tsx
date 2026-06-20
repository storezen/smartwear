"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '@/types'
import { formatPrice } from '@/lib/mock-data'
import { toast } from 'sonner'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getFormattedSubtotal: () => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('techmart_cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('techmart_cart', JSON.stringify(items))
  }, [items])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0)

  const addToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    const stock = product.stock ?? 0
    if (stock <= 0) {
      toast.error('Out of stock', {
        description: `${product.name} is currently unavailable.`,
      })
      return
    }

    setItems(prevItems => {
      const itemId = selectedColor ? `${product.id}-${selectedColor}` : product.id
      const existingItem = prevItems.find(item => item.id === itemId)
      const nextQty = (existingItem?.quantity ?? 0) + quantity

      if (nextQty > stock) {
        toast.error('Not enough stock', {
          description: `Only ${stock} units available for ${product.name}.`,
        })
        return prevItems
      }

      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: nextQty } : item
        )
      }

      toast.success(`${product.name} added to cart`, {
        description: selectedColor ? `Color: ${selectedColor}` : 'You can review your items before checkout.',
        duration: 3000,
      })
      return [...prevItems, { id: itemId, product, quantity, selectedColor }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === itemId)
      if (itemToRemove) {
        toast.info(`${itemToRemove.product.name} removed from cart`)
      }
      return prevItems.filter(item => item.id !== itemId)
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId)
      return
    }

    setItems(prevItems => {
      const item = prevItems.find((i) => i.id === itemId)
      if (!item) return prevItems

      const stock = item.product.stock ?? 0
      if (quantity > stock) {
        toast.error('Not enough stock', {
          description: `Only ${stock} units available.`,
        })
        return prevItems
      }

      return prevItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    })
  }

  const clearCart = () => {
    setItems([])
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.product.id === productId)
  }

  const getFormattedSubtotal = () => formatPrice(subtotal)

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getFormattedSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

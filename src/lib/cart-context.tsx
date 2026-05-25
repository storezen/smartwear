"use client"

import { useStore } from "@/lib/store"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variantLabel?: string
  variantSku?: string
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useCart() {
  const store = useStore()

  const items: CartItem[] = store.cart.map((item) => {
    let label = ""
    if (item.selectedStrap && item.selectedColor) {
      label = `${item.selectedStrap} / ${item.selectedColor}`
    } else if (item.selectedStrap) {
      label = item.selectedStrap
    } else if (item.selectedColor) {
      label = item.selectedColor
    }

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      variantLabel: label || undefined,
      variantSku: item.id.includes("-") ? item.id.split("-")[1] : undefined,
    }
  })

  const addItem = (product: Omit<CartItem, "quantity">) => {
    store.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      selectedStrap: product.variantLabel || "",
      selectedColor: "",
      stockCount: 15,
      warehouse: "Lahore Main Warehouse",
    })
  }

  const removeItem = (id: string) => {
    const item = store.cart.find((i) => i.id === id)
    if (item) {
      store.removeItem(id, item.selectedStrap, item.selectedColor)
    }
  }

  const updateQuantity = (id: string, qty: number) => {
    const item = store.cart.find((i) => i.id === id)
    if (item) {
      store.updateQuantity(id, item.selectedStrap, item.selectedColor, qty)
    }
  }

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart: store.clearCart,
    getItemCount: store.getItemCount,
    getSubtotal: store.getSubtotal,
  }
}

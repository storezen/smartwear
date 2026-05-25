"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Product } from "@/lib/products"

const API = "/api/products"
const STORAGE_KEY = "smartwear-products"

type ProductInput = Omit<Product, "id">

interface ProductsContextType {
  products: Product[]
  hydrated: boolean
  addProduct: (data: ProductInput) => void
  updateProduct: (id: string, data: Product) => void
  deleteProduct: (id: string) => void
  deleteAllProducts: () => void
  getProductById: (id: string) => Product | undefined
  cloneProduct: (id: string) => void
  bulkUpdateProduct: (ids: string[], data: Partial<Product>) => void
}

const ProductsContext = createContext<ProductsContextType | null>(null)

function loadLocal(): Product[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed: Product[] = JSON.parse(stored)
      return parsed.length > 0 ? parsed : []
    }
  } catch (err) {
    console.error("Failed to load products from localStorage:", err)
  }
  return []
}

function saveLocal(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (err) {
    console.error("Failed to save products to localStorage:", err)
  }
}

async function api<T = unknown>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    })
    return res.ok ? res.json() : null
  } catch (err) {
    console.error("Products API error:", err)
    return null
  }
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isReady, setIsReady] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let mounted = true
    const local = loadLocal()
    if (mounted) {
      if (local.length > 0) {
        setProducts(local)
      }
      setIsReady(true)
    }

    api<{ products: Product[] }>("/?page=1&limit=200").then((data) => {
      if (!mounted) return
      if (data && data.products.length > 0) {
        setProducts(data.products)
        saveLocal(data.products)
      }
      setHydrated(true)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!isReady) return
    saveLocal(products)
  }, [products, isReady])

  const addProduct = useCallback((data: ProductInput) => {
    const product: Product = {
      ...data,
      id: `p-${Date.now()}`,
      inStock: data.inStock ?? true,
      status: data.status || "published",
      quantity: data.quantity || 100,
      lowStockThreshold: data.lowStockThreshold || 10,
    }
    setProducts((prev) => [product, ...prev])
    api("/", { method: "POST", body: JSON.stringify(product) })
  }, [])

  const updateProduct = useCallback((id: string, data: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
    api(`/${id}`, { method: "PUT", body: JSON.stringify(data) })
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    api(`/${id}`, { method: "DELETE" })
  }, [])

  const deleteAllProducts = useCallback(() => {
    setProducts([])
  }, [])

  const cloneProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const target = prev.find((p) => p.id === id)
      if (!target) return prev
      const newId = `p-${Date.now()}`
      const cloned: Product = {
        ...target,
        id: newId,
        name: `${target.name} (Copy)`,
        sku: target.sku ? `${target.sku}-COPY` : `${newId}-copy`,
      }
      api("/", { method: "POST", body: JSON.stringify(cloned) })
      return [cloned, ...prev]
    })
  }, [])

  const bulkUpdateProduct = useCallback((ids: string[], data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (ids.includes(p.id)) {
          const updated = { ...p, ...data }
          api(`/${p.id}`, { method: "PUT", body: JSON.stringify(updated) })
          return updated
        }
        return p
      }),
    )
  }, [])

  const getProductById = useCallback((id: string) => products.find((p) => p.id === id), [products])

  return (
    <ProductsContext.Provider value={{ products, hydrated, addProduct, updateProduct, deleteProduct, deleteAllProducts, getProductById, cloneProduct, bulkUpdateProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error("useProducts must be used inside ProductsProvider")
  return ctx
}

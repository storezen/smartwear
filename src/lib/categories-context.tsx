"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  showInNavbar?: boolean
  showOnHomepage?: boolean
  active?: boolean
  sortOrder?: number
}

const DEFAULT_CATEGORIES: ProductCategory[] = [
  { id: "clothing", name: "Smart Watches", slug: "clothing", description: "Premium smart watches for every lifestyle", image: "https://images.unsplash.com/photo-1546868871-af0de0e72c43?w=600&q=85", showInNavbar: true, showOnHomepage: true, active: true, sortOrder: 1 },
  { id: "shoes", name: "Fitness Trackers", slug: "shoes", description: "Track your health, fitness & goals", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85", showInNavbar: true, showOnHomepage: true, active: true, sortOrder: 2 },
  { id: "accessories", name: "Accessories", slug: "accessories", description: "Earbuds, chargers & tech essentials", image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f73?w=600&q=85", showInNavbar: true, showOnHomepage: true, active: true, sortOrder: 3 },
  { id: "new-arrivals", name: "New Arrivals", slug: "new-arrivals", description: "Latest smart tech drops & fresh arrivals", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=85", showInNavbar: true, showOnHomepage: true, active: true, sortOrder: 4 },
]

const API = "/api/categories"
const STORAGE_KEY = "smartwear-categories"

type CategoryInput = Omit<ProductCategory, "id">

interface CategoriesContextType {
  categories: ProductCategory[]
  hydrated: boolean
  addCategory: (data: CategoryInput) => void
  updateCategory: (id: string, data: ProductCategory) => void
  deleteCategory: (id: string) => void
  getCategoryBySlug: (slug: string) => ProductCategory | undefined
  getCategoryById: (id: string) => ProductCategory | undefined
  navbarCategories: ProductCategory[]
  homepageCategories: ProductCategory[]
  activeCategories: ProductCategory[]
  reorderCategories: (ids: string[]) => void
}

const CategoriesContext = createContext<CategoriesContextType | null>(null)

function loadLocal(): ProductCategory[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed: ProductCategory[] = JSON.parse(stored)
      if (parsed.length === 0) return DEFAULT_CATEGORIES
      return parsed
    }
  } catch (err) {
    console.error("Failed to load categories from localStorage:", err)
  }
  return DEFAULT_CATEGORIES
}

function saveLocal(categories: ProductCategory[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(categories)) } catch (err) {
    console.error("Failed to save categories to localStorage:", err)
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
    console.error("Categories API error:", err)
    return null
  }
}

function dedupe(arr: ProductCategory[]): ProductCategory[] {
  const seen = new Map<string, ProductCategory>()
  for (const c of arr) {
    const key = c.slug?.toLowerCase() || c.name.toLowerCase().replace(/\s+/g, "-")
    if (!seen.has(key)) seen.set(key, c)
  }
  return Array.from(seen.values())
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ProductCategory[]>(DEFAULT_CATEGORIES)
  const [isReady, setIsReady] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let mounted = true
    const initLocal = async () => {
      const local = dedupe(loadLocal())
      if (mounted) {
        setCategories(local)
        setIsReady(true)
      }
    }
    initLocal()

    api<{ categories: ProductCategory[] }>("/?page=1&limit=100").then((data) => {
      if (!mounted) return
      if (data && data.categories.length > 0) {
        setCategories(dedupe(data.categories))
        saveLocal(data.categories)
      }
      setHydrated(true)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!isReady) return
    saveLocal(categories)
  }, [categories, isReady])

  const navbarCategories = useMemo(
    () => categories.filter((c) => c.active !== false && c.showInNavbar).sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99)),
    [categories]
  )

  const homepageCategories = useMemo(
    () => categories.filter((c) => c.active !== false && c.showOnHomepage).sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99)),
    [categories]
  )

  const activeCategories = useMemo(
    () => categories.filter((c) => c.active !== false).sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99)),
    [categories]
  )

  const addCategory = useCallback((data: CategoryInput) => {
    const slug = data.slug?.toLowerCase().replace(/\s+/g, "-") || data.name.toLowerCase().replace(/\s+/g, "-")
    const exists = categories.some(
      (c) => c.slug?.toLowerCase() === slug || c.name.toLowerCase() === data.name.toLowerCase()
    )
    if (exists) return
    const category: ProductCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      slug,
      active: data.active ?? true,
      showInNavbar: data.showInNavbar ?? false,
      showOnHomepage: data.showOnHomepage ?? false,
      sortOrder: data.sortOrder ?? categories.length + 1,
    }
    setCategories((prev) => [...prev, category])
    api("/", { method: "POST", body: JSON.stringify(category) })
  }, [categories])

  const updateCategory = useCallback((id: string, data: ProductCategory) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data, id } : c)))
    api(`/${id}`, { method: "PUT", body: JSON.stringify(data) })
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    api(`/${id}`, { method: "DELETE" })
  }, [])

  const getCategoryBySlug = useCallback((slug: string) => {
    return categories.find((c) => c.slug === slug || c.id === slug)
  }, [categories])

  const getCategoryById = useCallback((id: string) => {
    return categories.find((c) => c.id === id)
  }, [categories])

  const reorderCategories = useCallback((ids: string[]) => {
    setCategories((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]))
      const list: ProductCategory[] = []
      ids.forEach((id, i) => {
        const item = map.get(id)
        if (item) {
          const updated: ProductCategory = { ...item, sortOrder: i + 1 }
          api(`/${id}`, { method: "PUT", body: JSON.stringify(updated) })
          list.push(updated)
        }
      })
      return list
    })
  }, [])

  return (
    <CategoriesContext.Provider value={{ categories, hydrated, addCategory, updateCategory, deleteCategory, getCategoryBySlug, getCategoryById, navbarCategories, homepageCategories, activeCategories, reorderCategories }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error("useCategories must be used inside CategoriesProvider")
  return ctx
}

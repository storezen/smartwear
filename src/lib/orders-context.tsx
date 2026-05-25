"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

export const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
}

export interface StatusEntry {
  status: OrderStatus
  timestamp: string
}

export interface CODOrder {
  id: string
  productId: string
  productName: string
  productPrice: number
  productImage: string
  quantity: number
  total: number
  customerName: string
  phone: string
  address: string
  city: string
  notes?: string
  status: OrderStatus
  statusHistory: StatusEntry[]
  createdAt: string
}

const API = "/api/orders"
const STORAGE_KEY = "smartwear-cod-orders"

type OrderInput = Omit<CODOrder, "id" | "status" | "statusHistory" | "createdAt">

interface OrdersContextType {
  orders: CODOrder[]
  hydrated: boolean
  addOrder: (data: OrderInput) => void
  updateOrderStatus: (id: string, newStatus: OrderStatus) => void
  deleteOrder: (id: string) => void
  getOrderById: (id: string) => CODOrder | undefined
  bulkUpdateOrders: (ids: string[], action: string, newStatus?: OrderStatus) => Promise<void>
}

const OrdersContext = createContext<OrdersContextType | null>(null)

function migrateOrder(o: CODOrder): CODOrder {
  if (!o.statusHistory) {
    return { ...o, statusHistory: [{ status: o.status as OrderStatus, timestamp: o.createdAt }] }
  }
  return o
}

function loadLocal(): CODOrder[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed: CODOrder[] = JSON.parse(stored)
    return parsed.map(migrateOrder)
  } catch { return [] }
}

function saveLocal(orders: CODOrder[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)) } catch {}
}

async function api<T = unknown>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    })
    return res.ok ? res.json() : null
  } catch { return null }
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<CODOrder[]>([])
  const [isReady, setIsReady] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let mounted = true
    const initLocal = async () => {
      const local = loadLocal()
      if (mounted) {
        setOrders(local)
        setIsReady(true)
      }
    }
    initLocal()

    api<CODOrder[]>("/").then((data) => {
      if (!mounted) return
      if (data && data.length > 0) {
        setOrders(data.map(migrateOrder))
        saveLocal(data)
      }
      setHydrated(true)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!isReady) return
    saveLocal(orders)
  }, [orders, isReady])

  const addOrder = useCallback((data: OrderInput) => {
    const now = new Date().toISOString()
    const order: CODOrder = {
      ...data,
      id: `COD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: "pending",
      statusHistory: [{ status: "pending", timestamp: now }],
      createdAt: now,
    }
    setOrders((prev) => [order, ...prev])
    api("/", { method: "POST", body: JSON.stringify(order) })
  }, [])

  const updateOrderStatus = useCallback((id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const allowed = STATUS_FLOW[o.status]
        if (!allowed.includes(newStatus)) return o
        const updated = {
          ...o,
          status: newStatus,
          statusHistory: [...o.statusHistory, { status: newStatus, timestamp: new Date().toISOString() }],
        }
        api(`/${id}`, { method: "PUT", body: JSON.stringify(updated) })
        return updated
      }),
    )
  }, [])

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
    api(`/${id}`, { method: "DELETE" })
  }, [])

  const bulkUpdateOrders = useCallback(async (ids: string[], action: string, newStatus?: OrderStatus) => {
    const result = await api<{ success?: boolean; results?: any[] }>("/", {
      method: "PATCH",
      body: JSON.stringify({ orderIds: ids, action, newStatus })
    })
    if (!result) return
    if (action === "bulk_status" && newStatus) {
      setOrders(prev => prev.map(o =>
        ids.includes(o.id) ? { ...o, status: newStatus, statusHistory: [...o.statusHistory, { status: newStatus, timestamp: new Date().toISOString() }] } : o
      ))
    }
    if (action === "bulk_delete") {
      setOrders(prev => prev.filter(o => !ids.includes(o.id)))
    }
    if (action === "postex_push" && result.results) {
      const successIds = result.results.filter(r => r.success).map(r => r.orderId)
      setOrders(prev => prev.map(o =>
        successIds.includes(o.id) ? { ...o, status: "processing" as OrderStatus } : o
      ))
    }
  }, [])

  const getOrderById = useCallback((id: string) => orders.find((o) => o.id === id), [orders])

  return (
    <OrdersContext.Provider value={{ orders, hydrated, addOrder, updateOrderStatus, deleteOrder, getOrderById, bulkUpdateOrders }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider")
  return ctx
}

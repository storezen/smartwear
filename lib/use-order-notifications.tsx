"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export interface OrderNotification {
  id: string
  customer_name: string
  total: number
  status: string
  created_at: string
  read: boolean
}

interface UseOrderNotificationsReturn {
  notifications: OrderNotification[]
  unreadCount: number
  markAllRead: () => void
  dismiss: (id: string) => void
  isConnected: boolean
}

export function useOrderNotifications(): UseOrderNotificationsReturn {
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const lastIdRef = useRef<string | null>(null)
  const initializedRef = useRef(false)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const addNotification = useCallback((notif: OrderNotification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notif.id)) return prev
      return [notif, ...prev].slice(0, 20)
    })

    toast.success(
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold">New Order</span>
        <span className="text-xs text-white/70 truncate">
          {notif.customer_name} — PKR {notif.total.toLocaleString()}
        </span>
      </div>,
      {
        duration: 6000,
        action: {
          label: "View",
          onClick: () => window.open("/admin/orders", "_self"),
        },
      }
    )
  }, [])

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/orders")
      if (!res.ok) return
      const data = await res.json()
      const orders: any[] = Array.isArray(data) ? data : data.orders ?? []
      if (orders.length === 0) return
      const latest = orders[0]
      if (!latest) return

      if (!initializedRef.current) {
        lastIdRef.current = latest.id
        initializedRef.current = true
        return
      }

      if (latest.id !== lastIdRef.current) {
        lastIdRef.current = latest.id
        addNotification({
          id: latest.id,
          customer_name: latest.customer_name || latest.customer?.name || "Guest",
          total: latest.total || 0,
          status: latest.status || "Pending",
          created_at: latest.created_at || new Date().toISOString(),
          read: false,
        })
      }
    } catch {}
  }, [addNotification])

  useEffect(() => {
    let channel: any = null

    if (supabase) {
      try {
        channel = supabase
          .channel("order-notifications")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders" },
            (payload: any) => {
              const row = payload.new as any
              if (!row) return
              lastIdRef.current = row.id
              initializedRef.current = true
              addNotification({
                id: row.id,
                customer_name: row.customer_name || row.customer?.name || "Guest",
                total: row.total || 0,
                status: row.status || "Pending",
                created_at: row.created_at || new Date().toISOString(),
                read: false,
              })
            }
          )
          .subscribe((status: string) => {
            setIsConnected(status === "SUBSCRIBED")
          })
      } catch {
        channel = null
      }
    }

    fetchLatest()
    pollTimerRef.current = setInterval(fetchLatest, 8000)

    return () => {
      if (channel) {
        try {
          supabase?.removeChannel(channel)
        } catch {}
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
      }
    }
  }, [addNotification, fetchLatest])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount, markAllRead, dismiss, isConnected }
}

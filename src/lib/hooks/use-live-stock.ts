import { useState, useEffect } from "react"

export interface LiveStockData {
  productId: string
  stockCount: number
  warehouse: string
  isLow: boolean
  message: string
  loading: boolean
}

export function useLiveStock(productId: string, initialStock = 12) {
  const [data, setData] = useState<LiveStockData>({
    productId,
    stockCount: initialStock,
    warehouse: "Lahore Main Warehouse",
    isLow: initialStock <= 5,
    message: `Connecting to live inventory stream...`,
    loading: true
  })

  useEffect(() => {
    if (!productId) return

    let active = true

    async function fetchStock() {
      try {
        const res = await fetch(`/api/products/${productId}/live-stock`)
        if (res.ok && active) {
          const json = await res.json()
          setData({
            productId: json.productId,
            stockCount: json.stockCount,
            warehouse: json.warehouse,
            isLow: json.isLow,
            message: json.message,
            loading: false
          })
        }
      } catch (err) {
        console.error("Failed to fetch live stock:", err)
      }
    }

    fetchStock()

    // Poll every 8 seconds to mock a real-time reactive PostgreSQL/Supabase stream
    const interval = setInterval(fetchStock, 8000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [productId])

  return data
}

import { create } from "zustand"

export interface StatusHistoryItem {
  status: string
  timestamp: string
  location?: string
  description?: string
}

export interface TrackedOrder {
  id: string
  productName: string
  productImage: string
  total: number
  status: string
  statusHistory: StatusHistoryItem[]
  customerName: string
  address: string
  city: string
  createdAt: string
}

interface OrderStore {
  order: TrackedOrder | null
  isLoading: boolean
  error: string | null
  fetchOrder: (orderId: string, phone: string) => Promise<void>
  clearOrder: () => void
}

export const useOrderStore = create<OrderStore>()((set) => ({
  order: null,
  isLoading: false,
  error: null,
  fetchOrder: async (orderId: string, phone: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(phone)}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch order details")
      }
      const data: TrackedOrder = await res.json()
      set({ order: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || "An unexpected error occurred", isLoading: false })
    }
  },
  clearOrder: () => set({ order: null, error: null })
}))

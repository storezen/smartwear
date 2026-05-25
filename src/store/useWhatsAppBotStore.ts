import { create } from "zustand"

export interface MessageLogItem {
  id: string
  orderId: string | null
  recipient: string
  messageType: string
  status: string
  responsePayload: string | null
  createdAt: string
}

export interface KeywordResponder {
  keyword: string
  reply: string
}

interface WhatsAppBotState {
  // Connection Status
  botStatus: "CONNECTED" | "QR_RECEIVED" | "INITIALIZING" | "DISCONNECTED"
  qrCode: string | null
  
  // Platform Sync Status
  platformOrderCount: number
  whatsappSentCount: number
  logs: MessageLogItem[]
  
  // Settings / Automation switches
  autoConfirm: boolean
  autoTracking: boolean
  keywords: KeywordResponder[]
  
  // Loading & Errors
  isLoading: boolean
  isSaving: boolean
  error: string | null
  
  // Polling control
  pollIntervalId: NodeJS.Timeout | null

  // Actions
  fetchBotStatus: () => Promise<void>
  restartSession: () => Promise<void>
  fetchSyncStats: () => Promise<void>
  fetchSettings: () => Promise<void>
  saveSettings: (settings: { autoConfirm: boolean; autoTracking: boolean; keywords: KeywordResponder[] }) => Promise<boolean>
  sendTestMessage: (to: string, message: string) => Promise<boolean>
  startPolling: () => void
  stopPolling: () => void
}

export const useWhatsAppBotStore = create<WhatsAppBotState>()((set, get) => ({
  botStatus: "DISCONNECTED",
  qrCode: null,
  platformOrderCount: 0,
  whatsappSentCount: 0,
  logs: [],
  autoConfirm: false,
  autoTracking: false,
  keywords: [],
  isLoading: false,
  isSaving: false,
  error: null,
  pollIntervalId: null,

  fetchBotStatus: async () => {
    try {
      const res = await fetch("/api/whatsapp/bot/status")
      if (res.ok) {
        const data = await res.json()
        set({
          botStatus: data.status,
          qrCode: data.qr
        })
      }
    } catch (err: unknown) {
      set({ botStatus: "DISCONNECTED", qrCode: null })
    }
  },

  restartSession: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch("/api/whatsapp/bot/restart", { method: "POST" })
      if (!res.ok) {
        throw new Error("Failed to restart WhatsApp session")
      }
      set({ botStatus: "INITIALIZING", qrCode: null, isLoading: false })
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to restart", isLoading: false })
    }
  },

  fetchSyncStats: async () => {
    try {
      const res = await fetch("/api/whatsapp/sync")
      if (res.ok) {
        const data = await res.json()
        set({
          platformOrderCount: data.platformOrderCount,
          whatsappSentCount: data.whatsappSentCount,
          logs: data.realtimeLogs
        })
      }
    } catch {
      // Fail silently for polling
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch("/api/whatsapp/settings")
      if (!res.ok) throw new Error("Failed to fetch settings")
      const data = await res.json()
      set({
        autoConfirm: data.autoConfirm,
        autoTracking: data.autoTracking,
        keywords: data.keywords,
        isLoading: false
      })
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to fetch settings", isLoading: false })
    }
  },

  saveSettings: async (updatedSettings) => {
    set({ isSaving: true, error: null })
    try {
      const res = await fetch("/api/whatsapp/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      })

      if (!res.ok) throw new Error("Failed to save settings")
      
      set({
        autoConfirm: updatedSettings.autoConfirm,
        autoTracking: updatedSettings.autoTracking,
        keywords: updatedSettings.keywords,
        isSaving: false
      })
      return true
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to save settings", isSaving: false })
      return false
    }
  },

  sendTestMessage: async (to, message) => {
    set({ isSaving: true, error: null })
    try {
      const res = await fetch("/api/whatsapp/bot/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to send message")
      }

      set({ isSaving: false })
      get().fetchSyncStats()
      return true
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Failed to send", isSaving: false })
      return false
    }
  },

  startPolling: () => {
    const existingId = get().pollIntervalId
    if (existingId) return // Already polling

    // Fetch once immediately
    get().fetchBotStatus()
    get().fetchSyncStats()

    const intervalId = setInterval(() => {
      get().fetchBotStatus()
      get().fetchSyncStats()
    }, 5000)

    set({ pollIntervalId: intervalId })
  },

  stopPolling: () => {
    const intervalId = get().pollIntervalId
    if (intervalId) {
      clearInterval(intervalId)
      set({ pollIntervalId: null })
    }
  }
}))

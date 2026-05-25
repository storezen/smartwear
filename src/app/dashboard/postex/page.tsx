"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Truck, Save, Search, Eye, EyeOff, Package, History, Clock, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const API_KEY_STORAGE = "smartwear-postex-api-key"
const TRACKING_HISTORY_KEY = "smartwear-postex-tracking-history"

interface TrackingEntry {
  trackingId: string
  status: string
  timestamp: string
  error?: string
}

function getSavedApiKey(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(API_KEY_STORAGE) || ""
}

function getTrackingHistory(): TrackingEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(TRACKING_HISTORY_KEY) || "[]")
  } catch {
    return []
  }
}

function saveTrackingHistory(entries: TrackingEntry[]) {
  localStorage.setItem(TRACKING_HISTORY_KEY, JSON.stringify(entries))
}

export default function PostExPage() {
  const [apiKey, setApiKey] = useState(getSavedApiKey)
  const [showKey, setShowKey] = useState(false)
  const [trackingId, setTrackingId] = useState("")
  const [trackingResult, setTrackingResult] = useState<Record<string, unknown> | null>(null)
  const [tracking, setTracking] = useState(false)
  const [history, setHistory] = useState<TrackingEntry[]>([])

  useEffect(() => {
    setHistory(getTrackingHistory())
  }, [])

  const handleSaveKey = useCallback(() => {
    localStorage.setItem(API_KEY_STORAGE, apiKey)
    toast.success("API key saved")
  }, [apiKey])

  const handleTrack = useCallback(async () => {
    if (!trackingId) {
      toast.error("Enter a tracking ID")
      return
    }
    setTracking(true)
    setTrackingResult(null)
    try {
      const res = await fetch("/api/integrations/postex/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId, apiKey }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Tracking failed")
      }
      const data = await res.json()
      setTrackingResult(data)
      const entry: TrackingEntry = { trackingId, status: data.shipment?.status || "found", timestamp: new Date().toISOString() }
      const updated = [entry, ...history.filter((h) => h.trackingId !== trackingId)].slice(0, 10)
      setHistory(updated)
      saveTrackingHistory(updated)
      toast.success("Shipment found")
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Failed to track"
      const entry: TrackingEntry = { trackingId, status: "error", timestamp: new Date().toISOString(), error: errMsg }
      const updated = [entry, ...history].slice(0, 10)
      setHistory(updated)
      saveTrackingHistory(updated)
      toast.error(errMsg)
    } finally {
      setTracking(false)
    }
  }, [trackingId, apiKey, history])

  const shipment = trackingResult?.shipment as Record<string, unknown> | undefined
  const events = (shipment?.events as Record<string, unknown>[]) || []

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-heading text-xl font-semibold text-foreground">PostEx</h1>
        <p className="mt-1 text-sm text-muted-foreground">Shipment tracking and logistics integration.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="grid gap-5 sm:grid-cols-3"
      >
        {[
          { label: "API Key", value: apiKey ? `${apiKey.slice(0, 8)}...` : "Not set", icon: Truck, bg: apiKey ? "bg-emerald-50 border-emerald-200" : "bg-neutral-50 border-neutral-200", color: apiKey ? "text-emerald-600" : "text-neutral-500" },
          { label: "Trackings", value: history.filter((h) => h.status !== "error").length, icon: Search, bg: "bg-blue-50 border-blue-200", color: "text-blue-600" },
          { label: "Quick Actions", value: "3 available", icon: Package, bg: "bg-purple-50 border-purple-200", color: "text-purple-600" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex items-center gap-4 rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-neutral-200/60 transition-all hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-0.5"
          >
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border", s.bg, s.color)}>
              <s.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{s.label}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-neutral-900 truncate">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Truck className="size-5 text-neutral-500" strokeWidth={2} /> API Configuration
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">Save your PostEx API key for tracking.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">API Key</Label>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="pk_..."
                    className="pr-12 h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono font-medium text-neutral-900"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    {showKey ? <EyeOff className="size-4" strokeWidth={2} /> : <Eye className="size-4" strokeWidth={2} />}
                  </button>
                </div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Key is saved locally and passed with each tracking request.</p>
              </div>
              <Button onClick={handleSaveKey} className="gap-2 h-[48px] px-8 rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <Save className="size-4" strokeWidth={2} /> Save Key
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Search className="size-5 text-neutral-500" strokeWidth={2} /> Track Shipment
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">Enter a PostEx tracking ID to get status.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Tracking ID</Label>
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="PEX-123456"
                  className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900"
                />
              </div>
              <Button onClick={handleTrack} disabled={tracking || !apiKey} className="gap-2 h-[48px] px-8 rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed">
                {tracking ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <Search className="size-4" strokeWidth={2} />}
                {tracking ? "Tracking..." : "Track"}
              </Button>
              {!apiKey && <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Save an API key first to track shipments.</p>}

              {trackingResult && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-[20px] border border-neutral-200/60 bg-neutral-50/50 p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-bold text-neutral-900">{shipment?.trackingId as string || trackingId}</p>
                        <p className="text-sm font-medium text-neutral-500">Order: {shipment?.orderId as string || "—"}</p>
                      </div>
                      <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase shadow-sm",
                        shipment?.status === "delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                      )}>
                        {shipment?.status as string || "Unknown"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm font-medium text-neutral-600 mb-4 bg-white rounded-xl border border-neutral-200/60 p-4">
                      <div className="flex items-center gap-2"><MapPin className="size-4 text-neutral-400" /> <span className="truncate">{shipment?.origin as string || "—"}</span></div>
                      <div className="flex items-center gap-2"><MapPin className="size-4 text-neutral-400" /> <span className="truncate">{shipment?.destination as string || "—"}</span></div>
                      {!!shipment?.estimatedDelivery && (
                        <div className="flex items-center gap-2 col-span-2 pt-2 border-t border-neutral-100"><Clock className="size-4 text-neutral-400" /> Est: {String(shipment.estimatedDelivery)}</div>
                      )}
                    </div>

                    {events.length > 0 && (
                      <div className="space-y-3 bg-white rounded-xl border border-neutral-200/60 p-4">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Tracking History</p>
                        <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-neutral-200">
                          {events.map((event, i) => (
                            <div key={i} className="relative flex gap-4 pl-8 pb-4 last:pb-0">
                              <span className={cn("absolute left-1.5 top-1.5 h-3 w-3 rounded-full ring-4 ring-white", i === 0 ? "bg-blue-500" : "bg-neutral-300")} />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-neutral-900">{event.status as string}</p>
                                <p className="text-xs font-medium text-neutral-500 mt-0.5">{event.location as string}</p>
                                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{event.description as string}</p>
                                <p className="text-[11px] font-bold text-neutral-400 mt-1">{event.date as string}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <History className="size-5 text-neutral-500" strokeWidth={2} /> Recent Trackings
              </h3>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-neutral-400">
                  <Search className="size-8 mb-3 opacity-50" strokeWidth={1.5} />
                  <p className="text-sm font-medium">No tracking history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-4 transition-colors hover:bg-neutral-100/80">
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{entry.trackingId}</p>
                        <p className="text-xs font-medium text-neutral-500 mt-0.5">{new Date(entry.timestamp).toLocaleString("en-PK")}</p>
                      </div>
                      {entry.error ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase bg-red-50 text-red-600 border border-red-100">Failed</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-100">{entry.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Package className="size-5 text-neutral-500" strokeWidth={2} /> Quick Actions
              </h3>
            </div>
            <div className="p-6 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Create Shipment", desc: "Create a new shipment order", action: "Coming Soon" },
                { title: "Get Rates", desc: "Check courier rates & estimates", action: "Coming Soon" },
                { title: "Cancel", desc: "Cancel an existing shipment", action: "Coming Soon" },
              ].map((s) => (
                <div key={s.title} className="rounded-2xl border border-neutral-200/60 p-4 bg-white flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm font-bold text-neutral-900">{s.title}</p>
                  <p className="text-[11px] font-medium text-neutral-500 mt-1 flex-1 leading-relaxed">{s.desc}</p>
                  <Button variant="outline" size="sm" disabled className="mt-4 rounded-full h-8 text-xs font-bold bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed">
                    {s.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

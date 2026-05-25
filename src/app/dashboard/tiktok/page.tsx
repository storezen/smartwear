"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Save, Smartphone, Info, Play, Check, X, Loader2, Sparkles, Sliders, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { loadTikTokPixel, trackTikTokEvent } from "@/lib/integrations/tiktok-pixel"
import type { TikTokConfig } from "@/components/providers/tiktok-pixel-provider"

const DEFAULT_CONFIG = {
  events: {
    PageView: true,
    ViewContent: true,
    AddToCart: true,
    Purchase: true,
    Search: true,
  },
  advancedMatching: false,
  currency: "USD",
}

const testEvents = ["PageView", "ViewContent", "AddToCart", "Purchase"]

export default function TikTokPage() {
  const [pixelId, setPixelId] = useState("")
  const [enabled, setEnabled] = useState(false)
  const [config, setConfig] = useState<TikTokConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [firing, setFiring] = useState<string | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])

  useEffect(() => {
    Promise.all([
      fetch("/api/settings/TIKTOK_PIXEL_ID").then(r => r.json()),
      fetch("/api/settings/TIKTOK_PIXEL_ENABLED").then(r => r.json()),
      fetch("/api/settings/TIKTOK_CONFIG").then(r => r.json())
    ]).then(([idRes, enRes, cfgRes]) => {
      if (idRes.value) setPixelId(idRes.value)
      if (enRes.value === "true") setEnabled(true)
      if (cfgRes.value) {
        try { setConfig(JSON.parse(cfgRes.value)) } catch (e) {}
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await Promise.all([
        fetch("/api/settings/TIKTOK_PIXEL_ID", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: pixelId }),
        }),
        fetch("/api/settings/TIKTOK_PIXEL_ENABLED", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: enabled.toString() }),
        }),
        fetch("/api/settings/TIKTOK_CONFIG", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: JSON.stringify(config) }),
        })
      ])
      if (enabled && pixelId) {
        loadTikTokPixel(pixelId)
      }
      toast.success("God Mode Active: TikTok Settings saved globally")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }, [pixelId, enabled, config])

  const handleTestEvent = useCallback(async (event: string) => {
    setFiring(event)
    try {
      trackTikTokEvent(event as never)
      setEventLog((prev) => [`${event} — ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 20))
      toast.success(`"${event}" event fired to TikTok`)
    } catch {
      toast.error(`Failed to fire "${event}"`)
    } finally {
      setFiring(null)
    }
  }, [])

  const isConfigured = !!(pixelId && enabled)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
          TikTok Pixel <Sparkles className="size-5 text-fuchsia-500" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">God Mode setup: 0 effort integration. Enter ID, turn on, done.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="grid gap-5 sm:grid-cols-3"
      >
        {[
          { label: "Integration Status", value: isConfigured ? "Tracking Live" : "Offline", icon: isConfigured ? Check : X, bg: isConfigured ? "bg-emerald-50 border-emerald-200" : "bg-neutral-50 border-neutral-200", color: isConfigured ? "text-emerald-600" : "text-neutral-500" },
          { label: "Active Pixel ID", value: loading ? "Loading..." : (pixelId || "Not Set"), icon: Smartphone, bg: "bg-fuchsia-50 border-fuchsia-200", color: "text-fuchsia-600" },
          { label: "Test Events Fired", value: eventLog.length, icon: Play, bg: "bg-blue-50 border-blue-200", color: "text-blue-600" },
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-6">
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-neutral-200/60 bg-gradient-to-r from-fuchsia-50/50 to-blue-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Smartphone className="size-5 text-fuchsia-500" strokeWidth={2} /> One-Click Setup
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">
                Paste your pixel ID and enable. We handle all event auto-tracking.
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">TikTok Pixel ID</Label>
                <Input
                  placeholder="e.g. CXABC1234567890"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  disabled={loading}
                  className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono font-bold text-neutral-900 focus-visible:ring-fuchsia-500"
                />
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide mt-1">Found in TikTok Ads Manager &gt; Tools &gt; Events</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-4">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-neutral-900">Enable Tracking</Label>
                  <p className="text-xs font-medium text-neutral-500">Instantly fires events across your store.</p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-neutral-200/60">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Shield className="size-5 text-neutral-500" strokeWidth={2} /> Advanced Matching
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">
                Send securely hashed customer data to TikTok to improve ad targeting and attribution.
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-4">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-neutral-900">Enable Advanced Matching</Label>
                  <p className="text-xs font-medium text-neutral-500">Requires Privacy Policy update.</p>
                </div>
                <Switch checked={config.advancedMatching} onCheckedChange={(v) => setConfig({ ...config, advancedMatching: v })} disabled={loading} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="space-y-6">
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-neutral-200/60">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Sliders className="size-5 text-neutral-500" strokeWidth={2} /> Event Configuration
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">
                Granular control over which events are sent to TikTok.
              </p>
            </div>
            <div className="p-6 space-y-4">
              {Object.keys(DEFAULT_CONFIG.events).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-neutral-900">{key}</Label>
                  <Switch 
                    checked={config.events[key as keyof typeof config.events]} 
                    onCheckedChange={(v) => setConfig({ ...config, events: { ...config.events, [key]: v } })} 
                    disabled={loading} 
                  />
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-neutral-200/60 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Store Currency</Label>
                <Input
                  placeholder="PKR"
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  disabled={loading}
                  className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono font-bold text-neutral-900"
                />
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading || saving} className="w-full gap-2 h-[56px] rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-base">
            {saving ? <Loader2 className="size-5 animate-spin" strokeWidth={2} /> : <Sparkles className="size-5 text-fuchsia-400" strokeWidth={2} />}
            {saving ? "Deploying Configuration..." : "Deploy Full Integration"}
          </Button>
        </motion.div>
      </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Play className="size-5 text-neutral-500" strokeWidth={2} /> Test Events
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">Fire test events to verify your pixel is working.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-3">
                {testEvents.map((event) => (
                  <Button
                    key={event}
                    variant="outline"
                    disabled={!isConfigured || firing === event}
                    onClick={() => handleTestEvent(event)}
                    className="gap-2 h-10 px-5 rounded-full font-bold bg-white border-neutral-200/60 text-neutral-700 hover:bg-neutral-50 shadow-sm"
                  >
                    {firing === event ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <Play className="size-4" strokeWidth={2} />}
                    {event}
                  </Button>
                ))}
              </div>
              {!isConfigured && <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Save a Pixel ID and enable it to fire test events.</p>}

              {eventLog.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200/60 space-y-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Event Log</p>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {eventLog.map((log, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-neutral-50/50 border border-neutral-200/60 p-3 shadow-inner">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-neutral-700 font-mono">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Info className="size-5 text-neutral-500" strokeWidth={2} /> How It Works
            </h3>
          </div>
          <div className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[20px] border border-neutral-200/60 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-neutral-900 mb-4">Auto-Tracked Events</p>
                <ul className="space-y-3 text-sm font-medium text-neutral-500">
                  {[
                    { event: "PageView", desc: "Any page visit" },
                    { event: "ViewContent", desc: "Product detail page" },
                    { event: "AddToCart", desc: "Product added to cart" },
                    { event: "Purchase", desc: "Order completed" },
                  ].map((e) => (
                    <li key={e.event} className="flex items-center gap-3">
                      <span className="rounded-lg bg-neutral-100 px-2.5 py-1 font-mono text-xs font-bold text-neutral-900 border border-neutral-200/60">{e.event}</span>
                      <span>{e.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[20px] border border-neutral-200/60 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-neutral-900 mb-4">Requirements</p>
                <ul className="space-y-3 text-sm font-medium text-neutral-500">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    TikTok Pixel ID from Events Manager
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Pixel enabled in settings above
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span>For server-side: set <code className="rounded-lg bg-neutral-100 px-1.5 py-0.5 font-mono text-xs font-bold border border-neutral-200/60 text-neutral-900">TIKTOK_ACCESS_TOKEN</code> env var</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

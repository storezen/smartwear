"use client"

import { memo, useMemo, useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Eye, ShoppingCart, FileText, CreditCard, Search, MapPin, Clock, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import type { AnalyticsEvent } from "@/lib/analytics"

interface LiveEventsFeedProps {
  events: AnalyticsEvent[]
}

const EVENT_META: Record<string, { label: string; color: string; Icon: any }> = {
  PageView: { label: "Visit", color: "#6B7280", Icon: Eye },
  ViewContent: { label: "View", color: "#6366F1", Icon: Search },
  AddToCart: { label: "Cart", color: "#F59E0B", Icon: ShoppingCart },
  InitiateCheckout: { label: "Checkout", color: "#EC4899", Icon: FileText },
  Purchase: { label: "Purchase", color: "#10B981", Icon: CreditCard },
  CompletePayment: { label: "Payment", color: "#10B981", Icon: CreditCard },
}

const EVENT_TABS = [
  { key: "all", label: "All" },
  { key: "Purchase", label: "Purchases" },
  { key: "AddToCart", label: "Cart" },
  { key: "ViewContent", label: "Views" },
]

function formatTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 5000) return "now"
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h`
}

export const LiveEventsFeed = memo(function LiveEventsFeed({ events }: LiveEventsFeedProps) {
  const [filter, setFilter] = useState("all")
  const [collapsed, setCollapsed] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (filter === "all") return events.slice(0, 50)
    return events.filter(e => e.base_event === filter).slice(0, 50)
  }, [events, filter])

  const stats = useMemo(() => ({
    total: events.length,
    purchases: events.filter(e => e.base_event === "Purchase" || e.base_event === "CompletePayment").length,
    carts: events.filter(e => e.base_event === "AddToCart").length,
    views: events.filter(e => e.base_event === "ViewContent").length,
  }), [events])

  // Auto-scroll to top on new events
  useEffect(() => {
    if (listRef.current && filtered.length > 0) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [events.length])

  const latestEvent = events[0]
  const latestMeta = latestEvent ? EVENT_META[latestEvent.base_event] || { label: "Event", color: "#6B7280", Icon: Activity } : null

  if (!events.length) {
    return (
      <div className="bg-[#0F1923] rounded-xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[9px] tracking-[1.5px] text-white/60">LIVE FEED</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white/15" />
            </div>
            <p className="text-[11px] text-white/25">Awaiting visitors...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0F1923] rounded-xl border border-white/5 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-[9px] tracking-[1.5px] text-white/60">LIVE FEED</span>
            <span className="text-[9px] text-white/15 font-mono">{stats.total}</span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/20 hover:text-white/50 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ── Stat Ticker ── */}
        <div className="flex items-center gap-2">
          {[
            { label: "Purchases", count: stats.purchases, color: "bg-emerald-500", dot: "bg-emerald-400" },
            { label: "Cart", count: stats.carts, color: "bg-[#F59E0B]", dot: "bg-[#F59E0B]" },
            { label: "Views", count: stats.views, color: "bg-[#6366F1]", dot: "bg-[#6366F1]" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className="text-[9px] font-medium text-white/40">{s.label}</span>
              <span className="text-[9px] font-mono font-bold text-white/70 tabular-nums">{s.count}</span>
            </div>
          ))}

          {/* Latest event preview */}
          {latestMeta && !collapsed && (
            <div className="flex items-center gap-1.5 ml-auto text-[9px] text-white/25 truncate max-w-[140px]">
              <Sparkles className="w-2.5 h-2.5 text-[#B8860B] shrink-0" />
              <span className="truncate">{latestEvent?.item_name || latestMeta.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      {!collapsed && (
        <div className="flex items-center gap-0.5 px-4 py-2 border-b border-white/[0.04] bg-white/[0.01]">
          {EVENT_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-[9px] px-2 py-1 rounded-md font-medium transition-all ${
                filter === tab.key
                  ? "bg-[#B8860B]/15 text-[#B8860B]"
                  : "text-white/25 hover:text-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Events List ── */}
      {!collapsed && (
        <div
          ref={listRef}
          className="overflow-y-auto custom-scrollbar relative max-h-[360px]"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((event, i) => {
              const meta = EVENT_META[event.base_event] || { label: event.base_event, color: "#6B7280", Icon: Activity }
              const isPurchase = event.base_event === "Purchase" || event.base_event === "CompletePayment"
              const isCart = event.base_event === "AddToCart"

              return (
                <motion.div
                  key={event.id || i}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.5 }}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-white/[0.015] transition-colors border-b border-white/[0.01] last:border-0 group"
                >
                  <div className={`w-1 h-1 rounded-full shrink-0 ${
                    isPurchase ? "bg-emerald-400" : isCart ? "bg-[#B8860B]" : "bg-white/10"
                  }`} />

                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isPurchase ? "bg-emerald-500/10 text-emerald-400" :
                    isCart ? "bg-[#B8860B]/10 text-[#B8860B]" :
                    "bg-white/[0.03] text-white/30"
                  }`}>
                    <meta.Icon className="w-3 h-3" />
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className={`text-[11px] truncate max-w-[160px] ${
                      isPurchase ? "text-emerald-400 font-semibold" :
                      isCart ? "text-[#B8860B] font-medium" :
                      "text-white/70"
                    }`}>
                      {event.item_name || meta.label}
                    </span>
                    <span className="text-[8px] text-white/20 shrink-0 hidden sm:inline">{meta.label}</span>
                  </div>

                  <span className="text-[8px] text-white/20 font-mono flex items-center gap-1 shrink-0">
                    <MapPin className="w-2 h-2" />{event.city || "PK"}
                  </span>

                  <span className="text-[8px] text-white/15 font-mono shrink-0 w-8 text-right">
                    {formatTimeAgo(event.timestamp)}
                  </span>

                  {isPurchase && event.value > 0 && (
                    <span className="text-[10px] font-bold text-emerald-400 tabular-nums shrink-0 w-16 text-right">
                      ₨{event.value.toLocaleString()}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Fade out gradient at bottom */}
          <div className="sticky bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0F1923] to-transparent pointer-events-none" />

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-8 text-[11px] text-white/20">
              No events
            </div>
          )}
        </div>
      )}
    </div>
  )
})

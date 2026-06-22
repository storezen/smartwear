"use client"

import { memo, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Eye, ShoppingCart, FileText, CreditCard, Search, MapPin, Clock, Filter } from "lucide-react"
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
  const sec = Math.floor(diff / 1000)
  if (sec < 5) return "now"
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

export const LiveEventsFeed = memo(function LiveEventsFeed({ events }: LiveEventsFeedProps) {
  const [filter, setFilter] = useState("all")

  const filtered = useMemo(() => {
    if (filter === "all") return events.slice(0, 20)
    return events.filter(e => e.base_event === filter).slice(0, 20)
  }, [events, filter])

  const stats = useMemo(() => {
    const purchases = events.filter(e => e.base_event === "Purchase" || e.base_event === "CompletePayment").length
    const carts = events.filter(e => e.base_event === "AddToCart").length
    const views = events.filter(e => e.base_event === "ViewContent").length
    return { total: events.length, purchases, carts, views }
  }, [events])

  if (!events.length) {
    return (
      <div className="bg-[#0F1923] rounded-xl border border-white/5 overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-[9px] tracking-[1.5px] text-white/60">LIVE FEED</div>
            <h3 className="text-[13px] font-semibold text-white mt-0.5">Events</h3>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-[11px] text-white/25">No events yet</p>
            <p className="text-[8px] text-white/15 mt-1">Start browsing the store</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0F1923] rounded-xl border border-white/5 overflow-hidden h-full flex flex-col">
      <div className="shrink-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-white/60">LIVE FEED</div>
              <h3 className="text-[13px] font-semibold text-white mt-0.5">Events</h3>
            </div>
            <span className="text-[9px] text-white/20 font-mono tabular-nums mt-3">({stats.total})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[8px] text-white/30 font-medium">{stats.purchases}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <span className="text-[8px] text-white/30 font-medium">{stats.carts}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              <span className="text-[8px] text-white/30 font-medium">{stats.views}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-4 pb-2 border-b border-white/[0.04]">
          <Filter className="w-2.5 h-2.5 text-white/20 mr-1" />
          {EVENT_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-[9px] px-2 py-1 rounded-md font-medium transition-all ${
                filter === tab.key
                  ? "bg-[#B8860B]/15 text-[#B8860B] border border-[#B8860B]/20"
                  : "text-white/30 hover:text-white/60 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <AnimatePresence mode="popLayout">
          {filtered.map((event, i) => {
            const meta = EVENT_META[event.base_event] || { label: event.base_event, color: "#6B7280", Icon: Activity }
            const isNew = i === 0 && events.length > 1
            const isPurchase = event.base_event === "Purchase" || event.base_event === "CompletePayment"
            const isCart = event.base_event === "AddToCart"

            return (
              <motion.div
                key={event.id || i}
                layout
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors group border-b border-white/[0.015] last:border-0"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isPurchase
                    ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
                    : isCart
                      ? "bg-[#B8860B]/15 border border-[#B8860B]/20 text-[#B8860B]"
                      : "bg-white/[0.03] border border-white/5 text-white/30"
                }`}>
                  <meta.Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] truncate ${
                      isPurchase ? "text-emerald-400 font-semibold" : isCart ? "text-[#B8860B] font-semibold" : "text-white/80"
                    }`}>
                      {event.item_name}
                    </span>
                    {isNew && (
                      <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/15 px-1 py-0.5 rounded uppercase tracking-wider shrink-0">New</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-[8px] text-white/25">
                      <meta.Icon className="w-2 h-2" /> {meta.label}
                    </span>
                    <span className="text-[8px] text-white/25">•</span>
                    <span className="flex items-center gap-0.5 text-[8px] text-white/25">
                      <MapPin className="w-2 h-2" /> {event.city || "PK"}
                    </span>
                    <span className="text-[8px] text-white/25">•</span>
                    <span className="flex items-center gap-0.5 text-[8px] text-white/20 font-mono">
                      <Clock className="w-2 h-2" /> {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                </div>

                {isPurchase && event.value > 0 && (
                  <span className="text-[11px] font-bold text-emerald-400 tabular-nums shrink-0">
                    ₨{event.value.toLocaleString()}
                  </span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-[11px] text-white/25">
          No {filter === "all" ? "" : filter} events yet
        </div>
      )}
    </div>
  )
})

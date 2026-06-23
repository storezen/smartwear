export const SOURCE_COLORS: Record<string, string> = {
  "Direct / Organic": "#6B7280",
  "TikTok": "#00f2ea",
  "TikTok Ad": "#00f2ea",
  "Instagram": "#E1306C",
  "Facebook": "#1877F2",
  "Meta Ads": "#1877F2",
  "Google": "#4285F4",
  "WhatsApp": "#25D366",
  "Email": "#EA4335",
  "Twitter": "#1DA1F2",
  "YouTube": "#FF0000",
  "Snapchat": "#FFFC00",
  "Pinterest": "#E60023",
}

const FALLBACK_COLORS = [
  "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#6366F1",
  "#14B8A6", "#F97316", "#06B6D4", "#84CC16", "#D946EF",
]

export interface AnalyticsEvent {
  id: string
  event_name: string
  base_event: string
  item_name: string
  city: string
  campaign: string
  session_id: string
  value: number
  timestamp: string
}

export interface FunnelStage {
  key: string
  label: string
  count: number
  conversionRate: number
  dropOffRate: number
}

export interface TrafficSource {
  name: string
  count: number
  percentage: number
  color: string
}

export interface HotProduct {
  name: string
  views: number
  rank: number
  trend: "up" | "down" | "stable"
}

export interface TimelinePoint {
  time: string
  count: number
  sessions: number
}

export interface LiveSummary {
  activeVisitors: number
  activeVisitorsTrend: number
  totalRevenue: number
  totalSessions: number
  totalOrders: number
  funnel: FunnelStage[]
  abandonmentRate: number
  trafficSources: TrafficSource[]
  hotProducts: HotProduct[]
  timeline: TimelinePoint[]
  locationBreakdown: { city: string; count: number }[]
}

export function parseEvent(raw: any): AnalyticsEvent {
  const parts = (raw.event_name || "").split("::")
  return {
    id: raw.id,
    event_name: raw.event_name,
    base_event: parts[0] || raw.event_name,
    item_name: parts[1] || "Store Visit",
    city: parts[2] || "PK",
    campaign: parts[3] || "Direct / Organic",
    session_id: parts[4] || raw.id,
    value: raw.value || 0,
    timestamp: raw.timestamp,
  }
}

const LAST_30_MIN = 30 * 60 * 1000
const LAST_2_HOURS = 2 * 60 * 60 * 1000

function isInWindow(ts: string, windowMs: number): boolean {
  return Date.now() - new Date(ts).getTime() <= windowMs
}

const ACTIVE_WINDOW_MS = 30_000

export function getActiveVisitors(events: AnalyticsEvent[]): number {
  if (typeof window === "undefined") {
    try {
      const { getActiveCount } = require("@/lib/presence")
      const count = getActiveCount()
      if (count > 0) return count
    } catch {}
  }
  return new Set(
    events.filter((e) => isInWindow(e.timestamp, ACTIVE_WINDOW_MS)).map((e) => e.session_id)
  ).size
}

export function getActiveVisitorsTrend(events: AnalyticsEvent[]): number {
  const now = Date.now()
  const current = new Set(
    events.filter((e) => now - new Date(e.timestamp).getTime() <= ACTIVE_WINDOW_MS).map((e) => e.session_id)
  )
  const previous = new Set(
    events.filter((e) => {
      const t = new Date(e.timestamp).getTime()
      return t >= now - 2 * ACTIVE_WINDOW_MS && t < now - ACTIVE_WINDOW_MS
    }).map((e) => e.session_id)
  )
  if (previous.size === 0) return current.size > 0 ? 100 : 0
  return Math.round(((current.size - previous.size) / previous.size) * 100)
}

const FUNNEL_DEF = [
  { key: "PageView", label: "Visitors" },
  { key: "ViewContent", label: "Product Views" },
  { key: "AddToCart", label: "Add to Cart" },
  { key: "InitiateCheckout", label: "Checkout" },
  { key: "Purchase", label: "Purchased" },
]

export function calculateFunnel(events: AnalyticsEvent[]): FunnelStage[] {
  const stages: Record<string, Set<string>> = {}
  for (const { key } of FUNNEL_DEF) stages[key] = new Set()

  for (const e of events) {
    if (e.base_event === "InitiateCheckout" || e.base_event === "Purchase" || e.base_event === "CompletePayment") {
      stages[e.base_event]?.add(e.id)
    } else {
      const s = stages[e.base_event]
      if (s) s.add(e.session_id)
    }
    if (e.base_event === "CompletePayment") stages["Purchase"]?.add(e.id)
    if (e.base_event === "RemoveFromCart") stages["AddToCart"]?.delete(e.session_id)
  }

  const topCount = Math.max(stages["PageView"]?.size || 0, 1)
  let prev = -1

  return FUNNEL_DEF.map(({ key, label }) => {
    const count = stages[key]?.size || 0
    const conversionRate = Math.round((count / topCount) * 1000) / 10
    const dropOffRate =
      prev >= 0
        ? Math.round(((prev - count) / Math.max(prev, 1)) * 1000) / 10
        : 0
    prev = count
    return { key, label, count, conversionRate, dropOffRate }
  })
}

export function getAbandonmentRate(funnel: FunnelStage[]): number {
  const cart = funnel.find((s) => s.key === "AddToCart")
  const purchase = funnel.find((s) => s.key === "Purchase")
  if (!cart || cart.count === 0) return 0
  return Math.round(((cart.count - (purchase?.count || 0)) / cart.count) * 100)
}

export function getTrafficSources(events: AnalyticsEvent[]): TrafficSource[] {
  const map = new Map<string, number>()
  for (const e of events) {
    const c = e.campaign || "Direct / Organic"
    map.set(c, (map.get(c) || 0) + 1)
  }
  const total = Array.from(map.values()).reduce((a, b) => a + b, 0)
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      color: SOURCE_COLORS[name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }))
}

export function getHotProducts(events: AnalyticsEvent[]): HotProduct[] {
  const now = Date.now()
  const recent = new Map<string, number>()
  const older = new Map<string, number>()

  for (const e of events) {
    if (e.base_event === "ViewContent" && e.item_name !== "Store Visit") {
      const t = new Date(e.timestamp).getTime()
      if (t >= now - LAST_30_MIN) {
        recent.set(e.item_name, (recent.get(e.item_name) || 0) + 1)
      } else if (t >= now - LAST_2_HOURS) {
        older.set(e.item_name, (older.get(e.item_name) || 0) + 1)
      }
    }
  }

  const sorted = Array.from(recent.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return sorted.map(([name, views], i) => {
    const prev = older.get(name) || 0
    const trend: "up" | "down" | "stable" =
      prev === 0 ? "up" : views > prev * 1.2 ? "up" : views < prev * 0.8 ? "down" : "stable"
    return { name, views, rank: i + 1, trend }
  })
}

export function getTimeline(events: AnalyticsEvent[]): TimelinePoint[] {
  const now = Date.now()
  const cutoff = now - LAST_2_HOURS
  const countBuckets = new Map<number, number>()
  const sessionBuckets = new Map<number, Set<string>>()

  for (let i = 0; i < 120; i++) {
    const key = cutoff + i * 60000
    countBuckets.set(key, 0)
    sessionBuckets.set(key, new Set())
  }

  for (const e of events) {
    const t = new Date(e.timestamp).getTime()
    if (t >= cutoff) {
      const idx = Math.floor((t - cutoff) / 60000)
      const key = cutoff + idx * 60000
      countBuckets.set(key, (countBuckets.get(key) || 0) + 1)
      sessionBuckets.get(key)?.add(e.session_id)
    }
  }

  const fmt = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })

  return Array.from(countBuckets.entries()).map(([ts, count]) => ({
    time: fmt(ts),
    count,
    sessions: sessionBuckets.get(ts)?.size || 0,
  }))
}

export function getLocationBreakdown(events: AnalyticsEvent[]): { city: string; count: number }[] {
  const map = new Map<string, number>()
  for (const e of events) {
    const city = e.city || "PK"
    map.set(city, (map.get(city) || 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([city, count]) => ({ city, count }))
}

export function computeSummary(events: AnalyticsEvent[]): LiveSummary {
  const activeVisitors = getActiveVisitors(events)
  const activeVisitorsTrend = getActiveVisitorsTrend(events)
  const totalSessions = new Set(events.map((e) => e.session_id)).size
  const purchaseEvents = events.filter(
    (e) => e.base_event === "Purchase" || e.base_event === "CompletePayment"
  )
  const totalOrders = new Set(purchaseEvents.map((e) => e.id)).size
  const totalRevenue = purchaseEvents.reduce((s, e) => s + (e.value || 0), 0)
  const funnel = calculateFunnel(events)
  const abandonmentRate = getAbandonmentRate(funnel)
  const trafficSources = getTrafficSources(events)
  const hotProducts = getHotProducts(events)
  const timeline = getTimeline(events)
  const locationBreakdown = getLocationBreakdown(events)

  return {
    activeVisitors,
    activeVisitorsTrend,
    totalRevenue,
    totalSessions,
    totalOrders,
    funnel,
    abandonmentRate,
    trafficSources,
    hotProducts,
    timeline,
    locationBreakdown,
  }
}

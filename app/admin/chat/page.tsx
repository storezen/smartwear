"use client"

import { useState, useEffect } from "react"
import {
  MessageCircle,
  Users,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  HelpCircle,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0F1923] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl text-sm">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        <p className="font-bold text-[#C8972A]">{payload[0].value} messages</p>
      </div>
    )
  }
  return null
}

export default function AdminChatAnalytics() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function loadStats() {
    setLoading(true)
    try {
      const res = await fetch("/api/chat/stats")
      if (res.ok) setStats(await res.json())
    } catch (err) {
      console.error("Failed to load chat stats", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  const totalFeedback = (stats?.positiveFeedback || 0) + (stats?.negativeFeedback || 0)
  const satisfactionRate = totalFeedback > 0 ? Math.round((stats?.positiveFeedback / totalFeedback) * 100) : 0

  const statCards = [
    { title: "Total Messages", rawValue: stats?.totalMessages, icon: MessageCircle, accentColor: "#C8972A", iconBg: "rgba(200, 151, 42, 0.1)" },
    { title: "Total Sessions", rawValue: stats?.totalSessions, icon: Users, accentColor: "#3B82F6", iconBg: "rgba(59, 130, 246, 0.1)" },
    { title: "Sessions with Orders", rawValue: stats?.sessionsWithOrders, icon: ShoppingCart, accentColor: "#8B5CF6", iconBg: "rgba(139, 92, 246, 0.1)" },
    { title: "Chat→Order Rate", rawValue: stats?.conversionRate, suffix: "%", icon: TrendingUp, accentColor: "#10B981", iconBg: "rgba(16, 185, 129, 0.1)" },
    { title: "Messages Today", rawValue: stats?.messagesToday, icon: Calendar, accentColor: "#F59E0B", iconBg: "rgba(245, 158, 11, 0.1)" },
    { title: "Positive Feedback", rawValue: stats?.positiveFeedback, icon: ThumbsUp, accentColor: "#4ADE80", iconBg: "rgba(74, 222, 128, 0.1)" },
    { title: "Negative Feedback", rawValue: stats?.negativeFeedback, icon: ThumbsDown, accentColor: "#F87171", iconBg: "rgba(248, 113, 113, 0.1)" },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Chat Analytics</h1>
          <p className="text-[11px] text-white/60 mt-0.5">
            AI Chatbot performance, engagement & conversion metrics
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="sw-btn-ghost-white h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px]"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-4">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="bg-[#0F1923] rounded-xl border border-white/5 p-4">
                <div className="h-3 w-20 skeleton rounded mb-2" />
                <div className="h-6 w-16 skeleton rounded mb-1.5" />
                <div className="h-2.5 w-12 skeleton rounded" />
              </div>
            ))
          : statCards.map((s, i) => (
              <SpotlightCard key={i} className="p-4" style={{ borderLeft: `2px solid ${s.accentColor}` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] tracking-[1.5px] text-white/60 font-medium uppercase mb-1">
                      {s.title}
                    </p>
                    <p className="text-xl font-bold tracking-tight text-white leading-none">
                      {s.rawValue !== undefined ? (
                        s.suffix === "%" ? (
                          <span>{s.rawValue}<span className="text-sm text-white/60">%</span></span>
                        ) : (
                          <AnimatedCounter value={s.rawValue} />
                        )
                      ) : "--"}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                    <s.icon className="w-4 h-4" style={{ color: s.accentColor }} />
                  </div>
                </div>
              </SpotlightCard>
            ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-4">
        {/* Message Volume Chart */}
        <div className="lg:col-span-2 bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">MESSAGE VOLUME</div>
              <h3 className="text-[13px] font-semibold text-white">Last 7 Days</h3>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dailyMessages || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5 }}
                  tickFormatter={(v) => {
                    const d = new Date(v)
                    return d.toLocaleDateString("en-US", { weekday: "short" })
                  }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#C8972A" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Satisfaction Score */}
        <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3">
            <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">SATISFACTION</div>
            <h3 className="text-[13px] font-semibold text-white">Feedback Score</h3>
          </div>
          <div className="flex flex-col items-center justify-center h-48">
            {totalFeedback > 0 ? (
              <>
                <div className="relative w-28 h-28 mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none" stroke="#4ADE80"
                      strokeWidth="3"
                      strokeDasharray={`${satisfactionRate} ${100 - satisfactionRate}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{satisfactionRate}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-[#4ADE80]"><ThumbsUp className="w-3 h-3" /> {stats?.positiveFeedback}</span>
                  <span className="flex items-center gap-1 text-[#F87171]"><ThumbsDown className="w-3 h-3" /> {stats?.negativeFeedback}</span>
                </div>
              </>
            ) : (
              <div className="text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-white/15" />
                <p className="text-[12px] text-white/60">No feedback yet</p>
                <p className="text-[10px] text-white/60 mt-0.5">Feedback appears after users rate responses</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Questions */}
      <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">INSIGHTS</div>
            <h3 className="text-[13px] font-semibold text-white">Most Asked Topics</h3>
          </div>
        </div>
        <div className="space-y-1">
          {stats?.topQuestions?.length > 0 ? (
            stats.topQuestions.map((q: any, i: number) => (
              <div key={q.question} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-bold text-white/60 w-4 shrink-0">{i + 1}</span>
                <HelpCircle className="w-3.5 h-3.5 text-[#C8972A] shrink-0" />
                <span className="flex-1 text-[12px] text-white font-medium capitalize">{q.question}</span>
                <span className="text-[11px] text-white/50">{q.count}×</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-[12px] text-white/60">No questions tracked yet</p>
              <p className="text-[10px] text-white/60 mt-0.5">Data appears as customers interact with the AI</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-white/60 text-center mt-2">
        Chat analytics are sourced from Supabase. Data updates in real-time as customers interact with the AI assistant.
      </p>
    </div>
  )
}

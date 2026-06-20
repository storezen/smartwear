"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Users, ShoppingCart, CreditCard, ArrowUpRight, TrendingUp, TrendingDown, Eye, CheckCircle } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"

export default function LiveAnalyticsPage() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    // Poll every 5 seconds for live feel
    const fetchEvents = () => {
      fetch('/api/analytics')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setEvents(data)
        })
        .catch(() => {})
    }
    fetchEvents()
    const interval = setInterval(fetchEvents, 5000)
    return () => clearInterval(interval)
  }, [])

  const parsedEvents = events.map(e => {
    const parts = (e.event_name || '').split('::')
    return {
      ...e,
      base_event: parts[0] || e.event_name,
      item_name: parts[1] || 'Store Visit',
      location: parts[2] || 'PK',
      campaign: parts[3] || 'Direct / Organic'
    }
  })

  const viewCount = parsedEvents.filter(e => e.base_event === 'ViewContent' || e.base_event === 'PageView').length
  const cartCount = parsedEvents.filter(e => e.base_event === 'AddToCart').length
  const checkoutCount = parsedEvents.filter(e => e.base_event === 'InitiateCheckout').length
  const purchaseCount = parsedEvents.filter(e => e.base_event === 'Purchase' || e.base_event === 'CompletePayment').length

  const revenue = parsedEvents.filter(e => e.base_event === 'Purchase' || e.base_event === 'CompletePayment').reduce((sum, e) => sum + (e.value || 0), 0)

  // Aggregate Campaigns
  const campaignStats = parsedEvents.reduce((acc: any, e) => {
    if (!acc[e.campaign]) {
      acc[e.campaign] = { name: e.campaign, visitors: 0, roas: 'N/A', status: 'Active', rev: 0 }
    }
    if (e.base_event === 'ViewContent' || e.base_event === 'PageView') acc[e.campaign].visitors++
    if (e.base_event === 'CompletePayment' || e.base_event === 'Purchase') acc[e.campaign].rev += (e.value || 0)
    return acc
  }, {})

  const campaigns = Object.values(campaignStats).sort((a: any, b: any) => b.visitors - a.visitors)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-playfair mb-2">Live Analytics</h1>
          <p className="text-white/60 text-sm">Real-time TikTok Ad Traffic & Conversion Funnel</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Receiving Live Data (TikTok Pixel)
        </div>
      </div>

      {/* Live Traffic Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SpotlightCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3" />
              +12%
            </div>
          </div>
          <p className="text-white/50 text-sm font-medium mb-1">Live Visitors (ViewContent)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight"><AnimatedCounter value={viewCount} /></span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <ShoppingCart className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-lg">
              <TrendingUp className="w-3 h-3" />
              +5%
            </div>
          </div>
          <p className="text-white/50 text-sm font-medium mb-1">Active Carts (AddToCart)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight"><AnimatedCounter value={cartCount} /></span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <Activity className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <p className="text-white/50 text-sm font-medium mb-1">In Checkout (InitiateCheckout)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight"><AnimatedCounter value={checkoutCount} /></span>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6 border-[#B8860B]/30 shadow-[0_0_30px_rgba(184,134,11,0.05)] bg-[#B8860B]/5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8860B] to-[#D4A017] flex items-center justify-center shadow-lg">
              <CreditCard className="w-5 h-5 text-[#0C0F14]" />
            </div>
          </div>
          <p className="text-white/70 text-sm font-medium mb-1">Live Sales Today</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#D4A017] tracking-tight">₨ <AnimatedCounter value={revenue} /></span>
          </div>
        </SpotlightCard>
      </div>

      {/* Traffic Sources & Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpotlightCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Traffic Source (TikTok Campaigns)</h2>
          <div className="space-y-4">
            {campaigns.length === 0 && <div className="text-white/40 text-sm text-center py-4">Waiting for traffic...</div>}
            {campaigns.map((camp: any, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <h3 className="text-white text-sm font-medium">{camp.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/40 flex items-center gap-1"><Users className="w-3 h-3"/> {camp.visitors} Live</span>
                    {camp.rev > 0 && <span className="text-xs text-emerald-400 font-medium">Sales: ₨ {camp.rev.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              </div>
            ))}
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Recent Live Events</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
            {parsedEvents.length === 0 && <div className="text-white/40 text-sm text-center py-4">No recent events.</div>}
            {parsedEvents.slice(0, 10).map((event, i) => {
              const mins = Math.floor((new Date().getTime() - new Date(event.timestamp).getTime()) / 60000)
              const timeStr = mins < 1 ? 'Just now' : `${mins}m ago`
              
              let color = 'text-white/60'
              let bg = 'bg-white/5 border-white/10'
              let actionDisplay = event.base_event
              
              if (event.base_event === 'CompletePayment' || event.base_event === 'Purchase') { 
                color = 'text-emerald-400'; bg = 'bg-emerald-500/10 border-emerald-500/20'; actionDisplay = 'Purchase' 
              }
              else if (event.base_event === 'AddToCart') { 
                color = 'text-blue-400'; bg = 'bg-blue-500/10 border-blue-500/20'; actionDisplay = 'Added to Cart' 
              }
              else if (event.base_event === 'InitiateCheckout') { 
                color = 'text-purple-400'; bg = 'bg-purple-500/10 border-purple-500/20'; actionDisplay = 'Checkout Started' 
              }
              else if (event.base_event === 'ViewContent' || event.base_event === 'PageView') {
                actionDisplay = event.base_event === 'PageView' ? 'Site Visit' : 'Viewed Item'
              }

              return (
                <div key={event.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-[#0C0F14] text-white/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                  <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl border ${bg} backdrop-blur-sm transition-all hover:bg-white/[0.05]`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{actionDisplay}</span>
                      <span className="text-[10px] text-white/40">{timeStr}</span>
                    </div>
                    <p className="text-sm text-white font-medium truncate">{event.item_name}</p>
                    <p className="text-xs text-white/50 mt-1 flex items-center gap-1"><Users className="w-3 h-3"/> {event.location}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </SpotlightCard>
      </div>
    </div>
  )
}

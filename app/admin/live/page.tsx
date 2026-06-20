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
      campaign: parts[3] || 'Direct / Organic',
      session_id: parts[4] || e.id // fallback to event ID so older events count as 1
    }
  })

  // To count "Unique" visitors/carts etc, we group by session_id
  const getUniqueCount = (baseEvents: string[]) => {
    const matchingEvents = parsedEvents.filter(e => baseEvents.includes(e.base_event))
    const uniqueSessions = new Set(matchingEvents.map(e => e.session_id))
    return uniqueSessions.size
  }

  const viewCount = getUniqueCount(['ViewContent', 'PageView'])
  const cartCount = getUniqueCount(['AddToCart'])
  const checkoutCount = getUniqueCount(['InitiateCheckout'])
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Live View</h1>
          <p className="text-white/60 text-sm">Real-time store activity & TikTok conversions</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Receiving Live Data
        </div>
      </div>

      {/* Hero Stats */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-gradient-to-br from-[#141414] to-[#0a0a0a] border border-white/5 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[200px]">
          {/* Subtle world map background SVG pattern (abstract) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10">
            <p className="text-white/60 text-sm font-medium mb-2 uppercase tracking-wider">Right now</p>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-bold text-white tracking-tighter"><AnimatedCounter value={viewCount} /></span>
              <span className="text-xl text-white/50 font-medium">active visitors</span>
            </div>
            <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Traffic is active
            </div>
          </div>
        </div>

        <div className="md:w-72 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
          <p className="text-white/50 text-sm font-medium mb-2 uppercase tracking-wider">Total Sales Today</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-[#D4A017] tracking-tight">₨ <AnimatedCounter value={revenue} /></span>
          </div>
          <div className="h-px bg-white/5 mb-4 w-full" />
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Orders</span>
            <span className="text-white font-bold">{purchaseCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Feed & Traffic Sources */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-0 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Live Feed</h2>
              <span className="text-xs text-white/40">{parsedEvents.length} events today</span>
            </div>
            
            <div className="h-[400px] overflow-y-auto custom-scrollbar p-2">
              {parsedEvents.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <Activity className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">Waiting for live activity...</p>
                </div>
              )}
              
              <div className="space-y-1">
                {parsedEvents.slice(0, 50).map((event, i) => {
                  const mins = Math.floor((new Date().getTime() - new Date(event.timestamp).getTime()) / 60000)
                  const timeStr = mins < 1 ? 'Just now' : `${mins}m`
                  
                  let color = 'text-white/60'
                  let bg = 'bg-transparent hover:bg-white/[0.02]'
                  let dot = 'bg-white/20'
                  let actionDisplay = event.base_event
                  
                  if (event.base_event === 'CompletePayment' || event.base_event === 'Purchase') { 
                    color = 'text-emerald-400'; dot = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'; actionDisplay = 'Purchased' 
                  }
                  else if (event.base_event === 'AddToCart') { 
                    color = 'text-blue-400'; dot = 'bg-blue-400'; actionDisplay = 'Added to Cart' 
                  }
                  else if (event.base_event === 'InitiateCheckout') { 
                    color = 'text-purple-400'; dot = 'bg-purple-400'; actionDisplay = 'Started Checkout' 
                  }
                  else if (event.base_event === 'ViewContent' || event.base_event === 'PageView') {
                    actionDisplay = event.base_event === 'PageView' ? 'Visited Site' : 'Viewed Product'
                  }

                  return (
                    <div key={event.id || i} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${bg}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 text-xs text-white/30 font-mono text-right shrink-0">{timeStr}</div>
                        <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                          <span className={`text-sm font-medium ${color}`}>{actionDisplay}</span>
                          <span className="text-white/40 hidden md:block">•</span>
                          <span className="text-sm text-white/80 truncate max-w-[200px] md:max-w-[300px]">{event.item_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md shrink-0">
                        <Users className="w-3 h-3" />
                        {event.location}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Active Campaigns</h2>
            <div className="space-y-3">
              {campaigns.length === 0 && <div className="text-white/40 text-sm py-4">No active campaigns.</div>}
              {campaigns.map((camp: any, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#141414] flex items-center justify-center border border-white/5">
                      <span className="text-xs text-white/50 font-bold">{i+1}</span>
                    </div>
                    <div>
                      <h3 className="text-white text-sm font-medium">{camp.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-white/40 flex items-center gap-1"><Users className="w-3 h-3"/> {camp.visitors} Visitors</span>
                      </div>
                    </div>
                  </div>
                  {camp.rev > 0 && <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-400">₨ {camp.rev.toLocaleString()}</span>
                    <p className="text-[10px] text-white/40 uppercase">Revenue</p>
                  </div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Behavior Funnel */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">Behavior Funnel</h2>
            
            <div className="space-y-0 relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-10 bottom-10 w-px bg-white/5 z-0" />
              
              <div className="relative z-10 flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">Active Visitors</p>
                  <p className="text-2xl font-bold text-white tracking-tight"><AnimatedCounter value={viewCount} /></p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded-md">100%</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                  <ShoppingCart className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">Added to Cart</p>
                  <p className="text-2xl font-bold text-white tracking-tight"><AnimatedCounter value={cartCount} /></p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/40 font-medium">{viewCount > 0 ? Math.round((cartCount/viewCount)*100) : 0}%</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                  <Activity className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">Checking Out</p>
                  <p className="text-2xl font-bold text-white tracking-tight"><AnimatedCounter value={checkoutCount} /></p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/40 font-medium">{cartCount > 0 ? Math.round((checkoutCount/cartCount)*100) : 0}%</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white/90 text-sm font-medium">Purchased</p>
                  <p className="text-2xl font-bold text-[#D4A017] tracking-tight"><AnimatedCounter value={purchaseCount} /></p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md">{checkoutCount > 0 ? Math.round((purchaseCount/checkoutCount)*100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

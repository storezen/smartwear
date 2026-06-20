"use client"

import { useState, useEffect } from "react"
import { Eye, Map as MapIcon, Maximize2, Trash2, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"

const AnimatedCounter = dynamic(() => import('@/components/ui/animated-counter').then(m => m.AnimatedCounter), { ssr: false })
const LiveGlobe = dynamic(() => import('@/components/ui/live-globe'), { ssr: false })

// A mapping of major PK cities to lat/lng for the globe
const CITY_COORDS: Record<string, { lat: number, lng: number }> = {
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Lahore': { lat: 31.5204, lng: 74.3587 },
  'Islamabad': { lat: 33.6844, lng: 73.0479 },
  'Rawalpindi': { lat: 33.5909, lng: 73.0537 },
  'Faisalabad': { lat: 31.4504, lng: 73.1350 },
  'Multan': { lat: 30.1575, lng: 71.5249 },
  'Peshawar': { lat: 34.0151, lng: 71.5249 },
  'Quetta': { lat: 30.1798, lng: 66.9750 },
  'PK': { lat: 30.3753, lng: 69.3451 }, // Default PK center
}

export default function LiveAnalyticsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    // Poll every 5 seconds for live feel
    const fetchEvents = () => {
      fetch(`/api/analytics?t=${Date.now()}`, { cache: 'no-store' })
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

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all live analytics data?')) return
    setIsClearing(true)
    try {
      await fetch('/api/analytics/clear', { method: 'POST' })
      setEvents([]) // clear locally immediately
    } catch (e) {
      console.error(e)
    } finally {
      setIsClearing(false)
    }
  }

  const parsedEvents = events.map(e => {
    const parts = (e.event_name || '').split('::')
    return {
      ...e,
      base_event: parts[0] || e.event_name,
      item_name: parts[1] || 'Store Visit',
      location: parts[2] || 'PK',
      campaign: parts[3] || 'Direct / Organic',
      session_id: parts[4] || e.id
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

  // Get active locations for the globe
  const activeLocationsMap = new Map<string, number>()
  parsedEvents.forEach(e => {
    if (e.location) {
      activeLocationsMap.set(e.location, (activeLocationsMap.get(e.location) || 0) + 1)
    }
  })
  
  const globeLocations = Array.from(activeLocationsMap.entries()).map(([loc, count]) => {
    const coords = CITY_COORDS[loc] || CITY_COORDS['PK']
    return { lat: coords.lat, lng: coords.lng, size: Math.min(0.1 + (count * 0.05), 0.5) }
  })

  return (
    <div className="bg-[#0C0F14] min-h-[calc(100vh-4rem)] -m-4 p-4 md:-m-6 md:p-6 lg:-m-8 lg:p-8 rounded-tl-xl text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0F1923] shadow-sm border border-white/10 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 text-[#B8860B]" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/><path d="M10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6z"/></svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Live Analytics</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-white/60 ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8860B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B8860B]"></span>
            </span>
            Live now
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleClear}
            disabled={isClearing}
            title="Clear Live Data"
            className="p-2 bg-red-500/10 border border-red-500/20 rounded-md shadow-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {isClearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <button className="p-2 bg-[#0F1923] border border-white/5 rounded-md shadow-sm text-white/60 hover:text-white transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#0F1923] border border-white/5 rounded-md shadow-sm text-white/60 hover:text-white transition-colors">
            <MapIcon className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#0F1923] border border-white/5 rounded-md shadow-sm text-white/60 hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        
        {/* Left Sidebar Cards */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-4 shrink-0 pr-2">
          
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F1923] p-5 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-[13px] font-semibold text-white/70 mb-3 relative z-10">Visitors right now</h3>
              <p className="text-3xl font-bold tracking-tight text-[#B8860B] relative z-10"><AnimatedCounter value={viewCount} /></p>
            </div>
            <div className="bg-[#0F1923] p-5 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden">
              <h3 className="text-[13px] font-semibold text-white/70 mb-3 relative z-10">Total sales</h3>
              <p className="text-xl font-bold tracking-tight text-white relative z-10">PKR <AnimatedCounter value={revenue} /></p>
              <div className="mt-4 h-0.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-[#B8860B] w-1/3 rounded-full" />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F1923] p-5 rounded-xl border border-white/5 shadow-2xl">
              <h3 className="text-[13px] font-semibold text-white/70 mb-3">Sessions</h3>
              <p className="text-xl font-bold tracking-tight text-white"><AnimatedCounter value={viewCount} /></p>
              <div className="mt-4 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#B8860B] w-1/4 rounded-full opacity-70" />
              </div>
            </div>
            <div className="bg-[#0F1923] p-5 rounded-xl border border-white/5 shadow-2xl">
              <h3 className="text-[13px] font-semibold text-white/70 mb-3">Orders</h3>
              <p className="text-xl font-bold tracking-tight text-white"><AnimatedCounter value={purchaseCount} /></p>
              <div className="mt-4 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#B8860B] w-1/2 rounded-full opacity-70" />
              </div>
            </div>
          </div>

          {/* Row 3 Funnel */}
          <div className="bg-[#0F1923] p-5 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden">
            <h3 className="text-[13px] font-semibold text-white/70 mb-4 relative z-10">Customer behavior</h3>
            <div className="grid grid-cols-3 gap-4 relative z-10">
              <div>
                <p className="text-[11px] text-white/50 mb-1">Active carts</p>
                <p className="text-lg font-medium text-white"><AnimatedCounter value={cartCount} /></p>
              </div>
              <div className="border-l border-white/5 pl-4">
                <p className="text-[11px] text-white/50 mb-1">Checking out</p>
                <p className="text-lg font-medium text-white"><AnimatedCounter value={checkoutCount} /></p>
              </div>
              <div className="border-l border-white/5 pl-4">
                <p className="text-[11px] text-white/50 mb-1">Purchased</p>
                <p className="text-lg font-medium text-[#B8860B]"><AnimatedCounter value={purchaseCount} /></p>
              </div>
            </div>
          </div>

          {/* Row 4 Traffic Source / Locations */}
          <div className="bg-[#0F1923] rounded-xl border border-white/5 shadow-2xl flex flex-col h-48">
            <div className="p-4 border-b border-white/5 border-dashed">
              <h3 className="text-[13px] font-semibold text-white/70">Sessions by location</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {Array.from(activeLocationsMap.entries()).length === 0 ? (
                <div className="h-full flex items-center justify-center text-[13px] text-white/30">
                  No data for this date range
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(activeLocationsMap.entries()).sort((a,b) => b[1]-a[1]).map(([loc, count], i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <span className="text-[13px] text-white/80 group-hover:text-[#B8860B] transition-colors">{loc}</span>
                      <span className="text-[13px] font-medium text-white/90">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 5 Feed */}
          <div className="bg-[#0F1923] rounded-xl border border-white/5 shadow-2xl flex flex-col h-48">
            <div className="p-4 border-b border-white/5 border-dashed flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-white/70">Live Events Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {parsedEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[13px] text-white/30">
                  No data for this date range
                </div>
              ) : (
                <div className="space-y-3">
                  {parsedEvents.slice(0, 10).map((event, i) => (
                    <div key={event.id || i} className="flex items-center gap-3 group">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${(event.base_event === 'Purchase' || event.base_event === 'CompletePayment') ? 'bg-[#B8860B] text-[#B8860B]' : 'bg-white/40 text-white/40 group-hover:bg-white group-hover:text-white transition-colors'}`} />
                      <div className="flex-1">
                        <p className="text-[13px] text-white/90 truncate max-w-[250px] font-medium">{event.item_name}</p>
                        <p className="text-[11px] text-white/40">
                          {(event.base_event === 'Purchase' || event.base_event === 'CompletePayment') ? 'Purchased' : 'Viewed'} • {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Globe Area */}
        <div className="flex-1 relative bg-[#0F1923] overflow-hidden rounded-xl border border-white/5 shadow-2xl">
          <LiveGlobe locations={globeLocations} />
          
          {/* Bottom Right Legend */}
          <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-[#0C0F14]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8860B] shadow-[0_0_8px_rgba(184,134,11,0.8)]"></span>
              <span className="text-xs font-medium text-white/70">Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
              <span className="text-xs font-medium text-white/70">Visitors right now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

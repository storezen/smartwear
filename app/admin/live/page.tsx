"use client"

import { useState, useEffect } from "react"
import { Eye, Map, Maximize2 } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import dynamic from "next/dynamic"

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
    <div className="bg-[#f6f6f7] min-h-[calc(100vh-4rem)] -m-4 p-4 md:-m-6 md:p-6 lg:-m-8 lg:p-8 rounded-tl-xl text-[#202223] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white shadow-sm border border-[#e1e3e5] rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 text-[#5c5f62]" fill="currentColor"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/><path d="M10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.5a3 3 0 110-6 3 3 0 010 6z"/></svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Live View</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-[#5c5f62] ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Just now
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-white border border-[#e1e3e5] rounded-md px-3 py-1.5 shadow-sm">
            <svg className="w-4 h-4 text-[#8c9196] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" placeholder="Search location" className="text-sm border-none focus:outline-none w-48 text-[#202223] placeholder:text-[#8c9196] bg-transparent" />
          </div>
          <button className="p-2 bg-white border border-[#e1e3e5] rounded-md shadow-sm text-[#5c5f62] hover:bg-gray-50">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white border border-[#e1e3e5] rounded-md shadow-sm text-[#5c5f62] hover:bg-gray-50">
            <Map className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white border border-[#e1e3e5] rounded-md shadow-sm text-[#5c5f62] hover:bg-gray-50">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        
        {/* Left Sidebar Cards */}
        <div className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-4 shrink-0 pr-2">
          
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#e1e3e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="text-[13px] font-semibold text-[#202223] mb-3">Visitors right now</h3>
              <p className="text-3xl font-bold tracking-tight"><AnimatedCounter value={viewCount} /></p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#e1e3e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="text-[13px] font-semibold text-[#202223] mb-3">Total sales</h3>
              <p className="text-xl font-bold tracking-tight">PKR <AnimatedCounter value={revenue} /></p>
              <div className="mt-4 h-0.5 w-full bg-[#f1f2f3] rounded-full overflow-hidden">
                <div className="h-full bg-[#90cdff] w-1/3 rounded-full" />
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#e1e3e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="text-[13px] font-semibold text-[#202223] mb-3">Sessions</h3>
              <p className="text-xl font-bold tracking-tight"><AnimatedCounter value={viewCount} /></p>
              <div className="mt-4 h-0.5 w-full bg-[#f1f2f3] rounded-full overflow-hidden">
                <div className="h-full bg-[#90cdff] w-1/4 rounded-full" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#e1e3e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <h3 className="text-[13px] font-semibold text-[#202223] mb-3">Orders</h3>
              <p className="text-xl font-bold tracking-tight"><AnimatedCounter value={purchaseCount} /></p>
              <div className="mt-4 h-0.5 w-full bg-[#f1f2f3] rounded-full overflow-hidden">
                <div className="h-full bg-[#90cdff] w-1/2 rounded-full" />
              </div>
            </div>
          </div>

          {/* Row 3 Funnel */}
          <div className="bg-white p-5 rounded-xl border border-[#e1e3e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <h3 className="text-[13px] font-semibold text-[#202223] mb-4">Customer behavior</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] text-[#6d7175] mb-1">Active carts</p>
                <p className="text-lg font-medium"><AnimatedCounter value={cartCount} /></p>
              </div>
              <div className="border-l border-[#f1f2f3] pl-4">
                <p className="text-[11px] text-[#6d7175] mb-1">Checking out</p>
                <p className="text-lg font-medium"><AnimatedCounter value={checkoutCount} /></p>
              </div>
              <div className="border-l border-[#f1f2f3] pl-4">
                <p className="text-[11px] text-[#6d7175] mb-1">Purchased</p>
                <p className="text-lg font-medium"><AnimatedCounter value={purchaseCount} /></p>
              </div>
            </div>
          </div>

          {/* Row 4 Traffic Source / Locations */}
          <div className="bg-white rounded-xl border border-[#e1e3e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col h-48">
            <div className="p-4 border-b border-[#f1f2f3] border-dashed">
              <h3 className="text-[13px] font-semibold text-[#202223]">Sessions by location</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {Array.from(activeLocationsMap.entries()).length === 0 ? (
                <div className="h-full flex items-center justify-center text-[13px] text-[#8c9196]">
                  No data for this date range
                </div>
              ) : (
                <div className="space-y-3">
                  {Array.from(activeLocationsMap.entries()).sort((a,b) => b[1]-a[1]).map(([loc, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[13px] text-[#202223]">{loc}</span>
                      <span className="text-[13px] font-medium text-[#202223]">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 5 Feed */}
          <div className="bg-white rounded-xl border border-[#e1e3e5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex flex-col h-48">
            <div className="p-4 border-b border-[#f1f2f3] border-dashed">
              <h3 className="text-[13px] font-semibold text-[#202223]">Live Events Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {parsedEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[13px] text-[#8c9196]">
                  No data for this date range
                </div>
              ) : (
                <div className="space-y-3">
                  {parsedEvents.slice(0, 10).map((event, i) => (
                    <div key={event.id || i} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${event.base_event === 'Purchase' ? 'bg-[#9a86ff]' : 'bg-[#5cd4f8]'}`} />
                      <div className="flex-1">
                        <p className="text-[13px] text-[#202223] truncate max-w-[250px]">{event.item_name}</p>
                        <p className="text-[11px] text-[#6d7175]">
                          {event.base_event === 'Purchase' ? 'Purchased' : 'Viewed'} • {event.location}
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
        <div className="flex-1 relative bg-transparent overflow-hidden rounded-xl">
          <LiveGlobe locations={globeLocations} />
          
          {/* Bottom Right Legend */}
          <div className="absolute bottom-6 right-6 flex items-center gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#e1e3e5] shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9a86ff] shadow-[0_0_8px_rgba(154,134,255,0.8)]"></span>
              <span className="text-xs font-medium text-[#5c5f62]">Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5cd4f8] shadow-[0_0_8px_rgba(92,212,248,0.8)]"></span>
              <span className="text-xs font-medium text-[#5c5f62]">Visitors right now</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

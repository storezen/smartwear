"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, ShoppingCart, DollarSign, Activity, Globe, MapPin, TrendingUp, Zap, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

function LiveMetric({ title, value, icon: Icon, trend, color, glow }: any) {
  return (
    <div className="relative group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl overflow-hidden transition-colors hover:bg-white/10">
      {/* Background Glow */}
      <div className={cn("absolute -inset-4 opacity-0 blur-[40px] transition-opacity duration-1000 group-hover:opacity-40", glow)} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl sm:text-5xl font-light text-white tracking-tight">{value}</h3>
            {trend && (
              <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                <TrendingUp className="mr-1 size-3" /> {trend}
              </span>
            )}
          </div>
        </div>
        <div className={cn("flex size-12 items-center justify-center rounded-2xl bg-white/10 shadow-inner", color)}>
          <Icon className="size-6" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}

function LiveDot({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: Math.random() * 5 + 1 }}
      className="absolute size-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
      style={{
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
      }}
    />
  )
}

export default function LiveAnalyticsPage() {
  const [visitors, setVisitors] = useState(42)
  const [carts, setCarts] = useState(12)
  const [sales, setSales] = useState(148500)
  const [orders, setOrders] = useState(18)
  const [recentEvents, setRecentEvents] = useState<{ id: number, type: string, text: string, time: Date }[]>([])

  // Simulate Live Traffic
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors(prev => Math.max(10, prev + Math.floor(Math.random() * 5) - 2))
      
      if (Math.random() > 0.7) {
        setCarts(prev => prev + 1)
        const newEvent = { id: Date.now(), type: "cart", text: "Added to Cart: Premium Smart Watch", time: new Date() }
        setRecentEvents(prev => [newEvent, ...prev].slice(0, 5))
      }

      if (Math.random() > 0.9) {
        const orderValue = 8500 + Math.floor(Math.random() * 10000)
        setSales(prev => prev + orderValue)
        setOrders(prev => prev + 1)
        setCarts(prev => Math.max(0, prev - 1))
        const newEvent = { id: Date.now(), type: "sale", text: `New Order: Rs. ${orderValue.toLocaleString()}`, time: new Date() }
        setRecentEvents(prev => [newEvent, ...prev].slice(0, 5))
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] -mx-4 -my-6 sm:-mx-6 lg:-mx-8 bg-[#050505] overflow-hidden text-neutral-200 p-4 sm:p-6 lg:p-8">
      {/* Ambient background blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-heading text-3xl font-light text-white flex items-center gap-3">
              Live View <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>
            </h1>
            <p className="text-sm font-medium text-neutral-500 mt-1">Real-time analytics and global store traffic.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <Activity className="size-4 text-emerald-400" />
            <span className="text-sm font-bold text-white tracking-widest uppercase">System Online</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LiveMetric 
            title="Active Visitors" 
            value={visitors} 
            icon={Users} 
            trend="+12%" 
            color="text-emerald-400" 
            glow="bg-emerald-500" 
          />
          <LiveMetric 
            title="Active Carts" 
            value={carts} 
            icon={ShoppingCart} 
            color="text-blue-400" 
            glow="bg-blue-500" 
          />
          <LiveMetric 
            title="Today's Sales" 
            value={`Rs. ${sales.toLocaleString()}`} 
            icon={DollarSign} 
            trend="+4.5%"
            color="text-amber-400" 
            glow="bg-amber-500" 
          />
          <LiveMetric 
            title="Total Orders" 
            value={orders} 
            icon={ShoppingBag} 
            color="text-fuchsia-400" 
            glow="bg-fuchsia-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Simulated Map / Globe Area */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl relative min-h-[400px] overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-contain opacity-10 blur-[1px] pointer-events-none" />
            
            <div className="absolute inset-0">
              {/* Simulate active traffic dots over the map */}
              {[...Array(15)].map((_, i) => (
                <LiveDot key={i} delay={i * 0.4} />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <Globe className="size-16 text-white/20 mb-4" />
              <h3 className="text-xl font-light text-white">Global Traffic Active</h3>
              <p className="text-sm font-medium text-neutral-500 mt-2 max-w-sm">
                Visitors are currently browsing from 4 different regions. Major activity detected in Lahore and Karachi.
              </p>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="size-5 text-amber-400 fill-amber-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Live Feed</h3>
            </div>

            <div className="flex-1 space-y-4">
              <AnimatePresence initial={false}>
                {recentEvents.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 font-medium">Listening for events...</div>
                ) : (
                  recentEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-sm"
                    >
                      <div className={cn("p-2 rounded-xl mt-0.5", event.type === "sale" ? "bg-emerald-400/20 text-emerald-400" : "bg-blue-400/20 text-blue-400")}>
                        {event.type === "sale" ? <DollarSign className="size-4" strokeWidth={2} /> : <ShoppingCart className="size-4" strokeWidth={2} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{event.text}</p>
                        <p className="text-xs font-medium text-neutral-500 mt-0.5">{event.time.toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

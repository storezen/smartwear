"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Sparkles, MessageCircle, Truck, Video, ArrowRight, CheckCircle2, ChevronRight, Zap } from "lucide-react"
import { useWhatsAppBotStore } from "@/store/useWhatsAppBotStore"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function IntegrationsPage() {
  const { botStatus, fetchBotStatus } = useWhatsAppBotStore()
  const [tiktokEnabled, setTiktokEnabled] = useState(false)
  const [postexKey, setPostexKey] = useState(false)

  useEffect(() => {
    fetchBotStatus()
    fetch("/api/settings/TIKTOK_PIXEL_ENABLED").then(r => r.json()).then(d => setTiktokEnabled(d.value === "true"))
    if (typeof window !== "undefined") {
      setPostexKey(!!localStorage.getItem("smartwear-postex-api-key"))
    }
  }, [fetchBotStatus])

  const apps = [
    {
      id: "whatsapp",
      name: "WhatsApp Command Center",
      description: "Automated order confirmations, live delivery updates, and keyword responders.",
      icon: MessageCircle,
      href: "/dashboard/whatsapp",
      status: botStatus === "CONNECTED" ? "active" : "inactive",
      statusLabel: botStatus === "CONNECTED" ? "Connected" : "Requires Setup",
      color: "bg-emerald-500",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      id: "tiktok",
      name: "TikTok Pixel God Mode",
      description: "One-click pixel integration. Auto-tracks page views, add to carts, and purchases.",
      icon: Video,
      href: "/dashboard/tiktok",
      status: tiktokEnabled ? "active" : "inactive",
      statusLabel: tiktokEnabled ? "Tracking Live" : "Inactive",
      color: "bg-fuchsia-500",
      iconColor: "text-fuchsia-500",
      iconBg: "bg-fuchsia-50",
    },
    {
      id: "postex",
      name: "PostEx Logistics Hub",
      description: "Instant shipment tracking, rates, and automatic sync for Shopify orders.",
      icon: Truck,
      href: "/dashboard/postex",
      status: postexKey ? "active" : "inactive",
      statusLabel: postexKey ? "API Connected" : "Requires API Key",
      color: "bg-blue-500",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    }
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-neutral-200/60 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900 flex items-center gap-2">
            Integrations Hub <Zap className="size-5 text-amber-500 fill-amber-500" />
          </h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">
            Zero-effort setup. Connect apps to unlock advanced marketing and logistics.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={app.href} className="block group h-full">
              <div className="h-full bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-neutral-300/80 flex flex-col">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("flex size-14 items-center justify-center rounded-[20px] shadow-sm", app.iconBg, app.iconColor)}>
                      <app.icon className="size-7" strokeWidth={1.5} />
                    </div>
                    {app.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="size-3" /> {app.statusLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {app.statusLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">{app.name}</h3>
                  <p className="text-sm font-medium text-neutral-500 leading-relaxed">
                    {app.description}
                  </p>
                </div>
                
                <div className="p-6 pt-0 border-t border-transparent group-hover:border-neutral-100 transition-colors mt-auto">
                  <div className="flex items-center justify-between text-sm font-bold text-neutral-900 mt-4 group-hover:translate-x-1 transition-transform">
                    {app.status === "active" ? "Manage Integration" : "Setup Now"} 
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* Featured Shopify-like ecosystem banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="mt-8 relative rounded-[32px] overflow-hidden bg-[#0A0A0A] p-10 flex flex-col sm:flex-row items-center justify-between shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-lg">
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="size-5 text-amber-400" /> Need a custom integration?
          </h3>
          <p className="text-neutral-400 font-medium text-sm leading-relaxed">
            SmartWear's headless architecture supports any third-party app. Connect your CRM, email provider, or custom ERP easily.
          </p>
        </div>
        <div className="relative z-10 mt-6 sm:mt-0 shrink-0">
          <button className="h-12 px-8 bg-white text-black font-bold text-sm rounded-full transition-transform hover:scale-105 shadow-xl">
            View API Docs
          </button>
        </div>
      </motion.div>

    </motion.div>
  )
}

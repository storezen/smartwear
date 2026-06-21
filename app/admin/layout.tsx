"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Settings,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronRight,
  Activity,
  Megaphone
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useOrderNotifications } from "@/lib/use-order-notifications"
import { formatPrice } from "@/lib/mock-data"

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/live", label: "Live (TikTok)", icon: Activity },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function AdminLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#B8860B] to-[#D4A017] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(184,134,11,0.25)]">
        <svg viewBox="0 0 36 36" fill="none" width={20} height={20} className="shrink-0">
          <circle cx="18" cy="18" r="14.5" fill="#0C0F14" stroke="#0C0F14" strokeWidth="1.5"/>
          <line x1="18" y1="18" x2="18" y2="11" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="18" y1="18" x2="23" y2="18" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="18" cy="18" r="1.5" fill="#B8860B"/>
        </svg>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="leading-none overflow-hidden whitespace-nowrap"
          >
            <span
              className="block text-white text-[14px] font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}
            >
              Smartwear
            </span>
            <span className="block text-[8px] tracking-[0.2em] text-[#B8860B] font-bold mt-0.5 uppercase">
              Command Center
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean)
  return (
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60">
      {segments.map((segment, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="w-3 h-3 text-[#B8860B]" />}
          <span className={cn(i === segments.length - 1 ? "text-white font-semibold" : "")}>
            {segment}
          </span>
        </span>
      ))}
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [now, setNow] = useState<Date | null>(null)
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAllRead } = useOrderNotifications()

  useEffect(() => {
    if (!showNotifs) return
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showNotifs])

  // Clock
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  if (pathname === "/admin/login") return <>{children}</>

  const timeStr = now?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) || "--:--"
  const dateStr = now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) || "---"

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white flex overflow-hidden">
      
      {/* ── DESKTOP SIDEBAR ── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        className="hidden lg:flex flex-col bg-[#0F1923] border-r border-white/5 relative z-20 shrink-0"
      >
        <div className="h-[56px] flex items-center px-4 border-b border-white/5">
          <AdminLogo collapsed={sidebarCollapsed} />
        </div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-[60px] w-5 h-5 rounded-full bg-[#1A2530] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors z-30 sw-interactive"
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
            <ChevronLeft className="w-2.5 h-2.5" />
          </motion.div>
        </button>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center group outline-none sw-interactive"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNavGlow"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#B8860B] rounded-r-full shadow-[0_0_10px_#B8860B]"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className={cn(
                  "relative z-10 flex items-center h-9 px-3 rounded-lg transition-colors text-[13px]",
                  sidebarCollapsed ? "justify-center w-full" : "w-full",
                  isActive ? "text-[#B8860B]" : "text-white/60 group-hover:text-white"
                )}>
                  <item.icon className={cn("w-4 h-4 shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110", sidebarCollapsed ? "" : "mr-2.5")} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center h-9 px-3 rounded-lg text-red-400/80 hover:bg-red-400/10 transition-colors sw-interactive group text-[13px]",
              sidebarCollapsed ? "justify-center" : ""
            )}
            title="Log Out"
          >
            <LogOut className={cn("w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-1", sidebarCollapsed ? "" : "mr-2.5")} />
            {!sidebarCollapsed && <span className="font-medium">Log Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── MOBILE SIDEBAR (Overlay) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute left-0 top-0 bottom-0 w-[240px] bg-[#0F1923] border-r border-white/5 flex flex-col"
            >
              <div className="h-[56px] flex items-center justify-between px-4 border-b border-white/5">
                <AdminLogo />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white sw-interactive"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {adminNav.map((item) => {
                  const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center h-9 px-3 rounded-lg font-medium transition-all sw-interactive text-[13px]",
                        isActive ? "bg-white/5 border border-white/10 text-[#B8860B] shadow-[inset_3px_0_0_#B8860B]" : "text-white/60 hover:text-white hover:bg-white/[0.02]"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-2.5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-3 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center h-9 px-3 rounded-lg text-red-400/80 hover:bg-red-400/10 transition-colors font-medium sw-interactive text-[13px]"
                >
                  <LogOut className="w-4 h-4 mr-2.5" />
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Background ambient glow for main content area */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-[0.05] bg-[#B8860B] pointer-events-none" />

        {/* Top Header */}
        <header className="h-[56px] shrink-0 border-b border-white/5 bg-[#0C0F14]/80 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-1.5 text-white/60 hover:text-white sw-interactive"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumb pathname={pathname} />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-white font-medium text-xs">{timeStr}</span>
              <span className="text-white/60 text-[9px] uppercase tracking-wider">{dateStr}</span>
            </div>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors sw-interactive"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B8860B] text-[9px] font-bold text-black flex items-center justify-center shadow-[0_0_6px_#B8860B]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-80 z-50"
                  >
                  <div className="bg-[#0F1923] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <span className="text-[11px] font-semibold text-white/70">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[9px] text-[#B8860B]/70 hover:text-[#B8860B] transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-5 h-5 mx-auto mb-2 text-white/15" />
                          <p className="text-[11px] text-white/30">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href="/admin/orders"
                            onClick={() => setShowNotifs(false)}
                            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] border-b border-white/[0.02] last:border-0 ${
                              !n.read ? "bg-[#B8860B]/[0.03]" : ""
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#B8860B]/10 flex items-center justify-center shrink-0 mt-0.5">
                              <ShoppingCart className="w-3.5 h-3.5 text-[#B8860B]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-medium text-white truncate">
                                  {n.customer_name}
                                </span>
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-white/50 mt-0.5">
                                Order {formatPrice(n.total)}
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0F1923] to-[#1A2530] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              <span className="text-[#B8860B] font-bold text-xs">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-5 scroll-smooth relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

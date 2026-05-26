"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layout,
  Palette,
  Users,
  Boxes,
  CreditCard,
  Tag,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Image,
  Video,
  MessageCircle,
  Truck,
  Activity,
  Upload,
  Database,
  ChevronDown,
  Gift,
  Sparkles,
  Megaphone,
  Bot,
} from "lucide-react"
import { useState } from "react"

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
      { href: "/dashboard/products", label: "Products", icon: Package, subItems: [
        { href: "/dashboard/products/import", label: "Import" },
      ]},
      { href: "/dashboard/categories", label: "Categories", icon: Tag },
      { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
      { href: "/dashboard/coupons", label: "Coupons", icon: Gift },
    ],
  },
  {
    label: "Sales & Insights",
    items: [
      { href: "/dashboard/analytics/live", label: "Live View", icon: Activity },
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
      { href: "/dashboard/customers", label: "Customers", icon: Users },
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
      { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
    ],
  },
  {
    label: "Appearance",
    items: [
      { href: "/dashboard/theme", label: "Themes", icon: Palette },
      { href: "/dashboard/sections", label: "Page Builder", icon: Layout },
      { href: "/dashboard/media", label: "Media", icon: Image },
    ],
  },
  {
    label: "AI Features ✨",
    items: [
      { href: "/dashboard/marketing", label: "Marketing Generator", icon: Megaphone },
    ],
  },
  {
    label: "Integrations",
    items: [
      { href: "/dashboard/integrations", label: "App Hub", icon: Sparkles },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/backup", label: "Backup", icon: Database },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href
    return pathname === href || pathname?.startsWith(href + "/")
  }

  const isChildActive = (items: { href: string }[]) => {
    return items.some((item) => pathname === item.href || pathname?.startsWith(item.href + "/"))
  }

  async function handleLogout() {
    localStorage.removeItem("smartwear-cod-orders")
    localStorage.removeItem("smartwear-cart")
    localStorage.removeItem("smartwear-site-data")
    localStorage.removeItem("smartwear-sections")
    sessionStorage.removeItem("smartwear-auth")
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#E5E5E5] bg-[#FAFAFA]">
      <div className="flex h-16 items-center gap-3 border-b border-[#E5E5E5] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0A0A0A] text-sm font-bold text-white shadow-sm">
          S
        </div>
        <div>
          <span className="font-heading text-sm font-bold tracking-widest text-[#0A0A0A] uppercase">SmartWear</span>
          <span className="ml-2 rounded-sm bg-[#E5E5E5] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A]/70">Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5 hide-scrollbar">
        {navGroups.map((group) => {
          const groupActive = group.items.some((item) => {
            if ("subItems" in item && item.subItems) {
              return isActive(item.href) || isChildActive(item.subItems)
            }
            return isActive(item.href)
          })

          return (
            <div key={group.label}>
              <div className={cn(
                "px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#0A0A0A]/40",
                groupActive ? "text-[#0A0A0A]/80" : ""
              )}>
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  const hasSubItems = "subItems" in item && item.subItems
                  const subActive = hasSubItems ? isChildActive(item.subItems!) : false
                  const isExpanded = expanded[item.label] || subActive

                  return (
                    <div key={item.label}>
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          if (hasSubItems) {
                            e.preventDefault()
                            toggleExpand(item.label)
                          }
                        }}
                        className="group block"
                      >
                        <div className={cn(
                          "relative flex items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-semibold transition-colors",
                          active && "bg-[#0A0A0A] text-white shadow-md",
                          !active && "text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#E5E5E5]/50"
                        )}>
                          <span className="shrink-0">
                            <Icon className={cn("h-4 w-4", active ? "text-white" : "text-[#0A0A0A]/40")} strokeWidth={active ? 2 : 1.5} />
                          </span>
                          <span className="flex-1">{item.label}</span>
                          {hasSubItems && (
                            <ChevronDown className={cn(
                              "h-3.5 w-3.5 transition-transform text-[#0A0A0A]/40",
                              isExpanded && "rotate-180"
                            )} />
                          )}
                        </div>
                      </Link>

                      {hasSubItems && isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems!.map((sub) => {
                            const subActive = pathname === sub.href
                            return (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className="group block"
                              >
                                <div className={cn(
                                  "flex items-center gap-3 rounded-[8px] px-3 py-1.5 text-sm transition-colors font-medium",
                                  subActive
                                    ? "text-[#0A0A0A] font-bold"
                                    : "text-[#0A0A0A]/50 hover:text-[#0A0A0A]"
                                )}>
                                  <span className="size-1 rounded-full bg-current" />
                                  {sub.label}
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-[#E5E5E5] p-3 space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-[#0A0A0A]/50 transition-colors hover:bg-[#E5E5E5]/50 hover:text-[#0A0A0A]">
            <ExternalLink className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
            View Store
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-[#EF4444]/80 transition-colors hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  )
}

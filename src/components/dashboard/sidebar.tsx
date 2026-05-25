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
  Upload,
  Database,
  ChevronDown,
  Gift,
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
    label: "Integrations",
    items: [
      { href: "/dashboard/postex", label: "PostEx", icon: Truck },
      { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageCircle },
      { href: "/dashboard/tiktok", label: "TikTok", icon: Video },
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
    <aside className="flex h-full w-64 flex-col border-r border-neutral-200/60 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-neutral-200/60 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-neutral-950 text-sm font-bold text-white shadow-sm">
          S
        </div>
        <div>
          <span className="font-heading text-sm font-semibold tracking-tight text-neutral-900">SmartWear</span>
          <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
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
                "px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400",
                groupActive ? "text-neutral-900" : ""
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
                          active && "bg-neutral-50 text-neutral-900 shadow-sm border border-neutral-200/60",
                          !active && "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/50"
                        )}>
                          <span className="shrink-0">
                            <Icon className={cn("h-4.5 w-4.5", active ? "text-blue-600" : "text-neutral-400")} strokeWidth={active ? 2 : 1.5} />
                          </span>
                          <span className="flex-1">{item.label}</span>
                          {hasSubItems && (
                            <ChevronDown className={cn(
                              "h-3.5 w-3.5 transition-transform text-neutral-400",
                              isExpanded && "rotate-180"
                            )} />
                          )}
                        </div>
                      </Link>

                      {hasSubItems && isExpanded && (
                        <div className="ml-6 mt-0.5 space-y-0.5">
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
                                    ? "text-blue-600 bg-blue-50/50"
                                    : "text-neutral-500 hover:text-neutral-900"
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

      <div className="border-t border-neutral-200/60 p-3 space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900">
            <ExternalLink className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
            View Store
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  )
}

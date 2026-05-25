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
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary text-sm font-bold text-primary-foreground shadow-sm">
          S
        </div>
        <div>
          <span className="font-heading text-sm font-semibold tracking-tight text-sidebar-foreground">SmartWear</span>
          <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin</span>
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
                "px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
                groupActive ? "text-sidebar-foreground" : ""
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
                          active && "bg-sidebar-accent text-sidebar-foreground shadow-sm border border-sidebar-border",
                          !active && "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}>
                          <span className="shrink-0">
                            <Icon className={cn("h-4.5 w-4.5", active ? "text-sidebar-primary" : "text-muted-foreground")} strokeWidth={active ? 2 : 1.5} />
                          </span>
                          <span className="flex-1">{item.label}</span>
                          {hasSubItems && (
                            <ChevronDown className={cn(
                              "h-3.5 w-3.5 transition-transform text-muted-foreground",
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
                                    ? "text-sidebar-primary bg-sidebar-accent"
                                    : "text-muted-foreground hover:text-sidebar-foreground"
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

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <ExternalLink className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
            View Store
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  )
}

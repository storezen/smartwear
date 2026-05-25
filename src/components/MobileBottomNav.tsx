"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid, MessageCircle, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const count = getItemCount()

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: Grid },
    { label: "Support", href: "https://wa.me/923001234567", icon: MessageCircle, external: true },
    { label: "Cart", href: "/cart", icon: ShoppingBag, badge: count },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-xl border-t border-[#E5E5E5] pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          
          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center w-16 h-full gap-1 text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors"
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </a>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                active ? "text-[#0A0A0A]" : "text-[#0A0A0A]/50 hover:text-[#0A0A0A]"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.5} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#0A0A0A] text-[9px] font-bold text-[#FAFAFA]">
                  {item.badge}
                </span>
              )}
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

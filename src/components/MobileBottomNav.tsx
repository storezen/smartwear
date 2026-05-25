"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, ShoppingBag, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { motion, AnimatePresence } from "framer-motion"

const links = [
  { href: "/",         label: "Home",   icon: Home },
  { href: "/products", label: "Shop",   icon: Tag },
  { href: "/search",   label: "Search", icon: Search },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const count = getItemCount()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur-xl pb-safe lg:hidden shadow-[0_-1px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-[56px] px-2">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] py-1.5 transition-colors relative"
              aria-label={link.label}
            >
              <div className={cn(
                "relative flex items-center justify-center rounded-xl transition-all duration-250 p-1.5",
                active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              )}>
                {active && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-xl bg-neutral-900/10 border border-neutral-900/15"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="size-5 relative z-10" strokeWidth={active ? 2 : 1.5} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold leading-none transition-colors",
                active ? "text-neutral-900" : "text-neutral-400"
              )}>
                {link.label}
              </span>
            </Link>
          )
        })}

        {/* Cart Tab */}
        <Link
          href="/cart"
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[48px] py-1.5 transition-colors relative"
          aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
        >
          <div className={cn(
            "relative flex items-center justify-center rounded-xl transition-all duration-250 p-1.5",
            pathname.startsWith("/cart") ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
          )}>
            {pathname.startsWith("/cart") && (
              <motion.div
                layoutId="mobile-nav-pill"
                className="absolute inset-0 rounded-xl bg-neutral-900/10 border border-neutral-900/15"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <ShoppingBag className={cn("size-5 relative z-10", pathname.startsWith("/cart") ? "stroke-[2]" : "stroke-[1.5]")} />
            <AnimatePresence mode="wait">
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(37,99,235,0.5)] z-20"
                >
                  {count > 9 ? "9+" : count}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className={cn(
            "text-[10px] font-semibold leading-none transition-colors",
            pathname.startsWith("/cart") ? "text-neutral-900" : "text-neutral-400"
          )}>
            Cart
          </span>
        </Link>
      </div>
    </nav>
  )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { User, ShoppingBag, Package, Heart, Settings, ChevronRight, ShieldCheck, Banknote, RotateCcw, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageMeta } from "@/components/PageMeta"
import { PageTransition } from "@/components/PageTransition"

const links = [
  { icon: ShoppingBag, title: "My Orders", desc: "View your order history and status", href: "/products" },
  { icon: Package, title: "Track Order", desc: "Check delivery status and tracking", href: "/products" },
  { icon: Heart, title: "Wishlist", desc: "Your saved items and favorites", href: "/products" },
  { icon: Settings, title: "Settings", desc: "Account preferences and profile", href: "/products" },
]

const badges = [
  { icon: ShieldCheck, label: "1-Year Warranty" },
  { icon: RotateCcw, label: "7-Day Returns" },
  { icon: Truck, label: "Free Shipping" },
  { icon: Banknote, label: "Cash on Delivery" },
]

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemAnim = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export default function AccountPage() {
  return (
    <>
      <PageMeta title="My Account" description="Manage your SMARTWEAR account, track orders, and view your wishlist." ogImage="/og-default.jpg" />
      <PageTransition>
        <div className="min-h-screen bg-[#F6F8FA]">
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-sm border border-neutral-200/60">
                <User className="h-8 w-8 text-neutral-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-neutral-500 mb-1">Account</p>
                <h1 className="font-heading text-3xl font-extrabold text-neutral-900 tracking-tight">My Account</h1>
              </div>
            </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {links.map((item) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title} variants={itemAnim}>
                  <Link href={item.href} className="group block outline-none">
                    <div className="bg-white border border-neutral-200/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group-focus-visible:ring-2 group-focus-visible:ring-blue-500">
                      <div className="flex items-center gap-5 p-5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-neutral-50 border border-neutral-200/60 group-hover:bg-blue-50 group-hover:border-blue-500/30 transition-colors">
                          <Icon className="h-5.5 w-5.5 text-neutral-600 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-neutral-900">{item.title}</p>
                          <p className="text-sm text-neutral-500 truncate mt-0.5">{item.desc}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-neutral-300 group-hover:text-neutral-500 transition-colors" strokeWidth={1.5} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-[24px] border border-neutral-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-6 py-6 text-sm font-medium text-neutral-500">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <span key={badge.label} className="inline-flex items-center gap-2 whitespace-nowrap">
                  <Icon className="h-4.5 w-4.5 text-emerald-500" strokeWidth={2} />
                  {badge.label}
                </span>
              )
            })}
          </div>
        </div>
        </div>
      </PageTransition>
    </>
  )
}

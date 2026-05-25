"use client"

import { type ElementType, type ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface StatCardItem {
  label: string
  value: string | number
  icon: ElementType
  iconBg?: string
  iconColor?: string
  trend?: { value: string; positive: boolean }
}

interface StatCardProps {
  label: string
  value: string | number
  icon: ElementType
  iconBg?: string
  iconColor?: string
  trend?: { value: string; positive: boolean }
  delay?: number
  className?: string
}

export function StatCard({ label, value, icon: Icon, iconBg = "bg-primary/10", iconColor = "text-primary", trend, delay = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn("flex items-center gap-5 rounded-[24px] bg-[#FAFAFA] p-6 border border-[#E5E5E5] transition-all duration-300 hover:border-[#0A0A0A]", className)}
    >
      <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] transition-colors border border-[#E5E5E5]", iconBg, iconColor)}>
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#0A0A0A]/50">{label}</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className="mt-1 text-3xl font-extrabold tracking-tight text-[#0A0A0A]"
        >
          {value}
        </motion.p>
        {trend && (
          <p className={cn("mt-2 text-xs font-bold", trend.positive ? "text-emerald-600" : "text-red-500")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function StatCards({ items, className }: { items: StatCardItem[]; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      {items.map((s, i) => (
        <StatCard key={s.label} delay={i * 0.06} {...s} />
      ))}
    </motion.div>
  )
}

"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"

export function DashboardHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm font-medium text-neutral-500">{description}</p>
      </div>
      {children}
    </motion.div>
  )
}

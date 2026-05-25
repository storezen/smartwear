"use client"

import { type ElementType } from "react"
import { motion } from "framer-motion"

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-neutral-500"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-neutral-100 mb-5 border border-neutral-200/60 shadow-sm">
        <Icon className="h-8 w-8 text-neutral-400" strokeWidth={1.5} />
      </div>
      <p className="text-lg font-bold text-neutral-900">{title}</p>
      {description && <p className="text-sm font-medium mt-1 max-w-sm text-center">{description}</p>}
    </motion.div>
  )
}

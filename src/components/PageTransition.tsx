"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const easePremium = [0.16, 1, 0.3, 1] as const

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: easePremium,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

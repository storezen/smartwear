"use client"

import { type ReactNode } from "react"
import { motion, type Variants } from "framer-motion"

interface StaggerGridProps {
  children: ReactNode
  className?: string
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

const easePremium = [0.16, 1, 0.3, 1] as const

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easePremium },
  },
}

export function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

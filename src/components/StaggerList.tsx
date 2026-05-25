"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface StaggerListProps {
  children: ReactNode
  className?: string
  keyProp?: string
}

const easeVal = [0.25, 0.1, 0.25, 1] as const

const itemVariants = {
  hidden: { opacity: 0, x: -12, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.3, ease: easeVal },
  },
  exit: {
    opacity: 0,
    x: 12,
    scale: 0.98,
    transition: { duration: 0.2 },
  },
}

export function StaggerList({ children, className, keyProp }: StaggerListProps) {
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {children}
      </AnimatePresence>
    </div>
  )
}

export function StaggerListItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={className}
    >
      {children}
    </motion.div>
  )
}

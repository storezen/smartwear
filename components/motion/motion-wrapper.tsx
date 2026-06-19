"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

interface MotionWrapperProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode
}

// Base motion variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// Reusable motion components
export const MotionDiv = forwardRef<HTMLDivElement, MotionWrapperProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div ref={ref} className={className} {...props}>
      {children}
    </motion.div>
  )
)
MotionDiv.displayName = "MotionDiv"

export const MotionSection = forwardRef<HTMLDivElement, MotionWrapperProps>(
  ({ children, className, ...props }, ref) => (
    <motion.section ref={ref} className={className} {...props}>
      {children}
    </motion.section>
  )
)
MotionSection.displayName = "MotionSection"

// Animation configs
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
}

export const smoothTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
}

// Viewport animation - trigger when in view
export const viewportOnce = {
  once: true,
  margin: "-100px",
}

// Stagger delay helper
export const getStaggerDelay = (index: number, baseDelay = 0.05) => ({
  delayChildren: index * baseDelay,
})
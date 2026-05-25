"use client"

import { type ReactNode } from "react"
import { motion, type Variants } from "framer-motion"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
}

const easePremium = [0.16, 1, 0.3, 1] as const

const variants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: delay * 0.12,
      ease: easePremium,
    },
  }),
}

export function AnimatedSection({
  children,
  className,
  style,
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={delay}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  )
}

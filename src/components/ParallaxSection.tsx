"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  offset?: number
  speed?: number
}

export function ParallaxSection({ children, className, offset = 0, speed = 0.5 }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset * speed])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, mass: 0.5 })

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: smoothY }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  speed?: number
  containerClass?: string
}

export function ParallaxImage({ src, alt, className, speed = 0.4, containerClass }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", `${10 * speed}%`])
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15])
  const smoothY = useSpring(y, { stiffness: 80, damping: 25, mass: 0.8 })
  const smoothScale = useSpring(scale, { stiffness: 80, damping: 25, mass: 0.8 })

  return (
    <div ref={ref} className={containerClass}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y: smoothY, scale: smoothScale }}
        className={className}
        loading="lazy"
      />
    </div>
  )
}

export function useParallax(speed = 0.5, offset = 200) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset * speed])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, mass: 0.5 })
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 })

  return { ref, y: smoothY, opacity: smoothOpacity }
}

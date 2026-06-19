"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10px" })
  
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })
  
  const display = useTransform(spring, (current) => {
    return prefix + current.toFixed(decimals) + suffix
  })

  useEffect(() => {
    if (inView) {
      spring.set(value)
    }
  }, [inView, spring, value])

  return <motion.span ref={ref}>{display}</motion.span>
}

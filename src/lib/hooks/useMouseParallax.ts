"use client"

import { useEffect } from "react"
import { useMotionValue, useTransform, useSpring, type MotionValue } from "framer-motion"

interface MouseParallaxOptions {
  strength?: number   // 0–1, how strong the effect is
  smooth?: number     // spring stiffness-ish, lower = smoother
}

interface MouseParallaxReturn {
  x: MotionValue<number>
  y: MotionValue<number>
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
}

export function useMouseParallax(options: MouseParallaxOptions = {}): MouseParallaxReturn {
  const { strength = 0.4, smooth = 60 } = options

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const springConfig = { stiffness: smooth, damping: 25, mass: 0.5 }

  const x = useSpring(useTransform(rawX, [-1, 1], [-16 * strength, 16 * strength]), springConfig)
  const y = useSpring(useTransform(rawY, [-1, 1], [-12 * strength, 12 * strength]), springConfig)
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [6 * strength, -6 * strength]), springConfig)
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-8 * strength, 8 * strength]), springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to [-1, 1] range from viewport center
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      rawX.set(nx)
      rawY.set(ny)
    }

    const handleMouseLeave = () => {
      rawX.set(0)
      rawY.set(0)
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [rawX, rawY])

  return { x, y, rotateX, rotateY }
}

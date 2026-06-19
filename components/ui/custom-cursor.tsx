"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show custom cursor on desktop (hover capable devices)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")
    if (!mediaQuery.matches) return

    setIsVisible(true)

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if hovering over interactive elements
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('sw-interactive')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("mouseover", updateHoverState)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mouseover", updateHoverState)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (hover: hover) and (pointer: fine) {
          body * {
            cursor: none !important;
          }
        }
      `}} />
      
      {/* Outer Glow */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-screen"
        style={{
          border: '1px solid rgba(184, 134, 11, 0.4)',
          backgroundColor: isHovering ? 'rgba(184, 134, 11, 0.1)' : 'transparent',
        }}
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.5
        }}
      />
      
      {/* Inner Core */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-[#B8860B] rounded-full pointer-events-none z-[10000]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovering ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.1
        }}
        style={{
          boxShadow: '0 0 10px 2px rgba(184, 134, 11, 0.5)'
        }}
      />
    </>
  )
}

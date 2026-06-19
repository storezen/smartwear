"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  colorIndex: number

  constructor(x: number, y: number, vx: number, vy: number) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.maxLife = Math.random() * 40 + 20
    this.life = this.maxLife
    this.size = Math.random() * 3 + 1
    this.colorIndex = 0 // Will animate from 0 to 1
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    // Gravity / drag
    this.vy += 0.05
    this.vx *= 0.95
    this.life--
    this.colorIndex = 1 - (this.life / this.maxLife)
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = this.life / this.maxLife
    
    // Interpolate from Gold (#B8860B / rgb(184,134,11)) to Emerald (#10b981 / rgb(16,185,129))
    const r = Math.round(184 + (16 - 184) * this.colorIndex)
    const g = Math.round(134 + (185 - 134) * this.colorIndex)
    const b = Math.round(11 + (129 - 11) * this.colorIndex)

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.fill()
  }
}

export function LiquidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname() // To optionally disable on certain pages

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    let particles: Particle[] = []
    let mouseX = width / 2
    let mouseY = height / 2
    let lastMouseX = mouseX
    let lastMouseY = mouseY
    let isMoving = false

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseX = mouseX
      lastMouseY = mouseY
      mouseX = e.clientX
      mouseY = e.clientY
      isMoving = true

      // Spawn particles based on mouse speed
      const dx = mouseX - lastMouseX
      const dy = mouseY - lastMouseY
      const speed = Math.sqrt(dx * dx + dy * dy)
      
      const count = Math.min(Math.floor(speed / 2), 10) + 1
      for (let i = 0; i < count; i++) {
        const vx = (Math.random() - 0.5) * speed * 0.1 + (dx * 0.05)
        const vy = (Math.random() - 0.5) * speed * 0.1 + (dy * 0.05)
        // Add random scatter around the cursor
        const rx = mouseX + (Math.random() - 0.5) * 10
        const ry = mouseY + (Math.random() - 0.5) * 10
        particles.push(new Particle(rx, ry, vx, vy))
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update()
        if (p.life <= 0) {
          particles.splice(i, 1)
        } else {
          p.draw(ctx)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Do not render on mobile to save performance
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] hidden md:block"
      style={{ mixBlendMode: "screen" }}
    />
  )
}

"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, useMotionValue, animate } from "framer-motion"
import { ShoppingBag, ArrowRight, Truck, Shield, Banknote, Eye, PackageCheck, ChevronDown, Zap } from "lucide-react"
import type { HeroData, SectionStyle } from "@/lib/sections"
import { resolveMediaUrl } from "@/lib/media/utils"
import { useMouseParallax } from "@/lib/hooks/useMouseParallax"

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  truck: Truck, shield: Shield, banknote: Banknote,
}

const COD_TRUST_BADGES = [
  { icon: Truck,       text: "Free Delivery" },
  { icon: PackageCheck, text: "Cash on Delivery" },
  { icon: Shield,      text: "7-Day Warranty" },
]

const WORDS = (title: string, highlighted: string) =>
  [...title.split(" "), ...(highlighted ? [highlighted] : [])]

function AnimatedCounter({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const controls = animate(0, to, {
            duration,
            ease: "easeOut",
            onUpdate: (v) => setCount(Math.round(v)),
          })
          return () => controls.stop()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])

  return <span ref={ref}>{count}</span>
}

export function HeroSection({ data, style: _style }: { data: HeroData; style: SectionStyle }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // Scroll-out effect
  const watchY     = useTransform(scrollYProgress, [0, 1], [0, -80])
  const watchScale = useTransform(scrollYProgress, [0, 1], [1, 1.06])
  const textY      = useTransform(scrollYProgress, [0, 1], [0, -24])
  const dotGridY   = useTransform(scrollYProgress, [0, 1], [0, 40])
  const heroBgO    = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const smoothWatchY     = useSpring(watchY,     { stiffness: 65, damping: 22 })
  const smoothWatchScale = useSpring(watchScale, { stiffness: 65, damping: 22 })
  const smoothTextY      = useSpring(textY,      { stiffness: 65, damping: 22 })

  const { x: mouseX, rotateX: watchTiltX, rotateY: watchTiltY } = useMouseParallax({ strength: 0.3 })

  // Scroll indicator hide
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setScrolled(v > 0.04))
    return unsub
  }, [scrollYProgress])

  // Word stagger for headline
  const words = data.title?.split(" ") || []

  return (
    <section
      ref={heroRef}
      className="relative min-h-[72vh] overflow-hidden flex items-center border-b border-black/5 py-14 lg:py-24"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 60% 110%, rgba(37,99,235,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 10% 0%, rgba(16,185,129,0.03) 0%, transparent 60%), #F6F8FA",
      }}
    >
      {/* Animated dot grid */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.9) 1.5px, transparent 0)",
          backgroundSize: "32px 32px",
          y: dotGridY,
          opacity: heroBgO,
        } as any}
      />

      {/* Large ambient glow orbs */}
      <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/4 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/3 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 lg:px-8 w-full">
        <div className="grid gap-8 lg:grid-cols-12 items-center">

          {/* ── Left: Typography + CTAs ── */}
          <motion.div
            style={{ y: smoothTextY }}
            className="lg:col-span-7 flex flex-col justify-center text-left"
          >
            {/* Badge row */}
            <div className="flex items-center gap-3 mb-5">
              {data.badge && (
                <motion.span
                  initial={{ opacity: 0, y: -8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 border border-blue-500/20 bg-blue-50 text-blue-600 px-3 py-1 text-[11px] font-bold rounded-full tracking-wider"
                >
                  <Zap className="size-2.5" strokeWidth={2.5} />
                  {data.badge}
                </motion.span>
              )}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium"
              >
                <Eye className="size-3" strokeWidth={1.5} />
                <span>
                  <AnimatedCounter to={247} /> shopping now
                </span>
              </motion.span>
            </div>

            {/* Headline — word-by-word stagger */}
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-950 sm:text-5xl xl:text-6xl drop-shadow-sm">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
              {data.highlightedWord && (
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 + words.length * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block text-blue-600"
                >
                  {" "}{data.highlightedWord}
                </motion.span>
              )}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-lg text-[15px] font-medium leading-relaxed text-neutral-600"
            >
              {data.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap gap-3 items-center"
            >
              <Link href={data.primaryButtonUrl}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative flex items-center gap-2 h-[48px] px-7 bg-neutral-950 text-white font-bold rounded-2xl overflow-hidden text-sm transition-colors hover:bg-neutral-800"
                >
                  {/* Shimmer sweep on hover */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <ShoppingBag className="h-4 w-4 relative" strokeWidth={2} />
                  <span className="relative">{data.primaryButtonText}</span>
                </motion.button>
              </Link>
              <Link href={data.secondaryButtonUrl}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 h-[48px] px-7 border border-neutral-200/80 text-neutral-700 font-semibold bg-white hover:bg-neutral-50 rounded-2xl transition-all duration-200 text-sm shadow-sm"
                >
                  {data.secondaryButtonText} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </motion.button>
              </Link>
            </motion.div>

            {/* COD Trust Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              className="mt-5 flex flex-wrap gap-x-5 gap-y-2 pt-4 border-t border-black/5"
            >
              {COD_TRUST_BADGES.map((badge, i) => {
                const Icon = badge.icon
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                    <Icon className="size-3 text-blue-600" strokeWidth={1.5} />
                    {badge.text}
                  </span>
                )
              })}
            </motion.div>
          </motion.div>

          {/* ── Right: Product Image ── */}
          <div className="lg:col-span-5 relative flex items-center justify-center py-6">
            {/* Glow */}
            <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full bg-blue-500/6 blur-[90px] pointer-events-none" />

            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-52 h-52 sm:w-[300px] sm:h-[300px] rounded-full border border-dashed border-blue-500/10 pointer-events-none"
            />
            {/* Inner ring */}
            <div className="absolute w-36 h-36 sm:w-[210px] sm:h-[210px] rounded-full border border-blue-500/10 pointer-events-none" />

            {/* Product image with 3D tilt */}
            <motion.div
              style={{
                y: smoothWatchY,
                scale: smoothWatchScale,
                x: mouseX,
                rotateX: watchTiltX,
                rotateY: watchTiltY,
                transformPerspective: 1000,
              }}
              className="relative z-10 w-full max-w-[220px] sm:max-w-[300px]"
            >
              <img
                src={resolveMediaUrl(data.featuredImage)}
                alt="Premium Smartwatch"
                className="w-full h-auto object-contain select-none drop-shadow-[0_32px_48px_rgba(0,0,0,0.14)]"
                draggable={false}
              />

              {/* Floating live stock badge */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 right-2 bg-white/95 border border-emerald-500/25 rounded-full px-3 py-1.5 backdrop-blur-md flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold text-neutral-700">Lahore: In Stock</span>
              </motion.div>
            </motion.div>

            {/* Spec chips — float independently */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute left-0 top-[10%] z-20 hidden md:flex flex-col gap-1 items-end bg-white/90 border border-neutral-200/60 p-2.5 rounded-xl pointer-events-none shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm"
            >
              <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold">Display</span>
              <span className="text-[11px] text-neutral-800 font-bold">2.2&quot; AMOLED</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
              className="absolute right-0 top-[30%] z-20 hidden md:flex flex-col gap-1 items-start bg-white/90 border border-neutral-200/60 p-2.5 rounded-xl pointer-events-none shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm"
            >
              <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold">Battery</span>
              <span className="text-[11px] text-neutral-800 font-bold">7 Day Life</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.9 }}
              className="absolute right-0 bottom-[20%] z-20 hidden md:flex flex-col gap-1 items-start bg-white/90 border border-neutral-200/60 p-2.5 rounded-xl pointer-events-none shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm"
            >
              <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-bold">Calling</span>
              <span className="text-[11px] text-neutral-800 font-bold">HD Bluetooth</span>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ opacity: scrolled ? 0 : 1, y: scrolled ? 8 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
      >
        <span className="text-[10px] text-neutral-400 font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="size-4 text-neutral-300" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
    </section>
  )
}

"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, animate } from "framer-motion"
import { ArrowUpRight, ShoppingBag, Shield, Truck, PackageCheck, Zap, Star } from "lucide-react"
import type { HeroData, SectionStyle } from "@/lib/sections"
import { resolveMediaUrl } from "@/lib/media/utils"
import { useMouseParallax } from "@/lib/hooks/useMouseParallax"

function AnimatedCounter({ to, duration = 1.5, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
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

  return <span ref={ref}>{count}{suffix}</span>
}

export function HeroSectionRenderer({ data, style }: { data: HeroData; style: SectionStyle }) {
  const layout = data.layout || "bento"

  switch (layout) {
    case "centered":
      return <CenteredHero data={data} style={style} />
    case "split":
      return <SplitHero data={data} style={style} />
    case "fullscreen":
      return <FullscreenHero data={data} style={style} />
    case "bento":
    default:
      return <BentoHero data={data} style={style} />
  }
}

// 1. Bento Layout (Original)
function BentoHero({ data, style }: { data: HeroData; style: SectionStyle }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const watchY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const smoothWatchY = useSpring(watchY, { stiffness: 65, damping: 22 })
  const { x: mouseX, rotateX: watchTiltX, rotateY: watchTiltY } = useMouseParallax({ strength: 0.4 })
  const words = data.title?.split(" ") || []
  const springTransition = { duration: 0.3, ease: "easeOut" as const }

  return (
    <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center py-12 lg:py-20 bg-[#F6F8FA] overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={springTransition} className="lg:col-span-8 bg-white rounded-[32px] p-8 sm:p-12 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between min-h-[500px]">
            <div className="flex items-center gap-3 relative z-20">
              {data.badge && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 px-3 py-1.5 text-xs font-semibold rounded-full">
                  <Zap className="size-3.5" /> {data.badge}
                </span>
              )}
            </div>
            <div className="relative z-20 mt-8 max-w-xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.05]">
                {words.map((word, i) => (
                  <span key={i} className="inline-block mr-[0.25em]">{word}</span>
                ))}
                {data.highlightedWord && <span className="inline-block text-blue-600">{data.highlightedWord}</span>}
              </h1>
              <p className="mt-6 text-lg text-neutral-500 font-medium max-w-md">{data.description}</p>
              <div className="mt-10 flex items-center gap-4">
                <Link href={data.primaryButtonUrl}>
                  <button className="flex items-center gap-2 h-[48px] px-8 bg-neutral-950 text-white font-bold rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-md">
                    <ShoppingBag className="size-4" /> {data.primaryButtonText}
                  </button>
                </Link>
                <Link href={data.secondaryButtonUrl}>
                  <button className="flex items-center justify-center size-[48px] bg-neutral-100 text-neutral-950 rounded-2xl transition-transform hover:scale-105 active:scale-95 hover:bg-neutral-200">
                    <ArrowUpRight className="size-5" />
                  </button>
                </Link>
              </div>
            </div>
            <motion.div style={{ y: smoothWatchY, x: mouseX, rotateX: watchTiltX, rotateY: watchTiltY, transformPerspective: 1200 }} className="absolute right-[-10%] bottom-[-10%] w-[350px] sm:w-[450px] lg:w-[550px] pointer-events-none z-10">
              <img src={resolveMediaUrl(data.featuredImage)} alt="Featured Product" className="w-full h-auto object-contain drop-shadow-2xl" />
            </motion.div>
          </motion.div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springTransition, delay: 0.1 }} className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-center flex-1">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-6">Guaranteed</h3>
              <div className="space-y-5">
                {[{ icon: Truck, text: "Free Fast Delivery" }, { icon: PackageCheck, text: "Cash on Delivery" }, { icon: Shield, text: "7-Day Warranty" }].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6F8FA] text-blue-600"><item.icon className="size-5" /></div>
                    <span className="font-semibold text-neutral-800">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...springTransition, delay: 0.2 }} className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex-1 group">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider mb-3">
                    <Star className="size-3 fill-rose-600" /> Popular
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 leading-tight max-w-[150px]">Most Loved by Users</h3>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">{[1,2,3].map((i) => (<div key={i} className="size-8 rounded-full border-2 border-white bg-neutral-200" />))}</div>
                  <div className="text-xs font-bold text-neutral-600"><AnimatedCounter to={12} suffix="K+" /> reviews</div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} className="absolute right-[-20%] bottom-[-20%] w-[180px] h-[180px] rounded-full bg-[#F6F8FA] flex items-center justify-center p-4">
                <img src={resolveMediaUrl(data.bgImage)} className="w-full h-full object-cover rounded-full shadow-inner" alt="Secondary" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// 2. Centered Layout
function CenteredHero({ data, style }: { data: HeroData; style: SectionStyle }) {
  const words = data.title?.split(" ") || []
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-20 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F6F8FA] to-white pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {data.badge && (
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 px-4 py-2 text-xs font-semibold rounded-full mb-8">
            <Zap className="size-3.5" /> {data.badge}
          </motion.span>
        )}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-neutral-950 leading-[1.05] max-w-3xl">
          {words.map((word, i) => (
            <span key={i} className="inline-block mr-[0.25em]">{word}</span>
          ))}
          {data.highlightedWord && <span className="inline-block text-blue-600">{data.highlightedWord}</span>}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-xl text-neutral-500 font-medium max-w-2xl">
          {data.description}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex items-center gap-4 justify-center">
          <Link href={data.primaryButtonUrl}>
            <button className="flex items-center gap-2 h-[54px] px-10 bg-neutral-950 text-white font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-neutral-950/20">
              {data.primaryButtonText}
            </button>
          </Link>
          <Link href={data.secondaryButtonUrl}>
            <button className="flex items-center gap-2 h-[54px] px-8 bg-transparent text-neutral-950 font-bold rounded-full transition-transform hover:bg-neutral-100">
              {data.secondaryButtonText} <ArrowUpRight className="size-4" />
            </button>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16 w-full max-w-5xl mx-auto rounded-[32px] overflow-hidden shadow-2xl shadow-neutral-200/50 border border-neutral-200/50">
          <img src={resolveMediaUrl(data.featuredImage)} alt="Hero" className="w-full h-auto aspect-video object-cover" />
        </motion.div>
      </div>
    </section>
  )
}

// 3. Split Layout
function SplitHero({ data, style }: { data: HeroData; style: SectionStyle }) {
  const words = data.title?.split(" ") || []
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#F6F8FA]">
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-20 z-10">
          {data.badge && (
            <span className="inline-flex items-center gap-1.5 bg-white shadow-sm text-neutral-600 px-3 py-1.5 text-xs font-semibold rounded-full w-fit mb-8 border border-neutral-200/60">
              {data.badge}
            </span>
          )}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.05]">
            {words.map((word, i) => (
              <span key={i} className="inline-block mr-[0.25em]">{word}</span>
            ))}
            <br />
            {data.highlightedWord && <span className="inline-block text-blue-600">{data.highlightedWord}</span>}
          </h1>
          <p className="mt-8 text-lg text-neutral-500 font-medium max-w-md">
            {data.description}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link href={data.primaryButtonUrl}>
              <button className="flex items-center gap-2 h-[50px] px-8 bg-neutral-950 text-white font-bold rounded-xl transition-transform hover:scale-105 shadow-md">
                {data.primaryButtonText} <ArrowUpRight className="size-4" />
              </button>
            </Link>
          </div>
          <div className="mt-16 flex items-center gap-8">
            {[{ icon: Truck, text: "Free Delivery" }, { icon: Shield, text: "Authentic" }].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-white shadow-sm text-blue-600">
                  <item.icon className="size-4" />
                </div>
                <span className="text-sm font-bold text-neutral-800">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[50vh] lg:h-full w-full bg-neutral-100 overflow-hidden">
          <img src={resolveMediaUrl(data.featuredImage)} alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </div>
    </section>
  )
}

// 4. Fullscreen Layout
function FullscreenHero({ data, style }: { data: HeroData; style: SectionStyle }) {
  const words = data.title?.split(" ") || []
  return (
    <section className="relative min-h-[100vh] flex items-end pb-20 justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={resolveMediaUrl(data.featuredImage)} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {data.badge && (
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 text-xs font-semibold rounded-full mb-8">
            {data.badge}
          </span>
        )}
        <h1 className="text-6xl sm:text-7xl lg:text-9xl font-extrabold tracking-tight text-white leading-[1.0] max-w-5xl mix-blend-overlay drop-shadow-lg">
          {words.join(" ")} {data.highlightedWord}
        </h1>
        <p className="mt-8 text-xl text-neutral-200 font-medium max-w-2xl drop-shadow-md">
          {data.description}
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4 justify-center">
          <Link href={data.primaryButtonUrl}>
            <button className="flex items-center gap-2 h-[54px] px-10 bg-white text-black font-bold rounded-full transition-transform hover:scale-105">
              {data.primaryButtonText}
            </button>
          </Link>
          <Link href={data.secondaryButtonUrl}>
            <button className="flex items-center gap-2 h-[54px] px-8 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full transition-transform hover:bg-white/20">
              {data.secondaryButtonText}
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

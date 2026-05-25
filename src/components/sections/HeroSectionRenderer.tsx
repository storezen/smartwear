"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, animate } from "framer-motion"
import { ArrowUpRight, ShoppingBag, Shield, Truck, PackageCheck, Zap, Star } from "lucide-react"
import type { HeroData, SectionStyle } from "@/lib/sections"
import { resolveMediaUrl } from "@/lib/media/utils"

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
      return <ImageBannerHero data={data} style={style} />
  }
}

// 1. Premium Split Layout (Default)
function ImageBannerHero({ data, style }: { data: HeroData; style: SectionStyle }) {
  const words = data.title?.split(" ") || []

  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen opacity-50" />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 py-24">
        
        {/* Left Side: Caption */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-start text-left"
        >
          {data.badge && (
            <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md text-neutral-300 border border-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full mb-8 shadow-sm">
              <Zap className="size-3.5 text-neutral-400" /> {data.badge}
            </span>
          )}

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.1]">
            {words.map((word, i) => (
              <span key={i} className="inline-block mr-[0.25em]">{word}</span>
            ))}
            {data.highlightedWord && <span className="inline-block font-semibold text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-500">{data.highlightedWord}</span>}
          </h1>

          {data.description && (
            <p className="mt-8 text-lg sm:text-xl text-neutral-400 font-light max-w-xl leading-relaxed tracking-wide">
              {data.description}
            </p>
          )}

          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
            {data.primaryButtonText && (
              <Link href={data.primaryButtonUrl || "/products"}>
                <button className="flex items-center justify-center gap-2 h-[56px] min-w-[200px] px-8 bg-white text-black font-semibold tracking-wide uppercase text-sm rounded-full transition-all hover:bg-neutral-200 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                  <ShoppingBag className="size-4" /> {data.primaryButtonText}
                </button>
              </Link>
            )}
            
            {data.secondaryButtonText && (
              <Link href={data.secondaryButtonUrl || "/categories"}>
                <button className="flex items-center justify-center gap-2 h-[56px] min-w-[200px] px-8 bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold tracking-wide uppercase text-sm rounded-full transition-all hover:bg-white/10 hover:scale-105 active:scale-95">
                  {data.secondaryButtonText} <ArrowUpRight className="size-4" />
                </button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Right Side: Image Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="flex-1 w-full max-w-lg lg:max-w-none perspective-1000"
        >
          <div className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[32px] overflow-hidden bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/50 group transform-gpu transition-transform duration-700 hover:rotate-y-2 hover:rotate-x-2">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-50" />
            <img
              src={resolveMediaUrl(data.featuredImage)}
              alt={data.title || "Hero Featured"}
              className="w-full h-full object-cover object-center transform-gpu transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Inner glow/border detail */}
            <div className="absolute inset-0 border border-white/5 rounded-[32px] z-20 pointer-events-none" />
          </div>
        </motion.div>

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
    <section className="relative min-h-[90vh] flex items-center bg-white">
      <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2">
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
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
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

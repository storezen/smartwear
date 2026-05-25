"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring, animate } from "framer-motion"
import { ArrowUpRight, ShoppingBag, Shield, Truck, PackageCheck, Zap, Star } from "lucide-react"
import type { HeroData, SectionStyle } from "@/lib/sections"
import { resolveMediaUrl } from "@/lib/media/utils"
import { useMouseParallax } from "@/lib/hooks/useMouseParallax"
import { cn } from "@/lib/utils"

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

export function BentoHeroSection({ data, style }: { data: HeroData; style: SectionStyle }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const watchY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const smoothWatchY = useSpring(watchY, { stiffness: 65, damping: 22 })
  const { x: mouseX, y: mouseY, rotateX: watchTiltX, rotateY: watchTiltY } = useMouseParallax({ strength: 0.4 })

  const words = data.title?.split(" ") || []

  const springTransition = { duration: 0.3, ease: "easeOut" as const }

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85vh] flex items-center justify-center py-12 lg:py-20 bg-white overflow-hidden"
    >
      {/* Background ambient glow matching Light Paradigm */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Hero Tile (Left) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="lg:col-span-8 bg-white rounded-[32px] p-8 sm:p-12 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between min-h-[500px]"
          >
            {/* Header / Badge */}
            <div className="flex items-center gap-3 relative z-20">
              {data.badge && (
                <span className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 px-3 py-1.5 text-xs font-semibold rounded-full">
                  <Zap className="size-3.5" /> {data.badge}
                </span>
              )}
            </div>

            {/* Typography */}
            <div className="relative z-20 mt-8 max-w-xl">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 leading-[1.05]">
                {words.map((word, i) => (
                  <span key={i} className="inline-block mr-[0.25em]">{word}</span>
                ))}
                {data.highlightedWord && (
                  <span className="inline-block text-blue-600">{data.highlightedWord}</span>
                )}
              </h1>
              <p className="mt-6 text-lg text-neutral-500 font-medium max-w-md">
                {data.description}
              </p>

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

            {/* 3D Floating Product Image */}
            <motion.div 
              style={{
                y: smoothWatchY,
                x: mouseX,
                rotateX: watchTiltX,
                rotateY: watchTiltY,
                transformPerspective: 1200,
              }}
              className="absolute right-[-10%] bottom-[-10%] w-[350px] sm:w-[450px] lg:w-[550px] pointer-events-none z-10"
            >
              <img 
                src={resolveMediaUrl(data.featuredImage)} 
                alt="Featured Product" 
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>

          {/* Right Column Stack */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Top Right: Trust Signals / Badges */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springTransition, delay: 0.1 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-center flex-1"
            >
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-6">Guaranteed</h3>
              <div className="space-y-5">
                {[
                  { icon: Truck, text: "Free Fast Delivery" },
                  { icon: PackageCheck, text: "Cash on Delivery" },
                  { icon: Shield, text: "7-Day Warranty" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6F8FA] text-blue-600">
                      <item.icon className="size-5" />
                    </div>
                    <span className="font-semibold text-neutral-800">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bottom Right: Mini Product / Social Proof */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...springTransition, delay: 0.2 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden flex-1 group"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider mb-3">
                    <Star className="size-3 fill-rose-600" /> Popular
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 leading-tight max-w-[150px]">
                    Most Loved by Users
                  </h3>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="size-8 rounded-full border-2 border-white bg-neutral-200" />
                    ))}
                  </div>
                  <div className="text-xs font-bold text-neutral-600">
                    <AnimatedCounter to={12} suffix="K+" /> reviews
                  </div>
                </div>
              </div>

              {/* Floating secondary image logic could go here, using a generic placeholder for now to match Nitec layout */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="absolute right-[-20%] bottom-[-20%] w-[180px] h-[180px] rounded-full bg-[#F6F8FA] flex items-center justify-center p-4"
              >
                <img src={resolveMediaUrl(data.bgImage)} className="w-full h-full object-cover rounded-full shadow-inner" alt="Secondary" />
              </motion.div>
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  )
}

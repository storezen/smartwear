"use client"

import { useState } from "react"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Mail, Sparkles, ArrowRight, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { NewsletterData, SectionStyle } from "@/lib/sections"
import { paddingVals } from "./section-utils"

export function NewsletterSection({ data, style }: { data: NewsletterData; style: SectionStyle }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSuccess(true)
    setEmail("")
    toast.success("You're in! Welcome to SMARTWEAR family 🎉")
  }

  return (
    <AnimatedSection
      style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}
      className="bg-[#F6F8FA]"
    >
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800/60 px-8 py-16 sm:px-16 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">

          {/* Dark Dot mesh texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.2]"
            style={{
              backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.8) 1.5px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Gradient orbs */}
          <div className="pointer-events-none absolute -top-20 left-1/4 h-56 w-56 rounded-full bg-blue-600/15 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 right-1/4 h-56 w-56 rounded-full bg-emerald-500/10 blur-[80px]" />

          {/* Top shimmer line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative">
            {/* Icon */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm"
            >
              <Mail className="size-6 text-white" strokeWidth={1.5} />
            </motion.div>

            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-5 shadow-[0_0_12px_rgba(37,99,235,0.2)]">
              <Sparkles className="size-2.5" strokeWidth={2} />
              Exclusive Members
            </span>

            <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
              {data.title || "Get Exclusive Deals First"}
            </h3>
            <p className="mt-4 text-[15px] text-neutral-300 max-w-md mx-auto leading-relaxed drop-shadow">
              {data.description || "Join 10,000+ smart shoppers. Get early access to new arrivals and exclusive COD offers."}
            </p>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4"
              >
                <ShieldCheck className="size-5 text-emerald-400" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-emerald-300">You&apos;re subscribed! Check your inbox.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={data.placeholder || "your@email.com"}
                  className="flex-1 h-[48px] rounded-xl bg-white/10 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/15 transition-all backdrop-blur-sm"
                />
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="h-[48px] px-5 bg-white hover:bg-blue-50 text-neutral-950 font-bold rounded-xl transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap disabled:opacity-60"
                >
                  {loading ? (
                    <span className="size-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      {data.buttonText || "Subscribe"}
                      <ArrowRight className="size-3.5" strokeWidth={2} />
                    </>
                  )}
                </motion.button>
              </form>
            )}

            <p className="mt-3 text-[11px] text-white/25">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

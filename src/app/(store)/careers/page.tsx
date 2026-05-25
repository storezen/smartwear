"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import { MapPin, Clock, Users, Zap, Send, Sparkles, ShieldCheck, Banknote, RotateCcw, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const perks = [
  {
    icon: Zap,
    title: "Fast-Paced Environment",
    desc: "We move quickly and value people who take ownership. Titles matter less than impact.",
  },
  {
    icon: Users,
    title: "Small Team, Big Reach",
    desc: "Work alongside a lean team that serves thousands of customers across Pakistan.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    desc: "We care about output, not hours. Work when you are most effective.",
  },
  {
    icon: MapPin,
    title: "Remote-First",
    desc: "Work from anywhere in Pakistan. We meet up quarterly for strategy and team events.",
  },
]

export default function CareersPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="Careers" description="Join the SMARTWEAR team — build the future of wearable tech ecommerce." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#F6F8FA]">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-white border border-neutral-200/60 shadow-sm">
              <Users className="h-6 w-6 text-neutral-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Careers</p>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl leading-[1.05]">Join the team</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-neutral-900" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-neutral-500">
                We are building the future of smart gadget retail in Pakistan. If you want to be part of it, we want to hear from you.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {perks.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-7 py-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-neutral-50 border border-neutral-200/60 group-hover:bg-blue-50 group-hover:border-blue-500/30 transition-colors">
                    <Icon className="h-5.5 w-5.5 text-neutral-600 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 mt-5">{p.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{p.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-10 bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-neutral-200/60">
                <Sparkles className="h-6 w-6 text-blue-600" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-neutral-900">No open roles right now</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                But we are always looking for talented people. Send us your resume and we will keep you in mind for future opportunities.
              </p>
              <Link href="/contact">
                <button className="mt-8 h-[48px] bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] inline-flex items-center justify-center text-sm tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-8">
                  Send Your Resume <Send className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-[24px] border border-neutral-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-neutral-500">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" strokeWidth={2} /> 1-Year Warranty</span>
            <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-emerald-500" strokeWidth={2} /> 7-Day Returns</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-500" strokeWidth={2} /> Free Shipping</span>
            <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-emerald-500" strokeWidth={2} /> Cash on Delivery</span>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { PageMeta } from "@/components/PageMeta"
import { useState } from "react"
import { Mail, Phone, MessageCircle, Clock, ArrowUpRight, ShieldCheck, Banknote, RotateCcw, Truck, Send, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const channels = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+92 300 1234567",
    desc: "Fastest response — usually within minutes.",
    href: "#",
    action: "Send a message",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@smartwear.com",
    desc: "We reply within 24 hours.",
    href: "mailto:hello@smartwear.com",
    action: "Send an email",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+92 21 1234567",
    desc: "Mon–Fri, 10 AM – 7 PM.",
    href: "tel:+92211234567",
    action: "Give us a call",
  },
  {
    icon: Clock,
    title: "Business Hours",
    value: "Mon–Sat, 10 AM – 8 PM",
    desc: "Sunday: Closed",
    href: null,
    action: null,
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Name is required"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address"
    if (!form.subject.trim()) e.subject = "Subject is required"
    if (!form.message.trim()) e.message = "Message is required"
    else if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to send")
      setSent(true)
      toast.success("Message sent!", { description: "We'll get back to you within 24 hours." })
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch {
      toast.error("Failed to send message. Please try again.")
    }
    setSubmitting(false)
    setTimeout(() => setSent(false), 4000)
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageMeta title="Contact" description="Get in touch with SMARTWEAR. We're here to help with orders, returns, and questions." ogImage="/og-default.jpg" />

      <div className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] shadow-sm">
              <MessageCircle className="h-6 w-6 text-[#0A0A0A]/60" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-2">Contact Us</p>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05]">Get in touch</h1>
              <div className="mt-4 h-0.5 w-16 rounded-full bg-[#0A0A0A]" />
              <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[#0A0A0A]/60">
                Have a question about a product, your order, or anything else? Drop us a message and we&apos;ll get back to you.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5 lg:auto-rows-fr">
            <div className="lg:col-span-3">
              <div className="bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex h-full flex-col p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#E5E5E5]">
                    <Mail className="h-5 w-5 text-[#0A0A0A]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#0A0A0A]">Send us a message</h2>
                    <p className="text-sm text-[#0A0A0A]/60">We typically reply within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-1.5 block">Full Name *</label>
                      <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" className={cn("h-[48px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A] rounded-xl px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-150", errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "")} />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-1.5 block">Email Address *</label>
                      <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" className={cn("h-[48px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A] rounded-xl px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-150", errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "")} />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-1.5 block">Subject *</label>
                    <input id="subject" value={form.subject} onChange={(e) => update("subject", e.target.value)} placeholder="How can we help?" className={cn("h-[48px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A] rounded-xl px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-150", errors.subject ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "")} />
                    {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="flex flex-1 flex-col space-y-1.5">
                    <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/60 mb-1.5 block">Message *</label>
                    <textarea id="message" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us more about your inquiry..." className={cn("flex-1 min-h-[120px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-2 focus:ring-[#0A0A0A] rounded-xl p-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-150 resize-none", errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "")} />
                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button type="submit" disabled={submitting || sent} className="h-[48px] bg-[#0A0A0A] hover:scale-[1.02] text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-8 disabled:opacity-60 disabled:cursor-not-allowed">
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</>
                      ) : sent ? (
                        <><CheckCircle2 className="h-4 w-4 text-[#10B981] mr-2" /> Sent!</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" /> Send Message</>
                      )}
                    </button>
                    {sent && (
                      <span className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle2 className="h-4 w-4" /> Message delivered
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-2 h-full">
              {channels.map((ch) => {
                const Icon = ch.icon
                return (
                  <div key={ch.title} className="bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#E5E5E5] group-hover:bg-[#F0F0F0] group-hover:border-[#0A0A0A] transition-colors">
                        <Icon className="h-5 w-5 text-[#0A0A0A]/60 group-hover:text-[#0A0A0A] transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#0A0A0A]">{ch.title}</p>
                        <p className="mt-0.5 text-sm text-[#0A0A0A]/60 truncate">{ch.value}</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#0A0A0A]/40">{ch.desc}</p>
                        {ch.href && ch.action && (
                          <a href={ch.href} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] transition-colors hover:text-[#0A0A0A]">
                            {ch.action} <ArrowUpRight className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-3xl border border-[#E5E5E5] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] px-8 py-6 text-sm text-[#0A0A0A]/60">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 1-Year Warranty</span>
            <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> 7-Day Returns</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Free Shipping</span>
            <span className="flex items-center gap-2"><Banknote className="h-4 w-4 text-[#10B981]" strokeWidth={2} /> Cash on Delivery</span>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

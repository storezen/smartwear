"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Send, ChevronRight } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [s, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch('/api/public/settings').then(r => r.json()).then(setSettings)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      {/* Header */}
      <div className="relative overflow-hidden text-white pt-14 pb-6 md:pt-28 md:pb-16 border-b border-white/5 mb-4 sm:mb-6">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ background: "radial-gradient(circle, #B8860B, transparent)" }}
        />
        <div className="sw-container relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-white/70 mb-4 sm:mb-6 justify-center uppercase tracking-wide sm:tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span className="text-[#B8860B]">Contact Us</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-2 sm:mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            Get in Touch
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Have a question about our timepieces? Our concierge team is here to assist you with the highest level of service.
          </p>
        </div>
      </div>

        <div className="sw-container pb-12 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-24 items-start">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-all"
            >
              <div className="w-12 h-12 bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-6 border border-[#B8860B]/20">
                <MapPin className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Visit Our Boutique</h3>
              <p className="text-white/60 leading-relaxed">
                {s?.store_name || 'Smartwear'} Flagship Store<br/>
                {s?.store_address_line1 || 'MM Alam Road'}{s?.store_address_line2 ? `, ${s.store_address_line2}` : ''}<br/>
                {s?.store_city || 'Lahore, Pakistan'}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 md:p-8 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-all"
            >
              <div className="w-12 h-12 bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-6 border border-[#B8860B]/20">
                <Phone className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Call Us</h3>
              <p className="text-white/60 leading-relaxed mb-1">{s?.support_phone || '+92 300 1234567'}</p>
              <p className="text-white/60 text-sm">{s?.business_hours || 'Mon-Sat: 10am - 8pm PKT'}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 md:p-8 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-all"
            >
              <div className="w-12 h-12 bg-[#B8860B]/10 rounded-full flex items-center justify-center mb-6 border border-[#B8860B]/20">
                <Mail className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Email Us</h3>
              <p className="text-[#B8860B] leading-relaxed">{s?.support_email || 'concierge@smartwear.pk'}</p>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 md:p-10 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Send a Message</h2>
            {sent ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent</h3>
                <p className="text-white/60">Thank you for reaching out. Our concierge team will respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/70 font-medium">First Name</label>
                    <input required type="text" className="w-full bg-[#0F1923] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B8860B] outline-none transition-colors" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/70 font-medium">Last Name</label>
                    <input required type="text" className="w-full bg-[#0F1923] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B8860B] outline-none transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/70 font-medium">Email Address</label>
                  <input required type="email" className="w-full bg-[#0F1923] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B8860B] outline-none transition-colors" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/70 font-medium">Message</label>
                  <textarea required rows={5} className="w-full bg-[#0F1923] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B8860B] outline-none transition-colors resize-none" placeholder="How can we help you today?" />
                </div>
                <button type="submit" disabled={loading} className="sw-btn-gold w-full h-14 text-base font-semibold">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

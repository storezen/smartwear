'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, MapPin, Truck, Star, Home, Calendar } from 'lucide-react'
import { TikTokEvents, identifyUser } from '@/lib/tiktok-pixel'
import { formatPrice } from '@/lib/mock-data'
import { SpotlightCard } from '@/components/ui/spotlight-card'

/* ── CSS-only gold particle positions (no external lib) ── */
const PARTICLES = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: 3 + Math.random() * 10,
  delay: Math.random() * 2,
  duration: 2.5 + Math.random() * 3,
  drift: (Math.random() - 0.5) * 150,
  rotate: Math.random() * 720,
  color: i % 3 === 0 ? '#D4A017' : i % 3 === 1 ? '#F0C040' : '#B8860B',
  shape: i % 4 === 0 ? 'circle' : i % 4 === 1 ? 'square' : i % 4 === 2 ? 'diamond' : 'bar',
}))

const TIMELINE_STEPS = [
  { icon: CheckCircle, label: 'Order Confirmed', sub: 'Just now', done: true },
  { icon: Package, label: 'Processing', sub: 'Within 24 hours', done: false },
  { icon: Truck, label: 'Out for Delivery', sub: '2–4 business days', done: false },
  { icon: Home, label: 'Delivered', sub: 'At your doorstep', done: false },
]

function GoldParticles({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: -20, x: `${p.x}vw`, rotate: 0, scale: 1 }}
          animate={{
            y: '120vh',
            x: `calc(${p.x}vw + ${p.drift}px)`,
            rotate: p.rotate,
            scale: [1, 0.8, 0.3],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: -20,
            width: p.size,
            height: p.shape === 'bar' ? p.size * 0.35 : p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '2px' : '1px',
            transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}80`,
          }}
        />
      ))}
    </div>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderIdFromQuery = searchParams.get('order')
  const totalFromQuery = parseFloat(searchParams.get('total') || '0')
  const orderId = orderIdFromQuery || ''

  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    const dedupKey = `tiktokPurchaseSent_${orderId}`
    let alreadySent = false
    try { alreadySent = !!sessionStorage.getItem(dedupKey) } catch {}
    if (!orderId || alreadySent) return

    const firePurchase = async () => {
      let orderTotal = 0
      let orderItems: any[] = []
      let email = ''
      let phone = ''
      try {
        const res = await fetch(`/api/orders/track?id=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.order) {
            setOrderDetails(data.order)
            orderTotal = data.order.total || 0
            orderItems = data.order.items || []
            email = data.order.email || ''
            phone = data.order.phone || ''
          }
        }
      } catch (_) {}
      if (orderItems.length === 0 && !totalFromQuery) return
      if (email || phone) identifyUser(email, phone)
      TikTokEvents.purchase({ id: orderId, total: orderTotal || totalFromQuery || 0, items: orderItems })
      try { sessionStorage.setItem(dedupKey, '1') } catch {}
    }

    firePurchase()

    const t1 = setTimeout(() => setShowParticles(true), 400)
    const t2 = setTimeout(() => setShowParticles(false), 6000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [orderId, totalFromQuery])

  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">
      <GoldParticles active={showParticles} />

      {/* Ambient glows */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.15] bg-[#B8860B] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10"
      >
        <SpotlightCard className="p-8 md:p-12 text-center relative overflow-hidden">
          
          {/* Animated Background Border inside card */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute inset-0 border border-[#B8860B]/20 rounded-[24px]"
            style={{ boxShadow: "inset 0 0 40px rgba(184,134,11,0.05)" }}
          />

          {/* Success Icon */}
          <div className="relative mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] p-1 shadow-[0_0_40px_rgba(184,134,11,0.4)] flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#B8860B]" />
              </div>
            </motion.div>
            
            {/* Ripple Effects */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-[#B8860B]"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[#B8860B]/50"
            />
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-3" 
            style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}
          >
            Thank You for Your Order!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-foreground/60 mb-8"
          >
            Your premium timepiece experience begins here. We've emailed your receipt to you.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-4 bg-card border border-white/10 px-6 py-3 rounded-xl mb-10"
          >
            <span className="text-foreground/70 text-sm">Order Number</span>
            <span className="text-[#B8860B] font-mono font-bold tracking-wider">{orderId}</span>
          </motion.div>

          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 text-left"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <Calendar className="w-5 h-5 text-[#B8860B]" />
              <span className="text-white font-medium">Estimated Delivery: <span className="text-[#B8860B]">{deliveryDate}</span></span>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-4 top-2 bottom-6 w-0.5 bg-white/10" />

              <div className="space-y-6">
                {TIMELINE_STEPS.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${step.done ? 'bg-[#B8860B] text-[#0C0F14] shadow-[0_0_15px_rgba(184,134,11,0.5)]' : 'bg-card border border-border text-foreground/60'}`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="mt-1">
                      <p className={`text-sm font-semibold ${step.done ? 'text-foreground' : 'text-foreground/70'}`}>{step.label}</p>
                      <p className="text-xs text-foreground/60 mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/account/orders"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 text-foreground hover:bg-white/5 hover:border-border font-medium tracking-wide transition-all sw-interactive"
            >
              View Order Details
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl sw-btn-gold font-medium tracking-wide transition-all group sw-interactive flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </SpotlightCard>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuccessContent />
    </Suspense>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, User } from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'

import { AdminLoginSchema } from '@/lib/validations/admin'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  duration: 10 + Math.random() * 20,
}))

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Client side Zod validation
    const result = AdminLoginSchema.safeParse({ username, password })
    if (!result.success) {
      setError(result.error.errors[0].message)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid admin credentials')
        setIsLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0F14] p-4 relative overflow-hidden">
      
      {/* ── BACKGROUND EFFECTS ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[150px] opacity-[0.15] bg-[#B8860B]" />
        
        {/* Floating Particles */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#B8860B]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              boxShadow: `0 0 ${p.size * 2}px #B8860B`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <SpotlightCard className="p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl bg-[#0F1923]/80">
          
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#B8860B] to-[#D4A017] p-0.5 shadow-[0_0_30px_rgba(184,134,11,0.3)]"
            >
              <div className="w-full h-full rounded-2xl bg-[#0C0F14] flex items-center justify-center">
                <svg viewBox="0 0 36 36" fill="none" width={32} height={32}>
                  <circle cx="18" cy="18" r="14.5" fill="none" stroke="#B8860B" strokeWidth="2"/>
                  <line x1="18" y1="18" x2="18" y2="11" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="18" x2="23" y2="18" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}
            >
              Command Center
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 text-sm tracking-widest uppercase"
            >
              Smartwear Admin
            </motion.p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium p-3 rounded-lg text-center tracking-wide uppercase"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-[#B8860B] transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-white/30 focus:border-[#B8860B] focus:bg-white/10 outline-none transition-all text-sm font-medium tracking-wide"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-[#B8860B] transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-white/30 focus:border-[#B8860B] focus:bg-white/10 outline-none transition-all text-sm font-medium tracking-wide"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl sw-btn-gold text-sm font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 group disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[#0C0F14]/20 border-t-[#0C0F14] animate-spin" />
                    Authenticating
                  </span>
                ) : (
                  <>
                    Access System
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] text-white/60 uppercase tracking-[0.2em]">Demo Access</p>
            <p className="text-[10px] text-[#B8860B] font-mono mt-1 tracking-wider">admin / smartwear123</p>
          </motion.div>
        </SpotlightCard>
      </motion.div>
    </div>
  )
}

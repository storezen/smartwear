"use client"

import { motion } from "framer-motion"

export function WatchLoader({ text = "Synchronizing..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-[#B8860B]/10 blur-[20px]" />
        
        {/* Outer Bezel */}
        <div className="absolute inset-0 rounded-full border-[2px] border-white/10" />
        <div className="absolute inset-[2px] rounded-full border border-[#B8860B]/30" />
        
        {/* Inner Dial */}
        <div className="absolute inset-[6px] rounded-full bg-background shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] border border-white/5" />

        {/* Dial Markings */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-full flex justify-center py-[8px]"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className={`w-[1px] ${i % 3 === 0 ? 'h-2 bg-[#B8860B]/60' : 'h-1.5 bg-card'}`} />
          </div>
        ))}

        {/* Minute Hand */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-full flex justify-center items-center"
        >
          <div className="w-[2px] h-[35%] bg-gradient-to-t from-white/40 to-white/90 rounded-full origin-bottom -translate-y-[50%]" />
        </motion.div>

        {/* Second Hand */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-full flex justify-center items-center"
        >
          <div className="w-[1px] h-[45%] bg-[#B8860B] rounded-full origin-bottom -translate-y-[50%] shadow-[0_0_8px_rgba(184,134,11,0.6)]" />
        </motion.div>

        {/* Center Pin */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#B8860B] border-[1.5px] border-background shadow-sm z-10" />
        
        {/* Subtle sweeping radar effect */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[6px] rounded-full overflow-hidden opacity-30 pointer-events-none"
          style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(184,134,11,0.2) 360deg)' }}
        />
      </div>

      {text && (
        <motion.div 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#B8860B]">{text}</span>
          <span className="text-[10px] text-foreground/40 tracking-wider">Premium Experience</span>
        </motion.div>
      )}
    </div>
  )
}

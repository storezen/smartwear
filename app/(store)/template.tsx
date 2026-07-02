"use client"

import { motion } from "framer-motion"

export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
      
      {/* Page Transition Loader */}
      <motion.div
        className="fixed inset-0 z-[9998] bg-background pointer-events-none flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#B8860B]" 
        />
      </motion.div>
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle } from "lucide-react"

const WA_NUMBER = "923001234567"
const WA_MESSAGE = "Hi! I'm interested in your smart watches. Can you help me?"

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY
      const docH = document.documentElement.scrollHeight
      const winH = window.innerHeight
      // Show after 200px, hide in last 300px near footer
      setVisible(scrollY > 200 && scrollY < docH - winH - 300)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed bottom-24 right-4 z-50 lg:bottom-8 lg:right-6"
        >
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="flex items-center gap-3 overflow-hidden rounded-full shadow-[0_8px_32px_rgba(37,211,102,0.35)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.5)] transition-shadow duration-300"
            aria-label="Chat on WhatsApp"
          >
            {/* Pulse ring */}
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500"
            />

            {/* Main button */}
            <motion.div
              animate={{ width: hovered ? "auto" : 52 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative flex items-center gap-0 bg-[#25D366] rounded-full h-[52px] min-w-[52px] px-0"
            >
              {/* Icon */}
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center">
                <MessageCircle className="size-6 text-white" strokeWidth={2} fill="white" />
              </div>

              {/* Label - only shown on hover */}
              <AnimatePresence>
                {hovered && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pr-4 text-sm font-bold text-white whitespace-nowrap overflow-hidden"
                  >
                    Chat with us
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

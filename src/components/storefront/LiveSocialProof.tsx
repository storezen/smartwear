"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, MapPin } from "lucide-react"

const LOCATIONS = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Gujranwala"]
const NAMES = ["Ali", "Ayesha", "Usman", "Fatima", "Bilal", "Zainab", "Hamza", "Hassan", "Ahmed", "Sarah", "Khadija", "Omer"]

export function LiveSocialProof() {
  const [notification, setNotification] = useState<{ name: string; location: string; action: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const triggerNotification = () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)]
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      const isPurchase = Math.random() > 0.3
      const action = isPurchase ? "just bought this!" : "added this to cart."

      setNotification({ name, location, action })

      // Hide after 5 seconds
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }

    // Initial delay before first popup
    const initialTimeout = setTimeout(triggerNotification, 12000)

    // Then random interval between 20-45 seconds
    const interval = setInterval(() => {
      triggerNotification()
    }, Math.floor(Math.random() * 25000) + 20000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-24 left-4 z-50 lg:bottom-6 lg:left-6 flex items-center gap-3 bg-white border border-neutral-200/60 p-3 pr-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] pointer-events-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-neutral-900">
              {notification.name} <span className="font-normal text-neutral-500">{notification.action}</span>
            </p>
            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> from {notification.location}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

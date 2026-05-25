"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, Flame, Timer, TrendingUp } from "lucide-react"

export function LiveViewingCounter() {
  const [viewers, setViewers] = useState(14)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      // Fluctuate between 12 and 35
      setViewers((prev) => {
        const change = Math.floor(Math.random() * 5) - 2
        let next = prev + change
        if (next < 12) next = 12
        if (next > 35) next = 35
        return next
      })
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2 text-sm text-red-600">
      <Flame className="size-4 animate-pulse fill-red-500 text-red-500" />
      <span className="font-medium">
        <strong className="font-bold">{viewers}</strong> people are viewing this right now
      </span>
    </div>
  )
}

export function DispatchTimer() {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      // Assume dispatch cutoff is 4 PM local time
      const cutoff = new Date(now)
      cutoff.setHours(16, 0, 0, 0)

      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1)
      }

      const diff = cutoff.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours === 0 && minutes < 60) {
        setTimeLeft(`${minutes} mins`)
      } else {
        setTimeLeft(`${hours} hrs ${minutes} mins`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // update every minute
    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-sm text-amber-700">
      <Timer className="size-4" strokeWidth={2.5} />
      <span className="font-medium">
        Order in <strong className="font-bold text-amber-800">{timeLeft}</strong> for tomorrow dispatch
      </span>
    </div>
  )
}

export function UrgencyTriggers() {
  return (
    <div className="flex flex-col gap-2 my-4">
      <LiveViewingCounter />
      <DispatchTimer />
    </div>
  )
}

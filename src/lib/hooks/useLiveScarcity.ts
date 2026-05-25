"use client"

import { useEffect, useState, useRef } from "react"

interface ScarcityData {
  stockLeft: number
  viewers: number
  city: string
  lastUpdated: number
}

const PAKISTANI_CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
]

// Deterministic seed from productId for stable initial values
function seededRand(seed: string, offset: number = 0): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs((hash + offset) % 1000) / 1000
}

function getInitialData(productId: string): ScarcityData {
  const r1 = seededRand(productId, 1)
  const r2 = seededRand(productId, 2)
  const r3 = seededRand(productId, 3)

  return {
    stockLeft: Math.floor(r1 * 8) + 2,        // 2–9 units
    viewers: Math.floor(r2 * 18) + 4,          // 4–21 viewers
    city: PAKISTANI_CITIES[Math.floor(r3 * PAKISTANI_CITIES.length)],
    lastUpdated: Date.now(),
  }
}

export function useLiveScarcity(productId: string) {
  const [data, setData] = useState<ScarcityData>(() => getInitialData(productId))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Fluctuate every 8–15 seconds to simulate live feed
    const scheduleUpdate = () => {
      const delay = 8000 + Math.random() * 7000
      intervalRef.current = setTimeout(() => {
        setData(prev => {
          const deltaStock = Math.random() < 0.3 ? -1 : 0      // 30% chance stock drops
          const deltaViewers = Math.round((Math.random() - 0.4) * 4) // -1 to +2

          const newStock = Math.max(1, Math.min(15, prev.stockLeft + deltaStock))
          const newViewers = Math.max(2, Math.min(30, prev.viewers + deltaViewers))
          const newCity = Math.random() < 0.2
            ? PAKISTANI_CITIES[Math.floor(Math.random() * PAKISTANI_CITIES.length)]
            : prev.city

          return {
            stockLeft: newStock,
            viewers: newViewers,
            city: newCity,
            lastUpdated: Date.now(),
          }
        })
        scheduleUpdate()
      }, delay)
    }

    scheduleUpdate()
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [productId])

  const isLowStock = data.stockLeft <= 5
  const isCriticalStock = data.stockLeft <= 2

  return {
    stockLeft: data.stockLeft,
    viewers: data.viewers,
    city: data.city,
    isLowStock,
    isCriticalStock,
  }
}

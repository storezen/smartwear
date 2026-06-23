"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const names = [
  "Hamza", "Ali Raza", "Ahmed", "Bilal", "Usman", "Hassan", "Tariq",
  "Kamran", "Fahad", "Imran", "Rizwan", "Naveed", "Shahid", "Waqas",
  "Farhan", "Adeel", "Zain", "Saad", "Junaid", "Salman", "Omar",
  "Daniyal", "Adnan", "Faisal", "Waleed", "Mohsin",
]

const cities = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Sargodha", "Bahawalpur", "Sukkur", "Hyderabad", "Gujrat",
]

export function PurchaseNotification({ productName }: { productName: string }) {
  const [items, setItems] = useState<Array<{ id: number; name: string; city: string; time: string }>>([])

  const addItem = useCallback(() => {
    const name = names[Math.floor(Math.random() * names.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const minutes = Math.floor(Math.random() * 6) + 1
    const time = minutes === 1 ? "1 min ago" : `${minutes} mins ago`
    setItems((prev) => [...prev.slice(-2), { id: Date.now(), name, city, time }])
  }, [])

  useEffect(() => {
    const first = setTimeout(addItem, 4000)
    const interval = setInterval(addItem, 9000 + Math.random() * 8000)
    return () => { clearTimeout(first); clearInterval(interval) }
  }, [addItem])

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 max-w-[300px] pointer-events-none">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onAnimationComplete={() => setTimeout(() => removeItem(item.id), 6000)}
            className="pointer-events-auto bg-gradient-to-br from-[#0C0F14] to-[#141820] border border-[#B8860B]/25 rounded-xl p-3.5 shadow-[0_8px_32px_rgba(184,134,11,0.15)] flex items-center gap-3"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] flex items-center justify-center text-[11px] font-bold text-[#0C0F14]">
                {item.name.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0C0F14] rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs leading-tight">
                <span className="font-bold text-[#D4A017]">{item.name}</span>
                <span className="text-white/60 font-normal"> purchased</span>
              </p>
              <p className="text-white/80 text-xs font-medium truncate leading-tight mt-0.5">
                {productName}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {item.time} &middot; {item.city}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

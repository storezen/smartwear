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
    const interval = setInterval(addItem, 8000 + Math.random() * 7000)
    return () => { clearTimeout(first); clearInterval(interval) }
  }, [addItem])

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="fixed top-20 left-4 z-[60] flex flex-col gap-2 max-w-[280px] pointer-events-none">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            onAnimationComplete={() => setTimeout(() => removeItem(item.id), 5000)}
            className="pointer-events-auto bg-[#0C0F14] border border-white/8 rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-full bg-[#B8860B]/20 flex items-center justify-center text-[10px] font-bold text-[#B8860B] shrink-0">
              {item.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs leading-tight">
                <span className="font-semibold text-[#D4A017]">{item.name}</span>
                <span className="text-white/50 font-normal"> purchased</span>
              </p>
              <p className="text-white/70 text-[11px] truncate leading-tight mt-0.5">
                {productName}
              </p>
              <p className="text-[10px] text-white/35 mt-0.5">{item.time} &middot; {item.city}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

"use client"

import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useSettings } from "@/lib/use-settings"

export function WhatsAppButton() {
  const { settings, loading } = useSettings()

  if (loading || !settings) return null

  const number = settings.whatsapp_number || "923001234567"
  const message = settings.whatsapp_message || "Hi Smartwear! I need help with my order."

  return (
    <motion.a
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 300 }}
      href={`https://wa.me/${number}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-[0_8px_32px_rgba(16,185,129,0.4)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] hover:scale-105 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-white text-transparent" />
      <span className="text-xs font-bold hidden sm:block">Chat with Us</span>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
    </motion.a>
  )
}

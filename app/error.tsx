"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "923001234567"
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Smartwear!%20I%20encountered%20an%20error%20on%20your%20website.%20Please%20help.`

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-5">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-2">
            Something Went Wrong
          </h1>
          <p className="text-foreground/60 text-base mb-8">
            An unexpected error occurred. Our team has been notified.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
        >
          <button
            onClick={reset}
            className="sw-btn-gold w-full sm:w-auto px-6 h-12"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="sw-btn-outline w-full sm:w-auto px-6 h-12"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 border-t border-border"
        >
          <p className="text-xs text-foreground/40 mb-3">
            Need immediate help?
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-[#25D366] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  )
}

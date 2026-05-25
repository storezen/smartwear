"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10"
        >
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </motion.div>
        <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred. Our team has been notified. Please try again or return to the homepage.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} className="w-full sm:w-auto gap-2 rounded-full h-11 px-6">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto gap-2 rounded-full h-11 px-6">
              <Home className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

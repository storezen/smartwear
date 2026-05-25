"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageMeta } from "@/components/PageMeta"

export default function NotFound() {
  return (
    <>
      <PageMeta title="Page Not Found" description="The page you're looking for doesn't exist." noindex ogImage="/og-default.jpg" />
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
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted"
          >
            <span className="text-4xl font-bold text-muted-foreground/40">404</span>
          </motion.div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Page not found</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or the link might be incorrect.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button className="w-full sm:w-auto gap-2 rounded-full h-11 px-6">
                <Home className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto gap-2 rounded-full h-11 px-6">
                <ArrowLeft className="h-4 w-4" /> Browse Products
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}

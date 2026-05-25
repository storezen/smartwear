"use client"

import { motion } from "framer-motion"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted"
      >
        <Icon className="h-7 w-7 text-muted-foreground/50" />
      </motion.div>
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="outline" className="rounded-full h-10 px-5 gap-2">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button onClick={onAction} variant="outline" className="rounded-full h-10 px-5 gap-2">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

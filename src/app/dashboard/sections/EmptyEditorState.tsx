"use client"

import { motion } from "framer-motion"
import { Layout, ArrowLeft } from "lucide-react"

export function EmptyEditorState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full flex-col items-center justify-center py-20 px-6"
    >
      <div className="relative mb-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
          <Layout className="size-7 text-primary/60" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-card">
          <ArrowLeft className="size-3" />
        </div>
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-foreground">No section selected</h3>
      <p className="mb-4 max-w-[240px] text-center text-xs text-muted-foreground leading-relaxed">
        Choose a section from the sidebar to edit its content, design, and visibility settings.
      </p>
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-[10px] text-muted-foreground">
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">Ctrl+S</kbd>
        <span>to save</span>
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">Ctrl+Z</kbd>
        <span>to undo</span>
      </div>
    </motion.div>
  )
}

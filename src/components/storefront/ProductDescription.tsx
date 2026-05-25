"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductDescriptionProps {
  content: string
  className?: string
}

export function ProductDescription({ content, className }: ProductDescriptionProps) {
  const [expanded, setExpanded] = useState(false)
  const long = content.length > 400

  if (!content) return null

  function truncateAtSentence(text: string): string {
    const truncated = text.slice(0, 400)
    const lastPeriod = truncated.lastIndexOf(".")
    const lastQuestion = truncated.lastIndexOf("?")
    const lastExclamation = truncated.lastIndexOf("!")
    const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation)
    if (lastSentenceEnd > 200) {
      return text.slice(0, lastSentenceEnd + 1)
    }
    return text.slice(0, 400)
  }

  const displayContent = !expanded && long ? truncateAtSentence(content) : content

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
          Description
        </h3>
        <div className="h-px w-8 bg-accent/40" />
      </div>
      <motion.div
        initial={false}
        animate={{ height: expanded || !long ? "auto" : "auto" }}
        className="overflow-hidden"
      >
        <div
          className={cn(
            "prose prose-sm prose-gray max-w-none",
            "prose-headings:text-foreground prose-headings:font-semibold",
            "prose-p:text-muted-foreground prose-p:leading-relaxed",
            "prose-li:text-muted-foreground",
            "prose-strong:text-foreground",
            "prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground",
            "text-sm leading-relaxed text-muted-foreground"
          )}
        >
          <div
            dangerouslySetInnerHTML={{ __html: displayContent }}
            className={!expanded && long
              ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-12 after:bg-gradient-to-t after:from-background after:to-transparent relative overflow-hidden"
              : ""
            }
          />
        </div>
      </motion.div>
      {long && (
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          whileTap={{ scale: 0.97 }}
        >
          {expanded ? "Show less" : "Read more"}
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </motion.button>
      )}
    </div>
  )
}

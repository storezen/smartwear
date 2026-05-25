"use client"

import { motion } from "framer-motion"
import { Loader2, CheckCircle, XCircle, SkipForward } from "lucide-react"

interface ImportProgressProps {
  current: number
  total: number
  currentProduct: string
  imported: number
  failed: number
  skipped: number
  isComplete: boolean
  hasError: boolean
}

export function ImportProgress({
  current,
  total,
  currentProduct,
  imported,
  failed,
  skipped,
  isComplete,
  hasError,
}: ImportProgressProps) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0

  if (isComplete) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="size-7 text-emerald-600" />
          </div>
          <p className="text-base font-semibold text-[#0F172A]">Import Complete</p>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="size-4 text-emerald-500" /> {imported} Imported
            </span>
            {skipped > 0 && (
              <span className="flex items-center gap-1.5">
                <SkipForward className="size-4 text-amber-500" /> {skipped} Skipped
              </span>
            )}
            {failed > 0 && (
              <span className="flex items-center gap-1.5">
                <XCircle className="size-4 text-red-500" /> {failed} Failed
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-[#2563EB]" />
          <span className="text-sm font-medium text-[#0F172A]">Importing products...</span>
        </div>
        <span className="text-xs font-medium text-[#64748B]">
          {current} of {total}
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED]"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[#64748B]">
        <span className="truncate max-w-[200px]">Currently: {currentProduct}</span>
        <span>{progress}%</span>
      </div>

      <div className="flex gap-4 text-xs">
        <span className="text-emerald-600 font-medium">{imported} imported</span>
        {skipped > 0 && <span className="text-amber-600 font-medium">{skipped} skipped</span>}
        {failed > 0 && <span className="text-red-600 font-medium">{failed} failed</span>}
      </div>
    </div>
  )
}

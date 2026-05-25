"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination({
  page,
  totalPages,
  totalItems,
  label = "item",
  onPageChange,
}: {
  page: number
  totalPages: number
  totalItems: number
  label?: string
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-neutral-200/60 px-6 py-4 bg-neutral-50/50">
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
        {totalItems} {label}{totalItems !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-8 w-8 p-0 rounded-full border-neutral-200/60 shadow-sm text-neutral-700">
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="h-8 w-8 p-0 rounded-full border-neutral-200/60 shadow-sm text-neutral-700">
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  function getPages(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = []
    const delta = 1
    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    pages.push(1)
    if (left > 2) pages.push("ellipsis")
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push("ellipsis")
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {getPages().map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground/50">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

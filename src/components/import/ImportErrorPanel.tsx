"use client"

import { useState } from "react"
import { AlertTriangle, XCircle, ChevronDown, ChevronRight, Download } from "lucide-react"
import type { ImportError, ImportWarning } from "@/lib/import/types"

interface ImportErrorPanelProps {
  errors: ImportError[]
  warnings: ImportWarning[]
}

export function ImportErrorPanel({ errors, warnings }: ImportErrorPanelProps) {
  const [expanded, setExpanded] = useState(true)

  function downloadErrorReport() {
    const rows = [
      ["Type", "Row", "Handle", "Field", "Message"],
      ...errors.map((e) => ["Error", String(e.row), e.handle, e.field, e.message]),
      ...warnings.map((w) => ["Warning", String(w.row), w.handle, w.field, w.message]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "import-error-report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (errors.length === 0 && warnings.length === 0) return null

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
      >
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        {errors.length > 0 ? (
          <XCircle className="size-4 text-red-500" />
        ) : (
          <AlertTriangle className="size-4 text-amber-500" />
        )}
        <span>
          {errors.length > 0
            ? `${errors.length} error${errors.length !== 1 ? "s" : ""}`
            : `${warnings.length} warning${warnings.length !== 1 ? "s" : ""}`}
        </span>
        <span className="text-xs text-[#64748B] font-normal">
          {errors.length > 0 && warnings.length > 0 && `(${warnings.length} warnings)`}
        </span>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); downloadErrorReport() }}
          className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-700"
        >
          <Download className="size-3" /> Download Report
        </button>
      </button>

      {expanded && (
        <div className="border-t border-[#E2E8F0] max-h-48 overflow-y-auto">
          {errors.map((err, i) => (
            <div key={`e-${i}`} className="flex items-start gap-2 px-4 py-2 border-b border-[#E2E8F0]/50 last:border-0 bg-red-50/30">
              <XCircle className="size-3.5 shrink-0 mt-0.5 text-red-500" />
              <div className="text-xs">
                <span className="font-medium text-red-700">Row {err.row}:</span>{" "}
                <span className="text-red-600">{err.message}</span>
                <span className="text-[#94A3B8]"> ({err.field})</span>
              </div>
            </div>
          ))}
          {warnings.map((wrn, i) => (
            <div key={`w-${i}`} className="flex items-start gap-2 px-4 py-2 border-b border-[#E2E8F0]/50 last:border-0">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-amber-500" />
              <div className="text-xs">
                <span className="font-medium text-amber-700">Row {wrn.row}:</span>{" "}
                <span className="text-amber-600">{wrn.message}</span>
                <span className="text-[#94A3B8]"> ({wrn.field})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

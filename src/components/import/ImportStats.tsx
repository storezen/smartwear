"use client"

import { FileText, Package, GitBranch, Image, Tags, AlertTriangle, XCircle } from "lucide-react"
import type { ImportSummary } from "@/lib/import/types"

interface ImportStatsProps {
  summary: ImportSummary
}

export function ImportStats({ summary }: ImportStatsProps) {
  const stats = [
    { icon: FileText, label: "CSV Rows", value: summary.totalCsvRows, color: "text-[#64748B]" },
    { icon: Package, label: "Products", value: summary.totalProducts, color: "text-[#2563EB]" },
    { icon: GitBranch, label: "Variants", value: summary.totalVariants, color: "text-[#7C3AED]" },
    { icon: Image, label: "Images", value: summary.totalImages, color: "text-[#059669]" },
    { icon: Tags, label: "Categories", value: summary.categoriesToCreate.length, color: "text-[#D97706]" },
    { icon: AlertTriangle, label: "Warnings", value: summary.warnings.length, color: "text-[#D97706]" },
    { icon: XCircle, label: "Errors", value: summary.errors.length, color: "text-[#DC2626]" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-center gap-2">
              <Icon className={`size-4 ${s.color}`} />
              <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`mt-2 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        )
      })}
    </div>
  )
}

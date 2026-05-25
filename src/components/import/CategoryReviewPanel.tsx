"use client"

import { useState } from "react"
import { Tags, ChevronDown, ChevronRight, Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductCategory } from "@/lib/categories-context"

interface CategoryReviewPanelProps {
  existing: ProductCategory[]
  newCategories: { name: string; slug: string }[]
  onApprove: (categories: { name: string; slug: string }[]) => void
}

export function CategoryReviewPanel({ existing, newCategories, onApprove }: CategoryReviewPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [editable, setEditable] = useState(newCategories.map((c) => ({ ...c })))

  if (newCategories.length === 0) return null

  function updateName(i: number, name: string) {
    const next = [...editable]
    next[i] = { ...next[i], name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }
    setEditable(next)
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
      >
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <Tags className="size-4 text-[#D97706]" />
        <span>Categories to Create ({editable.length})</span>
      </button>

      {expanded && (
        <div className="border-t border-[#E2E8F0] p-4 space-y-3">
          {existing.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-2">Existing Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {existing.map((c) => (
                  <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[11px] text-[#64748B] border border-[#E2E8F0]">
                    <Check className="size-2.5 text-emerald-500" /> {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-2">New Categories</p>
            <div className="space-y-2">
              {editable.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0]/60 bg-[#FFFBEB] p-2.5">
                  <Plus className="size-3.5 text-[#D97706] shrink-0" />
                  <input
                    value={c.name}
                    onChange={(e) => updateName(i, e.target.value)}
                    className="flex-1 rounded border-0 bg-transparent px-0 py-0 text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-0"
                  />
                  <span className="text-[10px] font-mono text-[#94A3B8]">/{c.slug}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => onApprove(editable)}>
              <Check className="size-3.5" /> Approve Categories
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

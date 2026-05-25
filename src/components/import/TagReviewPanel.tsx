"use client"

import { useState } from "react"
import { Hash, X, ChevronDown, ChevronRight } from "lucide-react"
import type { ParsedProduct } from "@/lib/import/types"

interface TagReviewPanelProps {
  products: ParsedProduct[]
  onUpdateTags: (handle: string, tags: string[]) => void
}

export function TagReviewPanel({ products, onUpdateTags }: TagReviewPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [editingHandle, setEditingHandle] = useState<string | null>(null)
  const [editTags, setEditTags] = useState("")

  const uniqueTags = new Set<string>()
  products.forEach((p) => p.tags.forEach((t) => uniqueTags.add(t)))
  const tagCounts = new Map<string, number>()
  products.forEach((p) => p.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)))

  function startEdit(product: ParsedProduct) {
    setEditingHandle(product.handle)
    setEditTags(product.tags.join(", "))
  }

  function saveTags(handle: string) {
    const tags = editTags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-"))
      .filter(Boolean)
    onUpdateTags(handle, tags)
    setEditingHandle(null)
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
      >
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <Hash className="size-4 text-[#7C3AED]" />
        <span>Tags Summary ({uniqueTags.size} unique)</span>
      </button>

      {expanded && (
        <div className="border-t border-[#E2E8F0] p-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {Array.from(uniqueTags).sort().map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-medium text-[#7C3AED] border border-[#E2D4F0]"
              >
                {tag}
                <span className="text-[10px] text-[#A855F7]">({tagCounts.get(tag)})</span>
              </span>
            ))}
          </div>

          {products.filter((p) => p.tags.length > 0).length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-[#64748B] uppercase tracking-wider mb-2">Edit Product Tags</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {products.filter((p) => p.tags.length > 0).slice(0, 20).map((p) => (
                  <div key={p.handle} className="flex items-start gap-2 rounded-lg border border-[#E2E8F0]/60 p-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#0F172A] truncate">{p.title}</p>
                      {editingHandle === p.handle ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            value={editTags}
                            onChange={(e) => setEditTags(e.target.value)}
                            className="flex-1 rounded border border-[#E2E8F0] px-2 py-1 text-[11px] focus:border-blue-500 focus:outline-none"
                            placeholder="tag1, tag2, tag3"
                          />
                          <button onClick={() => saveTags(p.handle)} className="rounded bg-[#2563EB] px-2 py-1 text-[10px] font-medium text-white">Save</button>
                          <button onClick={() => setEditingHandle(null)} className="text-[10px] text-[#64748B]">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.slice(0, 6).map((t) => (
                            <span key={t} className="text-[10px] bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#64748B]">{t}</span>
                          ))}
                          {p.tags.length > 6 && <span className="text-[10px] text-[#94A3B8]">+{p.tags.length - 6}</span>}
                        </div>
                      )}
                    </div>
                    {editingHandle !== p.handle && (
                      <button onClick={() => startEdit(p)} className="shrink-0 text-[10px] text-[#2563EB] hover:text-blue-700 font-medium">Edit</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

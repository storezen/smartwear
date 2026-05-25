"use client"

import { useState } from "react"
import { Package, AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ParsedProduct } from "@/lib/import/types"
import { formatPrice } from "@/lib/products"

interface ImportPreviewTableProps {
  products: ParsedProduct[]
  errors: Map<string, string[]>
  warnings: Map<string, string[]>
}

export function ImportPreviewTable({ products, errors, warnings }: ImportPreviewTableProps) {
  const [page, setPage] = useState(1)
  const perPage = 10
  const totalPages = Math.max(1, Math.ceil(products.length / perPage))
  const paginated = products.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-xs font-medium text-[#64748B]">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium">Variants</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Inventory</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => {
              const productErrors = errors.get(p.handle) || []
              const productWarnings = warnings.get(p.handle) || []
              const prices = [p.price, ...p.variants.map((v) => v.price)].filter(Boolean)
              const minPrice = Math.min(...prices)
              const maxPrice = Math.max(...prices)
              const totalInventory = p.inventory + p.variants.reduce((s, v) => s + v.inventory, 0)
              const hasErrors = productErrors.length > 0

              return (
                <tr
                  key={p.handle}
                  className={cn(
                    "border-b border-[#E2E8F0] last:border-0 transition-colors",
                    hasErrors ? "bg-red-50/50" : "hover:bg-[#F8FAFC]",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="size-10 rounded-lg object-cover" loading="lazy" />
                      ) : (
                        <div className="size-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                          <Package className="size-4 text-[#94A3B8]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate max-w-[200px]">{p.title || "Untitled"}</p>
                        {p.handle && <p className="text-[10px] font-mono text-[#94A3B8] truncate max-w-[200px]">/{p.handle}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#64748B]">
                      {p.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {p.tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-[10px] bg-[#F3E8FF] px-1.5 py-0.5 rounded text-[#7C3AED]">{t}</span>
                      ))}
                      {p.tags.length > 4 && <span className="text-[10px] text-[#94A3B8]">+{p.tags.length - 4}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {p.variants.length > 1 ? (
                      <span className="font-medium text-[#0F172A]">{p.variants.length}</span>
                    ) : (
                      "1"
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#0F172A]">
                    {minPrice > 0 ? (
                      <>
                        {formatPrice(minPrice)}
                        {maxPrice > minPrice && <span className="text-[#94A3B8]"> – {formatPrice(maxPrice)}</span>}
                      </>
                    ) : (
                      <span className="text-red-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">{totalInventory}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {hasErrors ? (
                        <span title={productErrors.join("; ")}>
                          <XCircle className="size-4 text-red-500" />
                        </span>
                      ) : productWarnings.length > 0 ? (
                        <span title={productWarnings.join("; ")}>
                          <AlertTriangle className="size-4 text-amber-500" />
                        </span>
                      ) : (
                        <CheckCircle className="size-4 text-emerald-500" />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3">
          <p className="text-xs text-[#64748B]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

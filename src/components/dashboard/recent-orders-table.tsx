"use client"

import { useState } from "react"
import { useOrders } from "@/lib/orders-context"
import { StatusBadge } from "./status-badge"
import { hashId } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const PAGE_SIZE = 5

function getStatus(id: string): string {
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const
  return statuses[hashId(id) % statuses.length]
}

function getPayment(id: string): string {
  return hashId(id + "p") % 3 !== 0 ? "COD" : "Card"
}

function getRandomAmount(basePrice: number, qty: number): number {
  return basePrice * qty
}

export function RecentOrdersTable() {
  const { orders } = useOrders()
  const [page, setPage] = useState(1)

  const enriched = orders.map((o) => ({
    ...o,
    displayStatus: getStatus(o.id),
    payment: getPayment(o.id),
  }))

  const totalPages = Math.max(1, Math.ceil(enriched.length / PAGE_SIZE))
  const paginated = enriched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (enriched.length === 0) {
    return (
      <div className="rounded-[24px] bg-white border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="border-b border-neutral-200/60 px-6 py-5">
          <h3 className="font-heading text-lg font-bold text-neutral-900">Recent Orders</h3>
          <p className="text-sm font-medium text-neutral-500 mt-1">Latest customer orders</p>
        </div>
        <div className="p-10 text-center text-sm font-medium text-neutral-500">No orders yet. Orders will appear here once customers checkout.</div>
      </div>
    )
  }

  return (
    <div className="rounded-[24px] bg-white border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200/60 px-6 py-5">
        <div>
          <h3 className="font-heading text-lg font-bold text-neutral-900">Recent Orders</h3>
          <p className="text-sm font-medium text-neutral-500 mt-1">Latest customer orders</p>
        </div>
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm" className="text-xs font-bold text-neutral-700 hover:text-neutral-900 rounded-full">View All</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => (
              <tr key={o.id} className="border-b border-neutral-200/60 last:border-0 hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-neutral-900">{o.id}</td>
                <td className="px-6 py-4 font-medium text-neutral-700">{o.customerName}</td>
                <td className="px-6 py-4 font-medium text-neutral-700 max-w-[140px] truncate">{o.productName}</td>
                <td className="px-6 py-4 font-bold text-neutral-900">Rs. {o.total.toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-neutral-700">{o.payment}</td>
                <td className="px-6 py-4"><StatusBadge status={o.displayStatus} /></td>
                <td className="px-6 py-4 font-medium text-neutral-500 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleDateString("en-PK")}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/dashboard/orders`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-neutral-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200/60 px-6 py-4 bg-neutral-50/50">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 w-8 p-0 rounded-full border-neutral-200/60 shadow-sm text-neutral-700">
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 w-8 p-0 rounded-full border-neutral-200/60 shadow-sm text-neutral-700">
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

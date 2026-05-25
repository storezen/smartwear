"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { MessageSquare, Star } from "lucide-react"

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Reviews" description="Product reviews from customers." />

      <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-neutral-50 border border-neutral-200/60">
            <MessageSquare className="h-10 w-10 text-neutral-400" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-neutral-900">No Reviews Yet</h3>
          <p className="mb-8 max-w-md text-sm font-medium leading-relaxed text-neutral-500">
            Customer reviews are not yet available. A review system will be added in a future
            update where customers can rate and review products after purchase.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-neutral-300" strokeWidth={2} />
              Star ratings
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-neutral-300" strokeWidth={2} />
              Written reviews
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-neutral-300" strokeWidth={2} />
              Photo & video
            </div>
          </div>
          <div className="mt-8 h-px w-32 bg-neutral-200/60" />
          <p className="mt-6 text-xs font-medium text-neutral-400">
            Reviews will appear here once customers submit them.
          </p>
        </div>
      </div>
    </div>
  )
}

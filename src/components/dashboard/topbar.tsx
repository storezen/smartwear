"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/orders?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-neutral-200/60 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
      <form onSubmit={handleSearch} className="relative hidden flex-1 sm:block md:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search orders, products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-full border border-neutral-200/60 bg-neutral-50/50 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
        />
      </form>

      <div className="flex items-center gap-4 ml-auto">
        <Link href="/dashboard/products">
          <button className="hidden h-10 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] sm:flex items-center justify-center text-sm px-5 gap-2 shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} /> Add Product
          </button>
        </Link>

        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 border border-neutral-200/60 text-xs font-bold text-neutral-900">
            S
          </div>
          <span className="hidden text-sm font-semibold text-neutral-900 md:block">Admin</span>
        </div>
      </div>
    </header>
  )
}

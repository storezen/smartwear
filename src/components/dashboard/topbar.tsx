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
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <form onSubmit={handleSearch} className="relative hidden flex-1 sm:block md:max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search orders, products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring/30 focus:bg-background focus:outline-none focus:ring-4 focus:ring-ring/10 transition-all shadow-inner"
        />
      </form>

      <div className="flex items-center gap-4 ml-auto">
        <Link href="/dashboard/products">
          <Button className="hidden h-10 rounded-full transition-all duration-200 active:scale-[0.98] sm:flex items-center justify-center text-sm px-5 gap-2 shadow-sm">
            <Plus className="h-4 w-4" strokeWidth={2} /> Add Product
          </Button>
        </Link>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border border-border text-xs font-bold text-foreground">
            S
          </div>
          <span className="hidden text-sm font-semibold text-foreground md:block">Admin</span>
        </div>
      </div>
    </header>
  )
}

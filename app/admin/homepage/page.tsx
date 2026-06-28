"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Search, X, Save, CheckCircle2, Eye, EyeOff, ArrowUpDown } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { toast } from "sonner"

const SECTIONS = [
  { key: "bestsellers", label: "Bestsellers", limit: 8 },
  { key: "new-arrivals", label: "New Arrivals", limit: 8 },
  { key: "pro-series", label: "Pro Series (Smart Watches)", limit: 4 },
  { key: "classic-series", label: "Classic Series (Analog)", limit: 4 },
  { key: "sport-series", label: "Sport Series (Ladies)", limit: 4 },
  { key: "accessories", label: "Essential Accessories", limit: 4 },
  { key: "smart-watches", label: "Showcase: Smart Watches", limit: 4 },
  { key: "analog-watches", label: "Showcase: Analog Watches", limit: 4 },
  { key: "ladies-watches", label: "Showcase: Ladies Watches", limit: 4 },
  { key: "phone-cases", label: "Showcase: Phone Cases", limit: 4 },
  { key: "watch-bands", label: "Showcase: Watch Bands", limit: 4 },
  { key: "audio", label: "Showcase: Audio", limit: 4 },
  { key: "chargers", label: "Showcase: Chargers", limit: 4 },
]

export default function AdminHomepagePage() {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [picks, setPicks] = useState<Record<string, string[]>>({})
  const [search, setSearch] = useState("")
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, settingsRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/admin/settings"),
        ])
        const products = await prodRes.json()
        const settings = await settingsRes.json()
        if (Array.isArray(products)) setAllProducts(products)
        if (settings.homepage_picks) {
          try {
            const parsed = typeof settings.homepage_picks === "string"
              ? JSON.parse(settings.homepage_picks)
              : settings.homepage_picks
            setPicks(parsed)
          } catch {}
        }
      } catch (e) {
        console.error("Failed to load data", e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const currentSection = SECTIONS.find(s => s.key === activeSection)!

  const filtered = useMemo(() => {
    if (!search.trim()) return allProducts
    const q = search.toLowerCase()
    return allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category_slug?.toLowerCase().includes(q)
    )
  }, [allProducts, search])

  const toggleProduct = useCallback((productId: string) => {
    setPicks(prev => {
      const current = prev[activeSection] || []
      const next = current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId]
      return { ...prev, [activeSection]: next }
    })
  }, [activeSection])

  const moveProduct = useCallback((productId: string, direction: -1 | 1) => {
    setPicks(prev => {
      const list = [...(prev[activeSection] || [])]
      const idx = list.indexOf(productId)
      if (idx === -1) return prev
      const target = idx + direction
      if (target < 0 || target >= list.length) return prev
      ;[list[idx], list[target]] = [list[target], list[idx]]
      return { ...prev, [activeSection]: list }
    })
  }, [activeSection])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepage_picks: JSON.stringify(picks) }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Homepage picks saved!")
    } catch {
      toast.error("Failed to save homepage picks")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Homepage Product Picks</h1>
          <p className="text-white/50 text-sm mt-1">Choose which products appear in each section. Leave empty for auto-picks.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="sw-btn-gold px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center gap-2"
        >
          {saving ? (
            <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => { setActiveSection(s.key); setSearch("") }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeSection === s.key
                ? "bg-[#B8860B] text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {s.label}
            {picks[s.key]?.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#B8860B]/20 text-[#B8860B] text-[10px]">{picks[s.key].length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SpotlightCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">
              Selected — <span className="text-[#B8860B]">{currentSection.label}</span>
            </h2>
            {picks[currentSection.key]?.length > 0 && (
              <button
                onClick={() => setPicks(prev => ({ ...prev, [activeSection]: [] }))}
                className="text-white/40 hover:text-red-400 text-xs transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          {(!picks[currentSection.key] || picks[currentSection.key].length === 0) ? (
            <p className="text-white/30 text-sm py-8 text-center">No picks — auto algorithm will be used</p>
          ) : (
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {picks[currentSection.key].map((pid, i) => {
                const prod = allProducts.find(p => p.id === pid || p.slug === pid)
                return (
                  <div key={pid} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 group">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveProduct(pid, -1)} className="text-white/20 hover:text-white/60 transition-colors"><ArrowUpDown className="w-3 h-3 rotate-90" /></button>
                      <button onClick={() => moveProduct(pid, 1)} className="text-white/20 hover:text-white/60 transition-colors"><ArrowUpDown className="w-3 h-3 -rotate-90" /></button>
                    </div>
                    {prod?.images?.[0] && (
                      <img src={prod.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{prod?.name || pid}</p>
                      <p className="text-white/40 text-[10px]">{prod?.category_slug || ""} · Rs.{prod?.price?.toLocaleString() || ""}</p>
                    </div>
                    <button onClick={() => toggleProduct(pid)} className="text-white/30 hover:text-red-400 transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          <p className="text-white/30 text-[10px] mt-3">
            Picked: {picks[currentSection.key]?.length || 0}/{currentSection.limit} max
          </p>
        </SpotlightCard>

        <SpotlightCard className="p-5">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products by name, brand, or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#B8860B] transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-white/30 text-sm py-8 text-center">No products found</p>
            ) : (
              filtered.map(prod => {
                const isPicked = picks[activeSection]?.includes(prod.id) || picks[activeSection]?.includes(prod.slug)
                return (
                  <button
                    key={prod.id}
                    onClick={() => toggleProduct(prod.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                      isPicked ? "bg-[#B8860B]/10 border border-[#B8860B]/30" : "bg-white/[0.02] border border-transparent hover:bg-white/5"
                    }`}
                  >
                    {prod.images?.[0] && (
                      <img src={prod.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{prod.name}</p>
                      <p className="text-white/40 text-[10px]">{prod.brand} · {prod.category_slug} · Rs.{prod.price?.toLocaleString()}</p>
                    </div>
                    {isPicked && <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </SpotlightCard>
      </div>
    </div>
  )
}

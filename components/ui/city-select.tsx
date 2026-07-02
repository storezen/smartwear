"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { getCitiesByProvince, getPostexCoverageStyle, isPostexServiceable } from "@/lib/address-validator"
import { Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CitySelectProps {
  value: string
  onChange: (city: string) => void
  showCoverage?: boolean
  className?: string
}

export function CitySelect({ value, onChange, showCoverage = true, className = "" }: CitySelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  const grouped = getCitiesByProvince()

  const filtered = Object.entries(grouped).map(([province, cities]) => ({
    province,
    cities: cities.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.cities.length > 0)

  const updatePos = useCallback(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        (!portalRef.current || !portalRef.current.contains(e.target as Node))
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("touchstart", handleClick, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("touchstart", handleClick)
    }
  }, [])

  useEffect(() => {
    if (open) {
      updatePos()
      inputRef.current?.focus()
      window.addEventListener("scroll", updatePos, true)
      window.addEventListener("resize", updatePos)
      return () => {
        window.removeEventListener("scroll", updatePos, true)
        window.removeEventListener("resize", updatePos)
      }
    }
  }, [open, updatePos])

  const selectedCity = value
    ? Object.values(grouped).flat().find(c => c.name === value)
    : null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-foreground text-base md:text-sm focus:outline-none focus:border-[#B8860B] transition-colors flex items-center justify-between min-h-[44px] ${className}`}
      >
        <span className={cn("truncate mr-2 text-left", value ? "text-foreground" : "text-foreground/40")}>
          {value || "Select a city..."}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {showCoverage && selectedCity && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
              getPostexCoverageStyle(selectedCity.postex).bg
            } ${getPostexCoverageStyle(selectedCity.postex).color} ${getPostexCoverageStyle(selectedCity.postex).border}`}>
              {getPostexCoverageStyle(selectedCity.postex).label}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-foreground/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={portalRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
          }}
          className="bg-card border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-72 overflow-hidden flex flex-col"
        >
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-foreground/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search city..."
                className="bg-transparent text-sm text-foreground placeholder-white/30 focus:outline-none w-full"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-foreground/30">No cities found</div>
            ) : (
              filtered.map(({ province, cities }) => (
                <div key={province}>
                  <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-foreground/30 bg-card font-semibold">
                    {province}
                  </div>
                  {cities.map(city => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => {
                        onChange(city.name)
                        setOpen(false)
                        setSearch("")
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors ${
                        value === city.name ? "bg-white/5 text-[#B8860B]" : "text-foreground/&"
                      }`}
                    >
                      <span>{city.name}</span>
                      {showCoverage && (
                        <span className={`text-[10px] ${
                          city.postex ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {city.postex ? "✓" : "✗"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

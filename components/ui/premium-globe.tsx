"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"

interface GlobeLocation {
  lat: number
  lng: number
  size: number
  city: string
  count: number
}

interface PremiumGlobeProps {
  locations: GlobeLocation[]
  autoRotate?: boolean
}

export function PremiumGlobe({ locations, autoRotate = true }: PremiumGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<GlobeLocation | null>(null)

  const sorted = useMemo(() => {
    if (!locations.length) return []
    return [...locations].sort((a, b) => b.count - a.count)
  }, [locations])

  const topCity = sorted[0] ?? null

  const arcs = useMemo(() => {
    if (sorted.length < 2) return []
    return sorted.slice(1, 5).map((loc) => ({
      startLat: sorted[0].lat,
      startLng: sorted[0].lng,
      endLat: loc.lat,
      endLng: loc.lng,
    }))
  }, [sorted])

  const handleClick = useCallback((point: any) => {
    if (point) {
      setSelectedCity({ lat: point.lat, lng: point.lng, city: point.city, count: point.count, size: point.size || 0.2 })
    }
  }, [])

  const dismissClick = useCallback(() => setSelectedCity(null), [])

  useEffect(() => {
    let globeInstance: any = null
    let mounted = true
    let destructor: (() => void) | null = null
    let resizeObserver: ResizeObserver | null = null

    async function init() {
      try {
        const pkg: any = await import("globe.gl")
        const GlobeModule = pkg.default || pkg
        if (!mounted || !containerRef.current) return

        const container = containerRef.current
        const width = Math.max(container.offsetWidth || 400, 280)

        globeInstance = GlobeModule()(container)
        globeRef.current = globeInstance
        destructor = globeInstance._destructor?.bind(globeInstance)

        globeInstance
          .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
          .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
          .pointLat("lat")
          .pointLng("lng")
          .pointAltitude("altitude")
          .pointRadius("radius")
          .pointColor("color")
          .pointsMerge(true)
          .width(width)
          .height(Math.min(width, 500))
          .showAtmosphere(true)
          .atmosphereColor("#B8860B")
          .atmosphereAltitude(0.25)
          .htmlLabels(true)
          .pointLabel((d: any) => {
            const isHighlighted = selectedCity && selectedCity.city === d.city
            const borderColor = isHighlighted ? "rgba(184,134,11,0.6)" : "rgba(184,134,11,0.25)"
            const glow = isHighlighted ? "0 0 20px rgba(184,134,11,0.3)" : "0 4px 20px rgba(0,0,0,0.5)"
            return `
              <div style="
                background:#0C0F14;
                border:1px solid ${borderColor};
                border-radius:10px;
                padding:6px 12px;
                font-family:system-ui,-apple-system,sans-serif;
                pointer-events:none;
                backdrop-filter:blur(12px);
                box-shadow:${glow};
                transition:all 0.2s;
              ">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#fff;font-size:12px;font-weight:600;">${d.city}</span>
                  <span style="color:rgba(184,134,11,0.9);font-size:11px;font-weight:500;">${d.count}</span>
                  <span style="color:rgba(255,255,255,0.3);font-size:9px;">visitors</span>
                </div>
              </div>
            `
          })
          .onPointClick((point: any) => handleClick(point))
          .onPointHover((point: any | null) => {
            setHoveredCity(point ? point.city : null)
          })

        if (autoRotate) {
          const controls = globeInstance.controls()
          controls.autoRotate = true
          controls.autoRotateSpeed = 0.6
          controls.enableDamping = true
          controls.dampingFactor = 0.05
          controls.minDistance = 200
          controls.maxDistance = 600
        }

        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const w = entry.contentRect.width
            if (w > 0 && globeInstance) {
              globeInstance.width(w)
              globeInstance.height(Math.min(w, 500))
            }
          }
        })
        resizeObserver.observe(container)

        setReady(true)
      } catch (e: any) {
        console.warn("PremiumGlobe failed:", e.message)
        setError(e.message)
      }
    }

    init()

    return () => {
      mounted = false
      if (resizeObserver) resizeObserver.disconnect()
      if (destructor) {
        try { destructor() } catch {}
      }
    }
  }, [autoRotate, handleClick])

  useEffect(() => {
    if (!globeRef.current || !ready) return

    if (!locations.length) {
      try { globeRef.current.pointsData([]) } catch {}
      try { globeRef.current.arcsData([]) } catch {}
      return
    }

    const enrich = (l: GlobeLocation, t: number, i: number) => ({
      lat: l.lat,
      lng: l.lng,
      city: l.city,
      count: l.count,
      size: l.size,
      altitude: 0.02 + 0.025 * Math.sin(t * 2 + i * 1.7),
      radius: l.size * (0.6 + 0.4 * Math.abs(Math.sin(t * 1.5 + i * 2.1))),
      color: selectedCity?.city === l.city ? "#FFD700" : "#B8860B",
    })

    globeRef.current.pointsData(locations.map((l, i) => enrich(l, 0, i)))

    try {
      if (arcs.length > 0) {
        globeRef.current
          .arcsData(arcs)
          .arcColor(() => ["rgba(184,134,11,0.4)", "rgba(184,134,11,0.02)"])
          .arcStroke(0.6)
          .arcDashLength(0.3)
          .arcDashGap(2.5)
          .arcDashAnimateTime(2000)
          .arcAltitudeAutoScale(0.5)
      } else {
        globeRef.current.arcsData([])
      }
    } catch {}

    let animId: number
    const animate = () => {
      const t = Date.now() / 1000
      try {
        globeRef.current.pointsData(locations.map((l, i) => enrich(l, t, i)))
      } catch {}
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animId)
  }, [ready, locations, arcs, selectedCity])

  useEffect(() => {
    if (!selectedCity) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCity(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedCity])

  if (error) {
    return (
      <div className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] overflow-hidden min-h-[280px] h-full flex flex-col items-center justify-center shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
        <div className="w-16 h-16 relative mb-4">
          <div className="absolute inset-0 rounded-full border border-[#B8860B]/20 animate-ping opacity-50" />
          <div className="absolute inset-2 rounded-full border border-[#B8860B]/40 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full bg-[#B8860B]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#B8860B]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
        </div>
        <p className="text-[14px] font-medium text-white/80 mb-1 tracking-wide" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Premium 3D Globe</p>
        <p className="text-[11px] text-white/40 max-w-[200px] text-center leading-relaxed">
          Rendering advanced visualization...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] overflow-hidden min-h-[280px] h-full flex flex-col relative group shadow-[0_2px_20px_rgba(0,0,0,0.3)]">

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#0A0D12]/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.06]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="text-[9px] font-medium text-emerald-400/70">3D Globe</span>
        </div>
        {autoRotate && (
          <div className="bg-[#0A0D12]/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/[0.06]">
            <span className="text-[7px] text-white/25 tracking-wider uppercase">Auto</span>
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <div className="bg-[#0A0D12]/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.06]">
          <span className="text-[9px] text-white/40 tabular-nums font-mono">{locations.length} city{locations.length !== 1 ? "ies" : "y"}</span>
        </div>
      </div>

      {selectedCity && (
        <div className="absolute top-12 left-3 z-20">
          <div className="bg-[#0A0D12]/90 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-[#B8860B]/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[140px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-white/90">{selectedCity.city}</span>
              <button onClick={dismissClick} className="text-white/20 hover:text-white/50 transition-colors ml-3">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#B8860B] tabular-nums">{selectedCity.count}</span>
              <span className="text-[8px] text-white/30 uppercase tracking-wider">Visitors</span>
            </div>
            <div className="mt-1.5 h-px bg-gradient-to-r from-[#B8860B]/30 via-[#B8860B]/10 to-transparent" />
            <div className="flex gap-3 mt-1.5 text-[8px] text-white/20">
              <span>Click globe to dismiss</span>
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full min-h-[280px] flex-1 mt-auto mb-auto" />

      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
        {hoveredCity ? (
          <div className="bg-[#0A0D12]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#B8860B]/15">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.6)]" />
              <span className="text-[10px] text-white/80 font-medium">{hoveredCity}</span>
              <span className="text-[8px] text-white/30">hover</span>
            </div>
          </div>
        ) : sorted.length > 0 ? (
          <div className="bg-[#0A0D12]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/50">Top:</span>
              <span className="text-[10px] text-white/80 font-medium">{sorted[0].city}</span>
              <span className="text-[9px] text-[#B8860B] tabular-nums">{sorted[0].count}</span>
              <span className="text-[7px] text-white/20">·</span>
              <span className="text-[8px] text-white/30">{sorted.length} cities</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0D12]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.06]">
            <span className="text-[9px] text-white/30">No active cities</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-[#0A0D12]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.06]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="text-[9px] font-medium text-emerald-400/60">Live</span>
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F1923] z-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-white/30">Loading 3D globe...</span>
          </div>
        </div>
      )}
    </div>
  )
}

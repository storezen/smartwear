"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Search, X, Star, Map as MapIcon, Building2, Route, Navigation, Clock, ShieldCheck, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import "leaflet/dist/leaflet.css"
import { getAllCities, isPostexServiceable, getCityCoordinates } from "@/lib/address-validator"

const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
const defaultIcon = L.icon({
  iconUrl, iconRetinaUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = defaultIcon

export interface AddressMapResult {
  formattedAddress: string
  city: string
  lat: number
  lng: number
}

interface SearchItem {
  lat: number
  lng: number
  displayName: string
  city: string
  type: "city" | "area" | "street"
  shortName: string
}

const cache = new Map<string, SearchItem[]>()

const POPULAR_CITIES = getAllCities().filter(c => c.lat).map(c => ({
  name: c.name,
  province: c.province,
  lat: c.lat,
  lng: c.lng,
  postex: c.postex,
}))

const RECENT_KEY = "smartwear_recent_addresses"
const MAX_RECENT = 5

function getRecentAddresses(): AddressMapResult[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
  } catch { return [] }
}

function saveRecentAddress(addr: AddressMapResult) {
  try {
    const recent = getRecentAddresses().filter(r => r.formattedAddress !== addr.formattedAddress)
    recent.unshift(addr)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {}
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center[0], center[1], zoom, map])
  return null
}

function MapClickHandler({ onPin }: { onPin: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPin(e.latlng.lat, e.latlng.lng) } })
  return null
}

interface AddressMapProps {
  onSelect: (result: AddressMapResult) => void
}

export default function AddressMap({ onSelect }: AddressMapProps) {
  const [open, setOpen] = useState(false)
  const [center, setCenter] = useState<[number, number]>([30.3753, 69.3451])
  const [zoom, setZoom] = useState(6)
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [showCities, setShowCities] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [recentAddresses] = useState<AddressMapResult[]>(getRecentAddresses)
  const [geoLoading, setGeoLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([])
        setShowCities(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }

    const cacheKey = q.toLowerCase().trim()
    const cached = cache.get(cacheKey)
    if (cached) { setResults(cached); return }

    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1&countrycodes=pk&accept-language=en`,
        { headers: { "User-Agent": "SmartwearApp/1.0" } }
      )
      const data = await res.json()
      const items: SearchItem[] = data.map((r: any) => {
        const addr = r.address || {}
        const city = addr.city || addr.town || addr.village || addr.county || addr.state || ""
        const type: SearchItem["type"] =
          addr.city || addr.town ? "city" :
          addr.suburb || addr.neighbourhood ? "area" : "street"
        const shortName = r.display_name.split(",")[0]?.trim() || r.display_name
        return { lat: Number(r.lat), lng: Number(r.lon), displayName: r.display_name, city, type, shortName }
      })
      items.sort((a, b) => {
        const order = { city: 0, area: 1, street: 2 }
        return order[a.type] - order[b.type]
      })
      cache.set(cacheKey, items)
      setResults(items)
    } catch {}
    setSearching(false)
  }, [])

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    setShowCities(false)
    setSelectedCity(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(() => doSearch(q), 300)
  }

  const placePin = useCallback((lat: number, lng: number, name?: string) => {
    setMarkerPos([lat, lng])
    setCenter([lat, lng])
    setZoom(16)
    setSearchQuery("")
    setResults([])
    setSelectedCity(name || null)
  }, [])

  const selectPlace = (item: SearchItem) => {
    placePin(item.lat, item.lng, item.city)
  }

  const selectPopularCity = (name: string, lat: number, lng: number) => {
    placePin(lat, lng, name)
    setShowCities(false)
  }

  const selectRecentAddress = (addr: AddressMapResult) => {
    placePin(addr.lat, addr.lng, addr.city)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        placePin(lat, lng)
        setGeoLoading(false)
      },
      () => {
        setGeoLoading(false)
        toast.error("Could not get your location. Make sure location access is enabled.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const confirmLocation = async () => {
    if (!markerPos) return
    const [lat, lng] = markerPos
    let displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    let city = selectedCity || ""
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
        { headers: { "User-Agent": "SmartwearApp/1.0" } }
      )
      const data = await res.json()
      if (data?.display_name) displayName = data.display_name
      city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || city
    } catch {}
    const result: AddressMapResult = { formattedAddress: displayName, city, lat, lng }
    saveRecentAddress(result)
    onSelect(result)
    setOpen(false)
    setMarkerPos(null)
    setSelectedCity(null)
  }

  const handlePin = (lat: number, lng: number) => {
    setMarkerPos([lat, lng])
    setCenter([lat, lng])
    setZoom(16)
    setSelectedCity(null)
  }

  const typeIcon = (t: SearchItem["type"]) => {
    if (t === "city") return <Building2 className="w-3.5 h-3.5 shrink-0" />
    if (t === "area") return <MapIcon className="w-3.5 h-3.5 shrink-0" />
    return <Route className="w-3.5 h-3.5 shrink-0" />
  }

  const typeLabel = (t: SearchItem["type"]) => {
    if (t === "city") return "City"
    if (t === "area") return "Area"
    return "Street"
  }

  const getPostexStatus = (cityName: string) => {
    const delivers = isPostexServiceable(cityName)
    return {
      delivers,
      label: delivers ? "PostEx Delivers" : "PostEx Not Available",
      icon: delivers ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />,
      className: delivers ? "text-emerald-400" : "text-amber-400",
    }
  }

  const postexStatus = markerPos && selectedCity ? getPostexStatus(selectedCity) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs text-[#B8860B] hover:text-[#D4A017] font-medium bg-[#B8860B]/10 px-3 py-1.5 rounded-lg transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" /> Open Map
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className={`bg-[#0a0a0a] border border-white/10 rounded-none sm:rounded-2xl w-full max-w-2xl mx-0 sm:mx-4 overflow-hidden shadow-2xl flex flex-col ${isMobile ? 'h-full' : 'max-h-[90vh]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/5 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B8860B]" /> Search Location
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={geoLoading}
                  className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-[#B8860B] transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg disabled:opacity-40"
                  title="Use my current location"
                >
                  <Navigation className={`w-3 h-3 ${geoLoading ? 'animate-spin' : ''}`} />
                  {geoLoading ? "Locating..." : "My Location"}
                </button>
                <button onClick={() => { setOpen(false); setMarkerPos(null); setResults([]); setSelectedCity(null) }} className="text-white/40 hover:text-white/70 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search + Quick Cities */}
            <div className="px-4 sm:px-5 py-3 border-b border-white/5 shrink-0" ref={searchRef}>
              <div className="relative">
                <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 focus-within:border-[#B8860B] transition-colors">
                  <Search className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    onFocus={() => { if (!searchQuery && !results.length) setShowCities(true) }}
                    placeholder="Search city, area, or street in Pakistan..."
                    className="bg-transparent text-sm text-white placeholder-white/30 focus:outline-none w-full min-w-0"
                  />
                  {searching && <span className="text-[10px] text-white/30 animate-pulse shrink-0">Searching...</span>}
                </div>

                {/* Quick popular cities */}
                {showCities && !searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1923] border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-60 overflow-y-auto">
                    {/* Recent addresses */}
                    {recentAddresses.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-1.5 sticky top-0 bg-[#0F1923]">
                          <Clock className="w-3 h-3" /> Recent
                        </div>
                        {recentAddresses.map((addr, i) => (
                          <button
                            key={`recent-${i}`}
                            type="button"
                            onClick={() => selectRecentAddress(addr)}
                            className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors flex items-center justify-between truncate"
                          >
                            <span className="truncate">{addr.formattedAddress.split(",")[0]}</span>
                            <span className="text-[10px] text-white/30 shrink-0 ml-2">{addr.city}</span>
                          </button>
                        ))}
                        <div className="h-px bg-white/5 mx-3" />
                      </>
                    )}
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-1.5 sticky top-0 bg-[#0F1923]">
                      <Star className="w-3 h-3" /> Popular Cities
                    </div>
                    {POPULAR_CITIES.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectPopularCity(c.name, c.lat, c.lng)}
                        className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          {c.name}
                          {c.postex && <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />}
                        </span>
                        <span className="text-[10px] text-white/30">{c.province}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Search results */}
                {results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1923] border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto">
                    {results.map((item, i) => {
                      const px = isPostexServiceable(item.city)
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectPlace(item)}
                          className="w-full text-left px-3 py-2.5 text-xs text-white/80 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-2.5"
                        >
                          <span className={`mt-0.5 ${item.type === "city" ? "text-[#B8860B]" : "text-white/40"}`}>
                            {typeIcon(item.type)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{item.shortName}</span>
                            <span className="block text-[10px] text-white/40 mt-0.5 truncate flex items-center gap-1.5">
                              {item.city} · <span className="text-white/30">{typeLabel(item.type)}</span>
                              {px && <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className={`relative ${isMobile ? 'flex-1 min-h-0' : 'h-72 sm:h-80 md:h-96'}`}>
              <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} zoom={zoom} />
                <MapClickHandler onPin={handlePin} />
                {markerPos && (
                  <Marker position={markerPos} draggable={true} eventHandlers={{
                    dragend: (e) => {
                      const m = e.target as L.Marker
                      const pos = m.getLatLng()
                      setMarkerPos([pos.lat, pos.lng])
                      setSelectedCity(null)
                    }
                  }} />
                )}
              </MapContainer>

              {/* PostEx status badge */}
              {postexStatus && (
                <div className={`absolute top-3 left-3 z-[1000] flex items-center gap-1.5 text-[10px] font-medium ${postexStatus.className} bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10`}>
                  {postexStatus.icon}
                  {postexStatus.label}
                </div>
              )}

              {!markerPos && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] whitespace-nowrap">
                  <p className="text-[10px] bg-black/70 backdrop-blur-sm text-white/50 px-3 py-1.5 rounded-lg border border-white/10">
                    Search a place or click the map to drop a pin
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-4 sm:px-5 py-3 border-t border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => { setOpen(false); setMarkerPos(null); setResults([]); setSelectedCity(null) }}
                className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLocation}
                disabled={!markerPos}
                className="px-5 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-black text-xs font-bold rounded-lg hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] transition-all disabled:opacity-40"
              >
                Use This Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

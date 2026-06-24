"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Search, X, Star, Map as MapIcon, Building2, Route, Navigation, Clock, ShieldCheck, AlertTriangle, Layers, Home, Briefcase, MapPinned, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import "leaflet/dist/leaflet.css"
import { getAllCities, isPostexServiceable, detectProvince } from "@/lib/address-validator"

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

interface SavedAddress {
  label: "Home" | "Office" | "Other"
  address: AddressMapResult
}

const SEARCH_CACHE = new Map<string, SearchItem[]>()
const SAVED_KEY = "smartwear_saved_addresses"
const RECENT_KEY = "smartwear_recent_addresses"
const MAX_RECENT = 5
const MAX_SAVED = 10

const POPULAR_CITIES = getAllCities().filter(c => c.lat).map(c => ({
  name: c.name,
  province: c.province,
  lat: c.lat!,
  lng: c.lng!,
  postex: c.postex,
}))

const SATELLITE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
const STREET_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451]
const CITY_ZOOM = 12
const STREET_ZOOM = 17
const DEFAULT_ZOOM = 6

function getRecentAddresses(): AddressMapResult[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") } catch { return [] }
}

function saveRecentAddress(addr: AddressMapResult) {
  try {
    const recent = getRecentAddresses().filter(r => r.formattedAddress !== addr.formattedAddress)
    recent.unshift(addr)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {}
}

function getSavedAddresses(): SavedAddress[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") } catch { return [] }
}

function saveSavedAddresses(saved: SavedAddress[]) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(saved.slice(0, MAX_SAVED))) } catch {}
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

function detectCity(lat: number, lng: number): string {
  let closest = ""
  let minDist = Infinity
  for (const c of POPULAR_CITIES) {
    const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2)
    if (d < minDist) { minDist = d; closest = c.name }
  }
  return minDist < 0.5 ? closest : ""
}

interface AddressMapProps {
  onSelect: (result: AddressMapResult) => void
}

export default function AddressMap({ onSelect }: AddressMapProps) {
  const [open, setOpen] = useState(false)
  const [center, setCenter] = useState<[number, number]>(PAKISTAN_CENTER)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [recentAddresses] = useState<AddressMapResult[]>(getRecentAddresses)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(getSavedAddresses)
  const [geoLoading, setGeoLoading] = useState(false)
  const [satellite, setSatellite] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const [addressDetail, setAddressDetail] = useState({
    street: "",
    area: "",
    city: "",
    province: "",
  })
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [resolvingAddress, setResolvingAddress] = useState(false)
  const [saveLabel, setSaveLabel] = useState<SavedAddress["label"] | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640

  const resultsRef = useCallback((node: HTMLDivElement | null) => {
    if (node && focusedIdx >= 0) {
      const el = node.children[focusedIdx] as HTMLElement
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [focusedIdx])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node) && !showSaved) {
        setResults([]); setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [showSaved])

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    const cacheKey = q.toLowerCase().trim()
    const cached = SEARCH_CACHE.get(cacheKey)
    if (cached) { setResults(cached); setFocusedIdx(-1); return }
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
          addr.city || addr.town ? "city" : addr.suburb || addr.neighbourhood ? "area" : "street"
        const shortName = r.display_name.split(",")[0]?.trim() || r.display_name
        return { lat: Number(r.lat), lng: Number(r.lon), displayName: r.display_name, city, type, shortName }
      })
      items.sort((a, b) => {
        const order = { city: 0, area: 1, street: 2 }
        return order[a.type] - order[b.type]
      })
      SEARCH_CACHE.set(cacheKey, items)
      setResults(items)
      setFocusedIdx(-1)
    } catch {}
    setSearching(false)
  }, [])

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    setShowDropdown(false)
    setSelectedCity("")
    setFocusedIdx(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(() => doSearch(q), 300)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length ? results : POPULAR_CITIES.map(c => ({
      lat: c.lat, lng: c.lng, displayName: c.name, city: c.name,
      type: "city" as const, shortName: c.name
    }))
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, items.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, -1)) }
    else if (e.key === "Enter" && focusedIdx >= 0 && items[focusedIdx]) {
      e.preventDefault(); selectPlace(items[focusedIdx])
    }
  }

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setResolvingAddress(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
        { headers: { "User-Agent": "SmartwearApp/1.0" } }
      )
      const data = await res.json()
      const addr = data?.address || {}
      const city = addr.city || addr.town || addr.village || addr.county || addr.state || detectCity(lat, lng)
      const road = addr.road || ""
      const suburb = addr.suburb || addr.neighbourhood || ""
      const houseNum = addr.house_number || ""
      setAddressDetail({
        street: [houseNum, road].filter(Boolean).join(" "),
        area: suburb,
        city,
        province: detectProvince(city) || addr.state || "",
      })
      setSelectedCity(city)
    } catch {
      const city = detectCity(lat, lng)
      setAddressDetail({ street: "", area: "", city, province: detectProvince(city) })
      setSelectedCity(city)
    }
    setResolvingAddress(false)
    setShowDetailPanel(true)
  }, [])

  const placePin = useCallback((lat: number, lng: number, city?: string) => {
    setMarkerPos([lat, lng])
    setCenter([lat, lng])
    setZoom(STREET_ZOOM)
    setShowSaved(false)
    if (city) setSelectedCity(city)
    setAddressDetail(prev => ({ ...prev, city: city || prev.city }))
    setShowDetailPanel(true)
    reverseGeocode(lat, lng)
  }, [reverseGeocode])

  const zoomToCity = (lat: number, lng: number, name: string) => {
    setCenter([lat, lng])
    setZoom(CITY_ZOOM)
    setSearchQuery(name)
    setResults([])
    setShowDropdown(false)
    setSelectedCity(name)
    setAddressDetail(prev => ({ ...prev, city: name, province: detectProvince(name) }))
    setShowDetailPanel(false)
  }

  const selectPlace = (item: SearchItem) => {
    setSearchQuery(item.shortName)
    setResults([])
    setShowDropdown(false)
    setFocusedIdx(-1)
    if (item.type === "city") {
      zoomToCity(item.lat, item.lng, item.city)
    } else {
      placePin(item.lat, item.lng, item.city)
    }
  }

  const selectPopularCity = (name: string, lat: number, lng: number) => {
    zoomToCity(lat, lng, name)
    setShowDropdown(false)
  }

  const selectRecentAddress = (addr: AddressMapResult) => {
    placePin(addr.lat, addr.lng, addr.city)
  }

  const selectSavedAddress = (saved: SavedAddress) => {
    placePin(saved.address.lat, saved.address.lng, saved.address.city)
    setShowSaved(false)
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation is not supported"); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { placePin(pos.coords.latitude, pos.coords.longitude); setGeoLoading(false) },
      () => { setGeoLoading(false); toast.error("Could not get your location. Make sure location access is enabled.") },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const confirmLocation = async () => {
    if (!markerPos) return
    const [lat, lng] = markerPos
    const { street, area, city, province } = addressDetail
    const parts = [street, area, city, province].filter(Boolean)
    const formattedAddress = parts.length > 0 ? parts.join(", ") : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    const finalCity = city || selectedCity || detectCity(lat, lng) || "Unknown"
    const result: AddressMapResult = { formattedAddress, city: finalCity, lat, lng }
    saveRecentAddress(result)
    if (saveLabel && finalCity) {
      const saved = [...savedAddresses.filter(s => s.address.city !== finalCity), { label: saveLabel, address: result }]
      setSavedAddresses(saved)
      saveSavedAddresses(saved)
    }
    onSelect(result)
    setOpen(false); setMarkerPos(null); setResults([]); setSelectedCity("")
    setAddressDetail({ street: "", area: "", city: "", province: "" })
    setShowDetailPanel(false); setSaveLabel(null)
  }

  const handlePin = (lat: number, lng: number) => {
    setMarkerPos([lat, lng])
    setCenter([lat, lng])
    setZoom(STREET_ZOOM)
    setSelectedCity("")
    setShowDetailPanel(true)
    reverseGeocode(lat, lng)
  }

  const closeModal = () => {
    setOpen(false); setMarkerPos(null); setResults([]); setSelectedCity("")
    setAddressDetail({ street: "", area: "", city: "", province: "" })
    setShowDetailPanel(false); setShowSaved(false); setSaveLabel(null)
  }

  const typeIcon = (t: SearchItem["type"]) => {
    if (t === "city") return <Building2 className="w-3.5 h-3.5 shrink-0" />
    if (t === "area") return <MapIcon className="w-3.5 h-3.5 shrink-0" />
    return <Route className="w-3.5 h-3.5 shrink-0" />
  }
  const typeLabel = (t: SearchItem["type"]) => {
    if (t === "city") return "City"; if (t === "area") return "Area"; return "Street"
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

  const postexStatus = markerPos && (addressDetail.city || selectedCity) ? getPostexStatus(addressDetail.city || selectedCity) : null

  const hasCompleteAddress = addressDetail.street && addressDetail.city

  const dropdownItems = results.length > 0 ? results : (showDropdown && !searchQuery ? [] : [])

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
          <div className={`bg-[#0a0a0a] border border-white/10 rounded-none sm:rounded-2xl w-full max-w-3xl mx-0 sm:mx-4 overflow-hidden shadow-2xl flex flex-col ${isMobile ? 'h-full' : 'max-h-[95vh]'}`}>

            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/5 shrink-0">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-[#B8860B]" /> Select Delivery Address
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowSaved(!showSaved); setShowDropdown(false) }}
                  className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-[#B8860B] transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg"
                  title="Saved addresses"
                >
                  <Star className="w-3 h-3" />
                  Saved
                  {savedAddresses.length > 0 && <span className="text-[9px] text-white/30">({savedAddresses.length})</span>}
                </button>
                <button
                  type="button"
                  onClick={() => setSatellite(!satellite)}
                  className={`flex items-center gap-1.5 text-[10px] transition-colors px-2.5 py-1.5 rounded-lg ${satellite ? 'bg-[#B8860B]/20 text-[#B8860B]' : 'text-white/50 hover:text-white/70 bg-white/5 hover:bg-white/10'}`}
                  title={satellite ? "Street View" : "Satellite View"}
                >
                  <Layers className="w-3 h-3" />
                  {satellite ? "Satellite" : "Map"}
                </button>
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
                <button onClick={closeModal} className="text-white/40 hover:text-white/70 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ===== SEARCH BAR ===== */}
            <div className="shrink-0 relative" ref={searchRef}>
              <div className="px-4 sm:px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 focus-within:border-[#B8860B] transition-colors">
                  <Search className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    onFocus={() => { if (!searchQuery && !results.length) setShowDropdown(true) }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search city, area, or street in Pakistan..."
                    className="bg-transparent text-sm text-white placeholder-white/30 focus:outline-none w-full min-w-0"
                  />
                  {searching && <span className="text-[10px] text-white/30 animate-pulse shrink-0">Searching...</span>}
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setResults([]); inputRef.current?.focus() }} className="text-white/30 hover:text-white/60">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search results or dropdown */}
              {((results.length > 0) || (showDropdown && !searchQuery)) && (
                <div
                  ref={resultsRef}
                  className="absolute top-full left-0 right-0 z-[9999] bg-[#0F1923] border border-white/10 rounded-xl shadow-2xl mx-4 sm:mx-5 max-h-72 overflow-y-auto"
                >
                  {/* Recent addresses */}
                  {!searchQuery && recentAddresses.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-1.5 sticky top-0 bg-[#0F1923] z-10">
                        <Clock className="w-3 h-3" /> Recent
                      </div>
                      {recentAddresses.map((addr, i) => (
                        <button
                          key={`recent-${i}`}
                          type="button"
                          onClick={() => { selectRecentAddress(addr); setShowDropdown(false) }}
                          className={`w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors flex items-center justify-between truncate ${focusedIdx === i ? 'bg-white/5' : ''}`}
                        >
                          <span className="truncate">{addr.formattedAddress.split(",")[0]}</span>
                          <span className="text-[10px] text-white/30 shrink-0 ml-2">{addr.city}</span>
                        </button>
                      ))}
                      <div className="h-px bg-white/5 mx-3" />
                    </>
                  )}

                  {/* Popular cities */}
                  {!searchQuery && (
                    <>
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-1.5 sticky top-0 bg-[#0F1923] z-10">
                        <Star className="w-3 h-3" /> Popular Cities
                      </div>
                      {POPULAR_CITIES.map((c, i) => {
                        const idx = i + (recentAddresses.length > 0 ? recentAddresses.length + 1 : 0)
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { selectPopularCity(c.name, c.lat, c.lng); setShowDropdown(false) }}
                            className={`w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors flex items-center justify-between ${focusedIdx === idx ? 'bg-white/5' : ''}`}
                          >
                            <span className="flex items-center gap-2">
                              {c.name}
                              {c.postex && <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />}
                            </span>
                            <span className="text-[10px] text-white/30">{c.province}</span>
                          </button>
                        )
                      })}
                    </>
                  )}

                  {/* Search results */}
                  {results.map((item, i) => {
                    const px = isPostexServiceable(item.city)
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectPlace(item)}
                        className={`w-full text-left px-3 py-2.5 text-xs text-white/80 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-2.5 ${focusedIdx === i ? 'bg-white/5' : ''}`}
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

            {/* ===== MAIN CONTENT: Map + Detail Panel ===== */}
            <div className={`flex ${isMobile ? 'flex-col flex-1 min-h-0' : 'flex-row flex-1 min-h-0'}`}>

              {/* Map */}
              <div className={`relative ${isMobile ? 'h-1/2 min-h-[200px]' : 'flex-1 min-h-[350px]'}`}>
                <MapContainer key={satellite ? 'sat' : 'street'} center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution={satellite
                      ? '&copy; <a href="https://www.esri.com/">Esri</a>'
                      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
                    url={satellite ? SATELLITE_URL : STREET_URL}
                  />
                  <ChangeView center={center} zoom={zoom} />
                  <MapClickHandler onPin={handlePin} />
                  {markerPos && (
                    <Marker position={markerPos} draggable={true} eventHandlers={{
                      dragend: (e) => {
                        const m = e.target as L.Marker
                        const pos = m.getLatLng()
                        setMarkerPos([pos.lat, pos.lng])
                        reverseGeocode(pos.lat, pos.lng)
                      }
                    }} />
                  )}
                </MapContainer>

                {/* Map overlays */}
                {postexStatus && (
                  <div className={`absolute top-3 left-3 z-[1000] flex items-center gap-1.5 text-[10px] font-medium ${postexStatus.className} bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10`}>
                    {postexStatus.icon}
                    {postexStatus.label}
                  </div>
                )}

                {!markerPos && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] whitespace-nowrap px-3">
                    <p className="text-[10px] bg-black/80 backdrop-blur-sm text-white/50 px-3 py-1.5 rounded-lg border border-white/10 text-center">
                      Search a place, click the map, or drag the pin
                    </p>
                  </div>
                )}

                {selectedCity && !markerPos && (
                  <div className="absolute bottom-3 left-3 z-[1000]">
                    <button
                      type="button"
                      onClick={() => placePin(center[0], center[1], selectedCity)}
                      className="flex items-center gap-1.5 text-[10px] font-medium text-white bg-[#B8860B]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-[#B8860B]/30 hover:bg-[#B8860B] transition-colors"
                    >
                      <MapPin className="w-3 h-3" /> Drop Pin Here
                    </button>
                  </div>
                )}

                {satellite && (
                  <div className="absolute top-3 right-3 z-[1000] text-[9px] text-white/30 bg-black/60 px-2 py-1 rounded">
                    Satellite
                  </div>
                )}
              </div>

              {/* ===== ADDRESS DETAIL PANEL ===== */}
              <div className={`${isMobile ? 'flex-1 min-h-0 overflow-y-auto border-t border-white/5' : 'w-80 shrink-0 overflow-y-auto border-l border-white/5'}`}>
                {!markerPos ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                    <MapPinned className="w-10 h-10 text-white/10 mb-3" />
                    <p className="text-xs text-white/30">Search a location or click the map</p>
                    <p className="text-[10px] text-white/20 mt-1">Select a city first to zoom in, then drop a pin</p>
                  </div>
                ) : resolvingAddress ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                    <div className="w-5 h-5 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs text-white/50">Detecting address...</p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 space-y-4">
                    <h4 className="text-[11px] uppercase tracking-wider text-white/30 flex items-center gap-2">
                      <MapPinned className="w-3 h-3" /> Address Details
                    </h4>

                    {/* Street / House */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Street / House</label>
                      <input
                        type="text"
                        value={addressDetail.street}
                        onChange={e => setAddressDetail(p => ({ ...p, street: e.target.value }))}
                        placeholder="e.g. House #12, Street 5"
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                    </div>

                    {/* Area */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Area / Landmark</label>
                      <input
                        type="text"
                        value={addressDetail.area}
                        onChange={e => setAddressDetail(p => ({ ...p, area: e.target.value }))}
                        placeholder="e.g. Gulshan-e-Maymar"
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">City</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={addressDetail.city}
                          onChange={e => {
                            setAddressDetail(p => ({ ...p, city: e.target.value, province: detectProvince(e.target.value) || p.province }))
                            setSelectedCity(e.target.value)
                          }}
                          placeholder="City name"
                          className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#B8860B] transition-colors pr-8"
                        />
                        {postexStatus && (
                          <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${postexStatus.className}`}>
                            {postexStatus.icon}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Province */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Province</label>
                      <input
                        type="text"
                        value={addressDetail.province}
                        onChange={e => setAddressDetail(p => ({ ...p, province: e.target.value }))}
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                    </div>

                    {/* Coordinates */}
                    <div className="text-[9px] text-white/20 font-mono">
                      {markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}
                    </div>

                    {/* PostEx warning */}
                    {postexStatus && !postexStatus.delivers && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-300/80">
                          PostEx does not deliver to this city. The order may need an alternative courier.
                        </p>
                      </div>
                    )}

                    {/* Save address toggle */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setSaveLabel(saveLabel ? null : "Home")}
                        className={`text-[10px] flex items-center gap-1.5 transition-colors ${saveLabel ? 'text-[#B8860B]' : 'text-white/40 hover:text-white/60'}`}
                      >
                        <Star className="w-3 h-3" />
                        {saveLabel ? "Save this address" : "Save this address"}
                      </button>
                      {saveLabel && (
                        <div className="flex gap-2 mt-2">
                          {(["Home", "Office", "Other"] as const).map(label => (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setSaveLabel(label)}
                              className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                                saveLabel === label
                                  ? 'border-[#B8860B] bg-[#B8860B]/10 text-[#B8860B]'
                                  : 'border-white/10 text-white/40 hover:border-white/20'
                              }`}
                            >
                              {label === "Home" ? <Home className="w-2.5 h-2.5" /> : label === "Office" ? <Briefcase className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Address preview */}
                    {hasCompleteAddress && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mb-1">
                          <CheckCircle2 className="w-3 h-3" /> Complete Address
                        </div>
                        <p className="text-[11px] text-white/70 leading-relaxed">
                          {[addressDetail.street, addressDetail.area, addressDetail.city, addressDetail.province].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ===== SAVED ADDRESSES SIDEBAR ===== */}
            {showSaved && (
              <div className="absolute inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-start justify-end p-4">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#B8860B]" /> Saved Addresses
                    </h4>
                    <button onClick={() => setShowSaved(false)} className="text-white/40 hover:text-white/70">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {savedAddresses.length === 0 ? (
                    <div className="px-5 py-8 text-center text-xs text-white/30">
                      No saved addresses yet. Save one after selecting a location.
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {savedAddresses.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectSavedAddress(s)}
                          className="w-full text-left bg-[#141414] hover:bg-white/5 border border-white/5 rounded-xl px-4 py-3 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-[#B8860B] flex items-center gap-1">
                              {s.label === "Home" ? <Home className="w-3 h-3" /> : s.label === "Office" ? <Briefcase className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {s.label}
                            </span>
                            <span className="text-[10px] text-white/30">{s.address.city}</span>
                          </div>
                          <p className="text-[11px] text-white/60 truncate">{s.address.formattedAddress}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== FOOTER ===== */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                {markerPos && hasCompleteAddress && (
                  <span className="text-[10px] text-emerald-500/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Address complete
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLocation}
                  disabled={!markerPos || !addressDetail.city}
                  className="px-5 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-black text-xs font-bold rounded-lg hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Use This Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Search, X, Star, Map as MapIcon, Building2, Route, Navigation, Clock, ShieldCheck, AlertTriangle, Layers, Home, Briefcase, MapPinned, CheckCircle2, Landmark, Sparkles, Truck, Hash, CircleHelp } from "lucide-react"
import { toast } from "sonner"
import "leaflet/dist/leaflet.css"
import { getAllCities, isPostexServiceable, detectProvince, getCityCoordinates } from "@/lib/address-validator"

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
  lat: number; lng: number; displayName: string; city: string
  type: "city" | "area" | "street"; shortName: string
}

interface SavedAddress {
  label: "Home" | "Office" | "Other"
  address: AddressMapResult
}

interface Suggestion {
  text: string; lat: number; lng: number
}

const SEARCH_CACHE = new Map<string, SearchItem[]>()
const SUGGEST_CACHE = new Map<string, Suggestion[]>()
const LANDMARK_CACHE = new Map<string, Suggestion[]>()
const SAVED_KEY = "smartwear_saved_addresses"
const RECENT_KEY = "smartwear_recent_addresses"
const MAX_RECENT = 5; const MAX_SAVED = 10

const POPULAR_CITIES = getAllCities().filter(c => c.lat).map(c => ({
  name: c.name, province: c.province, lat: c.lat!, lng: c.lng!, postex: c.postex,
}))

const SATELLITE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
const STREET_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451]
const CITY_ZOOM = 12; const STREET_ZOOM = 17; const DEFAULT_ZOOM = 6

const KARACHI_LAT = 24.8607; const KARACHI_LNG = 67.0011

function getRecentAddresses(): AddressMapResult[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") } catch { return [] }
}
function saveRecentAddress(addr: AddressMapResult) {
  try {
    const recent = getRecentAddresses().filter(r => r.formattedAddress !== addr.formattedAddress)
    recent.unshift(addr); localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
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
  let closest = ""; let minDist = Infinity
  for (const c of POPULAR_CITIES) {
    const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2)
    if (d < minDist) { minDist = d; closest = c.name }
  }
  return minDist < 0.5 ? closest : ""
}

function estimateDeliveryDays(lat: number, lng: number): { min: number; max: number } {
  const dist = Math.sqrt((lat - KARACHI_LAT) ** 2 + (lng - KARACHI_LNG) ** 2)
  if (dist < 2) return { min: 1, max: 2 }
  if (dist < 5) return { min: 2, max: 3 }
  if (dist < 10) return { min: 3, max: 5 }
  return { min: 4, max: 7 }
}

function computeAddressQuality(detail: { street: string; area: string; city: string; province: string }): {
  score: number; label: string; color: string; issues: string[]
} {
  const issues: string[] = []
  let score = 0
  if (detail.street.length > 3) score += 35; else if (detail.street.length > 0) score += 15; else issues.push("Missing street/house")
  if (detail.area.length > 2) score += 20; else if (detail.area.length > 0) score += 10
  if (detail.city.length > 2) { score += 30 } else { issues.push("Missing city") }
  if (detail.province.length > 2) score += 15
  if (score >= 90) return { score, label: "Excellent", color: "text-emerald-400", issues }
  if (score >= 70) return { score, label: "Good", color: "text-blue-400", issues }
  if (score >= 50) return { score, label: "Fair", color: "text-amber-400", issues }
  return { score, label: "Incomplete", color: "text-red-400", issues }
}

function normalizeCity(input: string): string {
  const map: Record<string, string> = {
    "karchi": "Karachi", "karaci": "Karachi", "krchi": "Karachi",
    "lahor": "Lahore", "lahre": "Lahore",
    "islambad": "Islamabad", "isl": "Islamabad",
    "rawalpndi": "Rawalpindi", "rwp": "Rawalpindi",
    "faislabad": "Faisalabad", "fsd": "Faisalabad",
    "multn": "Multan", "mlt": "Multan",
    "gujranwala": "Gujranwala", "grw": "Gujranwala",
    "peshawr": "Peshawar", "psh": "Peshawar",
    "quetta": "Quetta", "qta": "Quetta",
    "hyderabd": "Hyderabad", "hyd": "Hyderabad",
    "sialkot": "Sialkot", "skt": "Sialkot",
    "bahawalpur": "Bahawalpur", "bwp": "Bahawalpur",
    "sargodha": "Sargodha", "sgd": "Sargodha",
  }
  const key = input.toLowerCase().trim().replace(/\s+/g, "")
  return map[key] || input
}

interface AddressMapProps {
  onSelect: (result: AddressMapResult) => void
  initialAddress?: string
  initialCity?: string
}

export default function AddressMap({ onSelect, initialAddress, initialCity }: AddressMapProps) {
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
    street: "", area: "", city: "", province: "",
  })
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [resolvingAddress, setResolvingAddress] = useState(false)
  const [saveLabel, setSaveLabel] = useState<SavedAddress["label"] | null>(null)
  const [streetSuggestions, setStreetSuggestions] = useState<Suggestion[]>([])
  const [areaSuggestions, setAreaSuggestions] = useState<Suggestion[]>([])
  const [nearbyLandmarks, setNearbyLandmarks] = useState<Suggestion[]>([])
  const [activeSuggestionField, setActiveSuggestionField] = useState<"street" | "area" | null>(null)
  const [deliveryEta, setDeliveryEta] = useState<{ min: number; max: number } | null>(null)
  const [showCityHelp, setShowCityHelp] = useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const streetRef = useRef<HTMLInputElement>(null)
  const areaRef = useRef<HTMLInputElement>(null)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640

  const resultsRef = useCallback((node: HTMLDivElement | null) => {
    if (node && focusedIdx >= 0) { const el = node.children[focusedIdx] as HTMLElement; el?.scrollIntoView({ block: "nearest" }) }
  }, [focusedIdx])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node) && !showSaved) {
        setResults([]); setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handle); return () => document.removeEventListener("mousedown", handle)
  }, [showSaved])

  useEffect(() => { if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100) }, [open])

  useEffect(() => {
    if (open && initialCity) {
      const coords = getCityCoordinates(initialCity)
      if (coords) {
        setCenter([coords.lat, coords.lng])
        setZoom(CITY_ZOOM)
        setSelectedCity(initialCity)
        setAddressDetail(prev => ({ ...prev, city: initialCity, province: detectProvince(initialCity) }))
        setSearchQuery(initialCity)
      }
    }
  }, [open, initialCity])

  useEffect(() => {
    if (markerPos && addressDetail.city) {
      setDeliveryEta(estimateDeliveryDays(markerPos[0], markerPos[1]))
    } else { setDeliveryEta(null) }
  }, [markerPos, addressDetail.city])

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
        const type: SearchItem["type"] = addr.city || addr.town ? "city" : addr.suburb || addr.neighbourhood ? "area" : "street"
        const shortName = r.display_name.split(",")[0]?.trim() || r.display_name
        return { lat: Number(r.lat), lng: Number(r.lon), displayName: r.display_name, city, type, shortName }
      })
      items.sort((a, b) => ({ city: 0, area: 1, street: 2 }[a.type] - { city: 0, area: 1, street: 2 }[b.type]))
      SEARCH_CACHE.set(cacheKey, items)
      setResults(items); setFocusedIdx(-1)
    } catch {}
    setSearching(false)
  }, [])

  const fetchSuggestions = useCallback(async (query: string, city: string, field: "street" | "area") => {
    if (query.length < 3 || !city) { setStreetSuggestions([]); setAreaSuggestions([]); return }
    const cacheKey = `${field}:${city}:${query.toLowerCase()}`
    const cached = SUGGEST_CACHE.get(cacheKey)
    if (cached) { field === "street" ? setStreetSuggestions(cached) : setAreaSuggestions(cached); return }
    try {
      const q = `${query}, ${city}, Pakistan`
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&countrycodes=pk&accept-language=en`,
        { headers: { "User-Agent": "SmartwearApp/1.0" } }
      )
      const data = await res.json()
      const suggestions: Suggestion[] = data.map((r: any) => ({
        text: r.display_name.split(",").slice(0, 3).join(",").trim(),
        lat: Number(r.lat), lng: Number(r.lon),
      }))
      SUGGEST_CACHE.set(cacheKey, suggestions)
      if (field === "street") setStreetSuggestions(suggestions); else setAreaSuggestions(suggestions)
    } catch {}
  }, [])

  const fetchNearbyLandmarks = useCallback(async (lat: number, lng: number) => {
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`
    const cached = LANDMARK_CACHE.get(cacheKey)
    if (cached) { setNearbyLandmarks(cached); return }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=en`,
        { headers: { "User-Agent": "SmartwearApp/1.0" } }
      )
      const data = await res.json()
      const addr = data?.address || {}
      const nearest = addr.suburb || addr.neighbourhood || addr.road || addr.village || ""
      const landmarks: Suggestion[] = []
      if (nearest) landmarks.push({ text: nearest, lat, lng })
      LANDMARK_CACHE.set(cacheKey, landmarks)
      setNearbyLandmarks(landmarks)
    } catch {}
  }, [])

  const handleSearchChange = (q: string) => {
    setSearchQuery(q); setShowDropdown(false); setSelectedCity(""); setFocusedIdx(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(() => doSearch(q), 300)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length ? results : POPULAR_CITIES.map(c => ({
      lat: c.lat, lng: c.lng, displayName: c.name, city: c.name, type: "city" as const, shortName: c.name
    }))
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusedIdx(i => Math.min(i + 1, items.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setFocusedIdx(i => Math.max(i - 1, -1)) }
    else if (e.key === "Enter" && focusedIdx >= 0 && items[focusedIdx]) { e.preventDefault(); selectPlace(items[focusedIdx]) }
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
        city: normalizeCity(city),
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
    fetchNearbyLandmarks(lat, lng)
  }, [fetchNearbyLandmarks])

  const placePin = useCallback((lat: number, lng: number, city?: string) => {
    setMarkerPos([lat, lng]); setCenter([lat, lng]); setZoom(STREET_ZOOM); setShowSaved(false)
    if (city) setSelectedCity(city)
    setAddressDetail(prev => ({ ...prev, city: city || prev.city }))
    setShowDetailPanel(true); reverseGeocode(lat, lng)
  }, [reverseGeocode])

  const zoomToCity = (lat: number, lng: number, name: string) => {
    setCenter([lat, lng]); setZoom(CITY_ZOOM); setSearchQuery(name)
    setResults([]); setShowDropdown(false); setSelectedCity(name)
    setAddressDetail(prev => ({ ...prev, city: name, province: detectProvince(normalizeCity(name)) }))
    setShowDetailPanel(false)
  }

  const selectPlace = (item: SearchItem) => {
    setSearchQuery(item.shortName); setResults([]); setShowDropdown(false); setFocusedIdx(-1)
    if (item.type === "city") { zoomToCity(item.lat, item.lng, item.city) }
    else { placePin(item.lat, item.lng, item.city) }
  }

  const selectPopularCity = (name: string, lat: number, lng: number) => { zoomToCity(lat, lng, name); setShowDropdown(false) }
  const selectRecentAddress = (addr: AddressMapResult) => { placePin(addr.lat, addr.lng, addr.city) }
  const selectSavedAddress = (saved: SavedAddress) => { placePin(saved.address.lat, saved.address.lng, saved.address.city); setShowSaved(false) }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation is not supported"); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { placePin(pos.coords.latitude, pos.coords.longitude); setGeoLoading(false) },
      () => { setGeoLoading(false); toast.error("Could not get your location.") },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const confirmLocation = async () => {
    if (!markerPos) return
    const [lat, lng] = markerPos
    const { street, area, city, province } = addressDetail
    const finalCity = normalizeCity(city || selectedCity || detectCity(lat, lng) || "Unknown")
    const parts = [street, area, finalCity, province].filter(Boolean)
    const formattedAddress = parts.length > 0 ? parts.join(", ") : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    const result: AddressMapResult = { formattedAddress, city: finalCity, lat, lng }
    saveRecentAddress(result)
    if (saveLabel && finalCity) {
      const saved = [...savedAddresses.filter(s => s.address.city !== finalCity), { label: saveLabel, address: result }]
      setSavedAddresses(saved); saveSavedAddresses(saved)
    }
    onSelect(result)
    setOpen(false); setMarkerPos(null); setResults([]); setSelectedCity("")
    setAddressDetail({ street: "", area: "", city: "", province: "" })
    setShowDetailPanel(false); setSaveLabel(null)
  }

  const handlePin = (lat: number, lng: number) => {
    setMarkerPos([lat, lng]); setCenter([lat, lng]); setZoom(STREET_ZOOM)
    setSelectedCity(""); setShowDetailPanel(true); reverseGeocode(lat, lng)
  }

  const closeModal = () => {
    setOpen(false); setMarkerPos(null); setResults([]); setSelectedCity("")
    setAddressDetail({ street: "", area: "", city: "", province: "" })
    setShowDetailPanel(false); setShowSaved(false); setSaveLabel(null)
    setStreetSuggestions([]); setAreaSuggestions([]); setNearbyLandmarks([])
    setShowCityHelp(false)
  }

  const handleStreetChange = (val: string) => {
    setAddressDetail(p => ({ ...p, street: val }))
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current)
    if (val.length >= 3 && addressDetail.city) {
      setActiveSuggestionField("street")
      suggestDebounceRef.current = setTimeout(() => fetchSuggestions(val, addressDetail.city, "street"), 400)
    } else { setStreetSuggestions([]) }
  }

  const handleAreaChange = (val: string) => {
    setAddressDetail(p => ({ ...p, area: val }))
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current)
    if (val.length >= 3 && addressDetail.city) {
      setActiveSuggestionField("area")
      suggestDebounceRef.current = setTimeout(() => fetchSuggestions(val, addressDetail.city, "area"), 400)
    } else { setAreaSuggestions([]) }
  }

  const applySuggestion = (s: Suggestion, field: "street" | "area") => {
    if (field === "street") { setAddressDetail(p => ({ ...p, street: s.text })); setStreetSuggestions([]) }
    else { setAddressDetail(p => ({ ...p, area: s.text })); setAreaSuggestions([]) }
    setActiveSuggestionField(null)
  }

  const applyLandmark = (s: Suggestion) => {
    setAddressDetail(p => ({ ...p, area: s.text })); setNearbyLandmarks([])
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

  const postexStatus = markerPos && (addressDetail.city || selectedCity) ? getPostexStatus(normalizeCity(addressDetail.city || selectedCity)) : null
  const hasCompleteAddress = addressDetail.street.length > 3 && addressDetail.city.length > 2
  const quality = markerPos ? computeAddressQuality(addressDetail) : null

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
                ><Star className="w-3 h-3" /> Saved{savedAddresses.length > 0 && <span className="text-[9px] text-white/30">({savedAddresses.length})</span>}</button>
                <button
                  type="button" onClick={() => setSatellite(!satellite)}
                  className={`flex items-center gap-1.5 text-[10px] transition-colors px-2.5 py-1.5 rounded-lg ${satellite ? 'bg-[#B8860B]/20 text-[#B8860B]' : 'text-white/50 hover:text-white/70 bg-white/5 hover:bg-white/10'}`}
                  title={satellite ? "Street View" : "Satellite View"}
                ><Layers className="w-3 h-3" />{satellite ? "Satellite" : "Map"}</button>
                <button
                  type="button" onClick={handleUseMyLocation} disabled={geoLoading}
                  className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-[#B8860B] transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg disabled:opacity-40"
                  title="Use my current location"
                ><Navigation className={`w-3 h-3 ${geoLoading ? 'animate-spin' : ''}`} />{geoLoading ? "Locating..." : "My Location"}</button>
                <button onClick={closeModal} className="text-white/40 hover:text-white/70 transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {/* ===== SEARCH BAR ===== */}
            <div className="shrink-0 relative" ref={searchRef}>
              <div className="px-4 sm:px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 focus-within:border-[#B8860B] transition-colors">
                  <Search className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    ref={inputRef} type="text" value={searchQuery}
                    onChange={e => handleSearchChange(e.target.value)}
                    onFocus={() => { if (!searchQuery && !results.length) setShowDropdown(true) }}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search city, area, or street in Pakistan..."
                    className="bg-transparent text-sm text-white placeholder-white/30 focus:outline-none w-full min-w-0"
                  />
                  {searching && <span className="text-[10px] text-white/30 animate-pulse shrink-0">Searching...</span>}
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setResults([]); inputRef.current?.focus() }} className="text-white/30 hover:text-white/60"><X className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>

              {((results.length > 0) || (showDropdown && !searchQuery)) && (
                <div ref={resultsRef} className="absolute top-full left-0 right-0 z-[9999] bg-[#0F1923] border border-white/10 rounded-xl shadow-2xl mx-4 sm:mx-5 max-h-72 overflow-y-auto">
                  {!searchQuery && recentAddresses.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-1.5 sticky top-0 bg-[#0F1923] z-10"><Clock className="w-3 h-3" /> Recent</div>
                      {recentAddresses.map((addr, i) => (
                        <button key={`recent-${i}`} type="button" onClick={() => { selectRecentAddress(addr); setShowDropdown(false) }}
                          className={`w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors flex items-center justify-between truncate ${focusedIdx === i ? 'bg-white/5' : ''}`}>
                          <span className="truncate">{addr.formattedAddress.split(",")[0]}</span>
                          <span className="text-[10px] text-white/30 shrink-0 ml-2">{addr.city}</span>
                        </button>
                      ))}
                      <div className="h-px bg-white/5 mx-3" />
                    </>
                  )}
                  {!searchQuery && (
                    <>
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-white/30 flex items-center gap-1.5 sticky top-0 bg-[#0F1923] z-10"><Star className="w-3 h-3" /> Popular Cities</div>
                      {POPULAR_CITIES.map((c, i) => {
                        const idx = i + (recentAddresses.length > 0 ? recentAddresses.length + 1 : 0)
                        return (
                          <button key={i} type="button" onClick={() => { selectPopularCity(c.name, c.lat, c.lng); setShowDropdown(false) }}
                            className={`w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5 transition-colors flex items-center justify-between ${focusedIdx === idx ? 'bg-white/5' : ''}`}>
                            <span className="flex items-center gap-2">{c.name}{c.postex && <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />}</span>
                            <span className="text-[10px] text-white/30">{c.province}</span>
                          </button>
                        )
                      })}
                    </>
                  )}
                  {results.map((item, i) => {
                    const px = isPostexServiceable(item.city)
                    return (
                      <button key={i} type="button" onClick={() => selectPlace(item)}
                        className={`w-full text-left px-3 py-2.5 text-xs text-white/80 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-start gap-2.5 ${focusedIdx === i ? 'bg-white/5' : ''}`}>
                        <span className={`mt-0.5 ${item.type === "city" ? "text-[#B8860B]" : "text-white/40"}`}>{typeIcon(item.type)}</span>
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
                    attribution={satellite ? '&copy; <a href="https://www.esri.com/">Esri</a>' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
                    url={satellite ? SATELLITE_URL : STREET_URL}
                  />
                  <ChangeView center={center} zoom={zoom} />
                  <MapClickHandler onPin={handlePin} />
                  {markerPos && (
                    <Marker position={markerPos} draggable={true} eventHandlers={{
                      dragend: (e) => { const m = e.target as L.Marker; const pos = m.getLatLng(); setMarkerPos([pos.lat, pos.lng]); reverseGeocode(pos.lat, pos.lng) }
                    }} />
                  )}
                </MapContainer>

                {postexStatus && (
                  <div className={`absolute top-3 left-3 z-[1000] flex items-center gap-1.5 text-[10px] font-medium ${postexStatus.className} bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10`}>
                    {postexStatus.icon}{postexStatus.label}
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
                    <button type="button" onClick={() => placePin(center[0], center[1], selectedCity)}
                      className="flex items-center gap-1.5 text-[10px] font-medium text-white bg-[#B8860B]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-[#B8860B]/30 hover:bg-[#B8860B] transition-colors">
                      <MapPin className="w-3 h-3" /> Drop Pin Here
                    </button>
                  </div>
                )}
                {satellite && (
                  <div className="absolute top-3 right-3 z-[1000] text-[9px] text-white/30 bg-black/60 px-2 py-1 rounded">Satellite</div>
                )}
                {deliveryEta && (
                  <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 text-[10px] text-blue-300 bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10">
                    <Truck className="w-3 h-3" /> {deliveryEta.min}-{deliveryEta.max} business days
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
                  <div className="p-4 sm:p-5 space-y-3">

                    {/* Address Quality */}
                    {quality && (
                      <div className={`flex items-center gap-1.5 text-[10px] ${quality.color}`}>
                        <Sparkles className="w-3 h-3" />
                        {quality.label} ({quality.score}%)
                        {quality.issues.length > 0 && (
                          <span className="text-white/30 ml-1">— {quality.issues[0]}</span>
                        )}
                      </div>
                    )}

                    {/* Street / House */}
                    <div className="relative">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" /> Street / House
                      </label>
                      <input
                        ref={streetRef} type="text" value={addressDetail.street}
                        onChange={e => handleStreetChange(e.target.value)}
                        placeholder="e.g. House #12, Street 5"
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                      {activeSuggestionField === "street" && streetSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[#0F1923] border border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                          {streetSuggestions.map((s, i) => (
                            <button key={i} type="button" onClick={() => applySuggestion(s, "street")}
                              className="w-full text-left px-3 py-2 text-[11px] text-white/70 hover:bg-white/5 hover:text-white transition-colors truncate">
                              {s.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Area / Landmark */}
                    <div className="relative">
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1">
                        <Landmark className="w-2.5 h-2.5" /> Area / Landmark
                      </label>
                      <input
                        ref={areaRef} type="text" value={addressDetail.area}
                        onChange={e => handleAreaChange(e.target.value)}
                        placeholder="e.g. Gulshan-e-Maymar"
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                      {activeSuggestionField === "area" && areaSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-[#0F1923] border border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                          {areaSuggestions.map((s, i) => (
                            <button key={i} type="button" onClick={() => applySuggestion(s, "area")}
                              className="w-full text-left px-3 py-2 text-[11px] text-white/70 hover:bg-white/5 hover:text-white transition-colors truncate">
                              {s.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Nearby Landmarks */}
                    {nearbyLandmarks.length > 0 && (
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-white/30 mb-1 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> Nearby Places
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {nearbyLandmarks.map((s, i) => (
                            <button key={i} type="button" onClick={() => applyLandmark(s)}
                              className="text-[10px] text-white/60 bg-white/5 hover:bg-[#B8860B]/10 hover:text-[#B8860B] border border-white/5 px-2 py-1 rounded-lg transition-colors truncate max-w-full">
                              {s.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* City with normalization */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">City</label>
                      <div className="relative">
                        <input
                          type="text" value={addressDetail.city}
                          onChange={e => {
                            const val = e.target.value
                            setAddressDetail(p => ({ ...p, city: val, province: detectProvince(normalizeCity(val)) || p.province }))
                            setSelectedCity(val)
                          }}
                          onBlur={() => {
                            const normalized = normalizeCity(addressDetail.city)
                            if (normalized !== addressDetail.city) {
                              setAddressDetail(p => ({ ...p, city: normalized, province: detectProvince(normalized) || p.province }))
                              setSelectedCity(normalized)
                            }
                          }}
                          placeholder="City name"
                          className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#B8860B] transition-colors pr-8"
                        />
                        {postexStatus && (
                          <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${postexStatus.className}`}>{postexStatus.icon}</span>
                        )}
                        <button
                          type="button" onClick={() => setShowCityHelp(!showCityHelp)}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
                        ><CircleHelp className="w-3.5 h-3.5" /></button>
                      </div>
                      {showCityHelp && (
                        <div className="mt-1.5 text-[10px] text-white/30 bg-white/5 rounded-lg px-2.5 py-1.5 leading-relaxed">
                          Common spellings work automatically: "karchi" → Karachi, "lhr" → Lahore, "isl" → Islamabad, "rwp" → Rawalpindi, "fsd" → Faisalabad
                        </div>
                      )}
                    </div>

                    {/* Province */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1 block">Province</label>
                      <input type="text" value={addressDetail.province}
                        onChange={e => setAddressDetail(p => ({ ...p, province: e.target.value }))}
                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                    </div>

                    {/* Coordinates */}
                    <div className="text-[9px] text-white/20 font-mono">{markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}</div>

                    {/* PostEx warning */}
                    {postexStatus && !postexStatus.delivers && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-300/80">PostEx does not deliver to this city.</p>
                      </div>
                    )}

                    {/* Delivery ETA */}
                    {deliveryEta && addressDetail.city && (
                      <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2.5">
                        <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-blue-300/90 font-medium">Estimated Delivery</p>
                          <p className="text-[10px] text-blue-200/60">{deliveryEta.min}-{deliveryEta.max} business days via PostEx</p>
                        </div>
                      </div>
                    )}

                    {/* Save address toggle */}
                    <div className="pt-1">
                      <button type="button" onClick={() => setSaveLabel(saveLabel ? null : "Home")}
                        className={`text-[10px] flex items-center gap-1.5 transition-colors ${saveLabel ? 'text-[#B8860B]' : 'text-white/40 hover:text-white/60'}`}>
                        <Star className="w-3 h-3" />{saveLabel ? "Save this address" : "Save this address"}
                      </button>
                      {saveLabel && (
                        <div className="flex gap-2 mt-2">
                          {(["Home", "Office", "Other"] as const).map(label => (
                            <button key={label} type="button" onClick={() => setSaveLabel(label)}
                              className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${saveLabel === label ? 'border-[#B8860B] bg-[#B8860B]/10 text-[#B8860B]' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                              {label === "Home" ? <Home className="w-2.5 h-2.5" /> : label === "Office" ? <Briefcase className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}{label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Address preview */}
                    {hasCompleteAddress && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mb-1"><CheckCircle2 className="w-3 h-3" /> Complete Address</div>
                        <p className="text-[11px] text-white/70 leading-relaxed">
                          {[addressDetail.street, addressDetail.area, normalizeCity(addressDetail.city), addressDetail.province].filter(Boolean).join(", ")}
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
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2"><Star className="w-4 h-4 text-[#B8860B]" /> Saved Addresses</h4>
                    <button onClick={() => setShowSaved(false)} className="text-white/40 hover:text-white/70"><X className="w-4 h-4" /></button>
                  </div>
                  {savedAddresses.length === 0 ? (
                    <div className="px-5 py-8 text-center text-xs text-white/30">No saved addresses yet.</div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {savedAddresses.map((s, i) => (
                        <button key={i} type="button" onClick={() => selectSavedAddress(s)}
                          className="w-full text-left bg-[#141414] hover:bg-white/5 border border-white/5 rounded-xl px-4 py-3 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-[#B8860B] flex items-center gap-1">
                              {s.label === "Home" ? <Home className="w-3 h-3" /> : s.label === "Office" ? <Briefcase className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{s.label}
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
                {markerPos && quality && (
                  <span className={`text-[10px] ${quality.color} flex items-center gap-1`}>
                    <Sparkles className="w-3 h-3" /> {quality.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors">Cancel</button>
                <button type="button" onClick={confirmLocation}
                  disabled={!markerPos || !addressDetail.city}
                  className="px-5 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-black text-xs font-bold rounded-lg hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] transition-all disabled:opacity-40 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Use This Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

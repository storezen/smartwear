"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Navigation, Search, Crosshair } from "lucide-react"
import "leaflet/dist/leaflet.css"

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
  province: string
  lat: number
  lng: number
}

interface SearchResult {
  lat: number
  lng: number
  displayName: string
  city: string
  province: string
}

async function nominatimSearch(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=en`,
      { headers: { "User-Agent": "SmartwearApp/1.0" } }
    )
    const data = await res.json()
    return data.map((r: any) => ({
      lat: Number(r.lat), lng: Number(r.lon),
      displayName: r.display_name,
      city: r.address?.city || r.address?.town || r.address?.village || r.address?.county || "",
      province: r.address?.state || r.address?.region || "",
    }))
  } catch { return [] }
}

async function reverseGeocode(lat: number, lng: number): Promise<SearchResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
      { headers: { "User-Agent": "SmartwearApp/1.0" } }
    )
    const data = await res.json()
    return {
      lat, lng,
      displayName: data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || "",
      province: data?.address?.state || data?.address?.region || "",
    }
  } catch {
    return { lat, lng, displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, city: "", province: "" }
  }
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center[0], center[1], zoom, map])
  return null
}

interface MapClickHandlerProps {
  onPin: (lat: number, lng: number) => void
}
function MapClickHandler({ onPin }: MapClickHandlerProps) {
  useMapEvents({
    click(e) { onPin(e.latlng.lat, e.latlng.lng) },
  })
  return null
}

interface AddressMapProps {
  address: string
  city: string
  onCorrect?: (result: AddressMapResult) => void
  height?: number
}

export default function AddressMap({ address, city, onCorrect, height = 220 }: AddressMapProps) {
  const [center, setCenter] = useState<[number, number]>([30.3753, 69.3451])
  const [zoom, setZoom] = useState(5)
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [popupText, setPopupText] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Initial geocode of the address
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const q = encodeURIComponent(`${address}, ${city}, Pakistan`)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&accept-language=en`,
      { headers: { "User-Agent": "SmartwearApp/1.0" } })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data && data.length > 0) {
          const pos: [number, number] = [Number(data[0].lat), Number(data[0].lon)]
          setCenter(pos)
          setZoom(15)
          setMarkerPos(pos)
          setPopupText(data[0].display_name)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => { cancelled = true }
  }, [address, city])

  // Click on map → reverse geocode → update
  const handleMapPin = async (lat: number, lng: number) => {
    const result = await reverseGeocode(lat, lng)
    setMarkerPos([lat, lng])
    setCenter([lat, lng])
    setZoom(15)
    setPopupText(result.displayName)
    onCorrect?.({
      formattedAddress: result.displayName,
      city: result.city || city,
      province: result.province,
      lat, lng,
    })
  }

  // Search place
  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length < 3) { setSearchResults([]); return }
    setSearching(true)
    const results = await nominatimSearch(q)
    setSearchResults(results)
    setSearching(false)
  }

  const selectSearchResult = (r: SearchResult) => {
    setMarkerPos([r.lat, r.lng])
    setCenter([r.lat, r.lng])
    setZoom(16)
    setPopupText(r.displayName)
    setShowSearch(false)
    setSearchQuery("")
    setSearchResults([])
    onCorrect?.({
      formattedAddress: r.displayName,
      city: r.city || city,
      province: r.province,
      lat: r.lat, lng: r.lng,
    })
  }

  // Close search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center" style={{ height }}>
        <div className="flex flex-col items-center gap-2 text-white/30">
          <Navigation className="w-5 h-5 animate-pulse" />
          <span className="text-xs">Loading map...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      {onCorrect && (
        <div className="relative" ref={searchRef}>
          <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              placeholder="Search location on map..."
              className="bg-transparent text-sm text-white placeholder-white/30 focus:outline-none w-full"
            />
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1923] border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-48 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSearchResult(r)}
                  className="w-full text-left px-3 py-2.5 text-xs text-white/80 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <span className="block truncate">{r.displayName}</span>
                  {(r.city || r.province) && (
                    <span className="text-[10px] text-white/40 mt-0.5 block">
                      {[r.city, r.province].filter(Boolean).join(", ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {showSearch && searching && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1923] border border-white/10 rounded-xl p-3 text-center text-xs text-white/30">
              Searching...
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-white/10 relative" style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={center} zoom={zoom} />
          {markerPos && (
            <Marker
              position={markerPos}
              ref={markerRef}
              draggable={!!onCorrect}
              eventHandlers={{
                dragend: async (e) => {
                  const m = e.target as L.Marker
                  const pos = m.getLatLng()
                  await handleMapPin(pos.lat, pos.lng)
                },
              }}
            >
              <Popup>{popupText}</Popup>
            </Marker>
          )}
          {onCorrect && <MapClickHandler onPin={handleMapPin} />}
        </MapContainer>

        {!markerPos && onCorrect && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            <button
              type="button"
              onClick={() => handleMapPin(center[0], center[1])}
              className="bg-black/80 backdrop-blur-sm border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black/90 transition-colors"
            >
              <Crosshair className="w-3 h-3" /> Pin current location
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Search, X } from "lucide-react"
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
  lat: number
  lng: number
}

interface SearchItem {
  lat: number
  lng: number
  displayName: string
  city: string
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
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([])
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length < 3) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&countrycodes=pk&accept-language=en`,
        { headers: { "User-Agent": "SmartwearApp/1.0" } }
      )
      const data = await res.json()
      setResults(data.map((r: any) => ({
        lat: Number(r.lat), lng: Number(r.lon),
        displayName: r.display_name,
        city: r.address?.city || r.address?.town || r.address?.village || r.address?.county || "",
      })))
    } catch {}
    setSearching(false)
  }

  const selectPlace = (item: SearchItem) => {
    setMarkerPos([item.lat, item.lng])
    setCenter([item.lat, item.lng])
    setZoom(16)
    setResults([])
    setSearchQuery("")
  }

  const confirmLocation = async () => {
    if (!markerPos) return
    const [lat, lng] = markerPos
    let displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    let city = ""
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
        { headers: { "User-Agent": "SmartwearApp/1.0" } }
      )
      const data = await res.json()
      if (data?.display_name) displayName = data.display_name
      city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || ""
    } catch {}
    onSelect({ formattedAddress: displayName, city, lat, lng })
    setOpen(false)
    setMarkerPos(null)
  }

  const handlePin = (lat: number, lng: number) => {
    setMarkerPos([lat, lng])
    setCenter([lat, lng])
    setZoom(16)
  }

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B8860B]" /> Search Location
              </h3>
              <button onClick={() => { setOpen(false); setMarkerPos(null); setResults([]) }} className="text-white/40 hover:text-white/70 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-white/5" ref={searchRef}>
              <div className="relative">
                <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5">
                  <Search className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Search city or area in Pakistan..."
                    className="bg-transparent text-sm text-white placeholder-white/30 focus:outline-none w-full"
                  />
                  {searching && <span className="text-[10px] text-white/30">Searching...</span>}
                </div>
                {results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F1923] border border-white/10 rounded-xl shadow-2xl z-[9999] max-h-56 overflow-y-auto">
                    {results.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectPlace(item)}
                        className="w-full text-left px-3 py-2.5 text-xs text-white/80 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <span className="block truncate">{item.displayName}</span>
                        {item.city && <span className="text-[10px] text-white/40 mt-0.5 block">{item.city}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="h-[400px] relative">
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
                    }
                  }} />
                )}
              </MapContainer>

              {!markerPos && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
                  <p className="text-[10px] bg-black/70 backdrop-blur-sm text-white/50 px-3 py-1.5 rounded-lg border border-white/10">
                    Search a place or click on the map to drop a pin
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => { setOpen(false); setMarkerPos(null); setResults([]) }}
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

"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import { MapPin, Navigation } from "lucide-react"

// Fix Leaflet default marker icon (broken in webpack/Next.js)
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface AddressMapProps {
  address: string
  city: string
  province?: string
  onCoordinateChange?: (lat: number, lng: number, formattedAddress: string) => void
  editable?: boolean
  height?: number
}

interface GeocodingResult {
  lat: number
  lng: number
  displayName: string
}

async function geocode(address: string, city: string): Promise<GeocodingResult | null> {
  const q = encodeURIComponent(`${address}, ${city}, Pakistan`)
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&accept-language=en`, {
      headers: { "User-Agent": "SmartwearApp/1.0" },
    })
    const data = await res.json()
    if (data && data.length > 0) {
      return {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
        displayName: data[0].display_name,
      }
    }
  } catch {}
  return null
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
      { headers: { "User-Agent": "SmartwearApp/1.0" } }
    )
    const data = await res.json()
    return data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}

function MapClickHandler({
  editable,
  onCoordinateChange,
}: {
  editable?: boolean
  onCoordinateChange?: (lat: number, lng: number, formattedAddress: string) => void
}) {
  useMapEvents({
    async click(e) {
      if (!editable || !onCoordinateChange) return
      const { lat, lng } = e.latlng
      const addr = await reverseGeocode(lat, lng)
      onCoordinateChange(lat, lng, addr)
    },
  })
  return null
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center[0], center[1], zoom, map])
  return null
}

export default function AddressMap({
  address,
  city,
  province,
  onCoordinateChange,
  editable = false,
  height = 220,
}: AddressMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tooltip, setTooltip] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    geocode(address, city).then(result => {
      if (cancelled) return
      if (result) {
        setCoords({ lat: result.lat, lng: result.lng })
        setTooltip(result.displayName)
      } else {
        setError(true)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [address, city])

  const handleCoordChange = async (lat: number, lng: number, formattedAddress: string) => {
    setCoords({ lat, lng })
    setTooltip(formattedAddress)
    onCoordinateChange?.(lat, lng, formattedAddress)
  }

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

  if (error || !coords) {
    const provinceCoords: Record<string, [number, number]> = {
      Punjab: [31.5, 74], Sindh: [25, 68], "Khyber Pakhtunkhwa": [34, 72],
      Balochistan: [29, 66], "Islamabad Capital Territory": [33.7, 73],
      "Gilgit-Baltistan": [36, 75], "Azad Kashmir": [34, 74],
    }
    const defaultCoord: [number, number] = province
      ? (provinceCoords[province] || [30.3753, 69.3451])
      : [30.3753, 69.3451]

    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 z-0 rounded-xl overflow-hidden border border-white/10">
          <MapContainer
            center={defaultCoord}
            zoom={5}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={defaultCoord} zoom={5} />
            {editable && onCoordinateChange && (
              <MapClickHandler editable onCoordinateChange={handleCoordChange} />
            )}
          </MapContainer>
        </div>
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-center">
            <MapPin className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xs text-white/70">Address not found on map</p>
            {editable && <p className="text-[10px] text-white/40 mt-1">Click on map to pin the location</p>}
          </div>
        </div>
      </div>
    )
  }

  const position: [number, number] = [coords.lat, coords.lng]

  return (
    <div className="rounded-xl overflow-hidden border border-white/10" style={{ height }}>
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={position} zoom={15} />
        <Marker position={position}>
          <Popup>{tooltip || address}</Popup>
        </Marker>
        {editable && onCoordinateChange && (
          <MapClickHandler editable onCoordinateChange={handleCoordChange} />
        )}
      </MapContainer>
    </div>
  )
}

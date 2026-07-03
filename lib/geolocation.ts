const PAKISTAN_CITIES = [
  { name: "Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "Lahore", lat: 31.5204, lng: 74.3587 },
  { name: "Islamabad", lat: 33.6844, lng: 73.0479 },
  { name: "Rawalpindi", lat: 33.5909, lng: 73.0537 },
  { name: "Faisalabad", lat: 31.4504, lng: 73.1350 },
  { name: "Multan", lat: 30.1575, lng: 71.5249 },
  { name: "Peshawar", lat: 34.0151, lng: 71.5249 },
  { name: "Quetta", lat: 30.1798, lng: 66.9750 },
  { name: "Sialkot", lat: 32.4945, lng: 74.5229 },
  { name: "Gujranwala", lat: 32.1877, lng: 74.1945 },
  { name: "Hyderabad", lat: 25.3960, lng: 68.3578 },
  { name: "Sargodha", lat: 32.0740, lng: 72.6861 },
  { name: "Bahawalpur", lat: 29.3544, lng: 71.6911 },
  { name: "Sukkur", lat: 27.7052, lng: 68.8574 },
  { name: "Larkana", lat: 27.5600, lng: 68.2030 },
  { name: "Mirpur", lat: 33.1402, lng: 73.7525 },
]

const DEGREE_KM = 111.32

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function nearestCity(lat: number, lng: number): string {
  let best = "PK"
  let bestDist = Infinity
  for (const c of PAKISTAN_CITIES) {
    const d = haversineDistance(lat, lng, c.lat, c.lng)
    if (d < bestDist) {
      bestDist = d
      best = c.name
    }
  }
  return bestDist < 100 ? best : "PK"
}

let geoPromise: Promise<string | null> | null = null

function detectCityFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const city = tz.split("/")[1]?.replace(/_/g, " ") || null
    if (city && tz.split("/")[0] === "Asia") return city
  } catch {}
  return "PK"
}

export async function detectCity(): Promise<string> {
  const cached = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("sw_city") : null
  if (cached) return cached

  if (!geoPromise) {
    geoPromise = new Promise<string | null>((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(nearestCity(pos.coords.latitude, pos.coords.longitude)),
        () => resolve(null),
        { timeout: 3000, enableHighAccuracy: false }
      )
    })
  }

  const geoCity = await geoPromise
  if (geoCity) {
    try { sessionStorage.setItem("sw_city", geoCity) } catch {}
    return geoCity
  }

  const tzCity = detectCityFromTimezone()
  try { sessionStorage.setItem("sw_city", tzCity) } catch {}
  return tzCity
}

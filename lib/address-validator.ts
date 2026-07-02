export interface CityEntry {
  name: string
  province: string
  postex: boolean
  lat: number
  lng: number
}

const FALLBACK_CITIES: CityEntry[] = [
  { name: 'Karachi', province: 'Sindh', postex: true, lat: 24.8607, lng: 67.0011 },
  { name: 'Lahore', province: 'Punjab', postex: true, lat: 31.5204, lng: 74.3587 },
  { name: 'Islamabad', province: 'Islamabad Capital Territory', postex: true, lat: 33.6844, lng: 73.0479 },
  { name: 'Rawalpindi', province: 'Punjab', postex: true, lat: 33.5651, lng: 73.0169 },
  { name: 'Faisalabad', province: 'Punjab', postex: true, lat: 31.4504, lng: 73.1350 },
  { name: 'Multan', province: 'Punjab', postex: true, lat: 30.1575, lng: 71.5249 },
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.0150, lng: 71.5249 },
  { name: 'Quetta', province: 'Balochistan', postex: true, lat: 30.1798, lng: 66.9750 },
  { name: 'Hyderabad', province: 'Sindh', postex: true, lat: 25.3960, lng: 68.3578 },
  { name: 'Gujranwala', province: 'Punjab', postex: true, lat: 32.1877, lng: 74.1945 },
  { name: 'Sialkot', province: 'Punjab', postex: true, lat: 32.4945, lng: 74.5228 },
  { name: 'Bahawalpur', province: 'Punjab', postex: true, lat: 29.4020, lng: 71.6757 },
  { name: 'Sargodha', province: 'Punjab', postex: true, lat: 32.0836, lng: 72.6713 },
  { name: 'Sukkur', province: 'Sindh', postex: true, lat: 27.7052, lng: 68.8574 },
  { name: 'Mirpur', province: 'Azad Kashmir', postex: true, lat: 33.1480, lng: 73.7560 },
  { name: 'Gilgit', province: 'Gilgit-Baltistan', postex: true, lat: 35.9200, lng: 74.3100 },
]

let cachedCities: CityEntry[] | null = null
let fetchPromise: Promise<CityEntry[]> | null = null

async function fetchCitiesFromAPI(): Promise<CityEntry[]> {
  try {
    const res = await fetch('/api/cities')
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty data')
    return data.map((c: any) => ({
      name: c.name,
      province: c.province,
      postex: true,
      lat: c.lat || 0,
      lng: c.lng || 0,
    }))
  } catch {
    return FALLBACK_CITIES
  }
}

export function getCachedCities(): CityEntry[] | null {
  return cachedCities
}

export async function loadCities(): Promise<CityEntry[]> {
  if (cachedCities) return cachedCities
  if (fetchPromise) return fetchPromise
  fetchPromise = fetchCitiesFromAPI().then(cities => {
    cachedCities = cities
    fetchPromise = null
    return cities
  })
  return fetchPromise
}

export function getAllCitiesSync(): CityEntry[] {
  return cachedCities || FALLBACK_CITIES
}

export function getAllCities(): CityEntry[] {
  return cachedCities || FALLBACK_CITIES
}

export async function getCitiesByProvince(): Promise<Record<string, CityEntry[]>> {
  const cities = await loadCities()
  const grouped: Record<string, CityEntry[]> = {}
  for (const c of cities) {
    if (!grouped[c.province]) grouped[c.province] = []
    grouped[c.province].push(c)
  }
  return grouped
}

export function getCitiesByProvinceSync(): Record<string, CityEntry[]> {
  const cities = getAllCitiesSync()
  const grouped: Record<string, CityEntry[]> = {}
  for (const c of cities) {
    if (!grouped[c.province]) grouped[c.province] = []
    grouped[c.province].push(c)
  }
  return grouped
}

export function detectProvince(city: string): string {
  const cities = cachedCities || FALLBACK_CITIES
  return cities.find(c => c.name === city)?.province || 'Unknown'
}

export function isPostexServiceable(city: string): boolean {
  return true
}

export function getCityCoordinates(name: string): { lat: number; lng: number } | null {
  const cities = cachedCities || FALLBACK_CITIES
  const city = cities.find(c => c.name === name)
  if (!city || !city.lat) return null
  return { lat: city.lat, lng: city.lng }
}

export interface AddressValidationResult {
  province: string
  postexDelivers: boolean
  isComplete: boolean
  warnings: string[]
}

export function validateAddress(address: {
  address_line1: string
  city: string
  name?: string
  phone?: string
}): AddressValidationResult {
  const warnings: string[] = []
  const province = detectProvince(address.city)
  const postexDelivers = isPostexServiceable(address.city)

  if (!address.address_line1 || address.address_line1.length < 10) {
    warnings.push('Address bohat chota hai. Makaan number aur street laazmi likhein.')
  }
  if (!address.city || address.city.length < 2) {
    warnings.push('City select karein.')
  }
  if (province === 'Unknown' && address.city) {
    warnings.push(`"${address.city}" ka province detect nahi ho saka. Admin manually verify kare.`)
  }

  return {
    province,
    postexDelivers,
    isComplete: warnings.length === 0,
    warnings,
  }
}

export function getPostexCoverageStyle(delivers: boolean) {
  return delivers
    ? { label: 'PostEx Delivers ✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
    : { label: 'PostEx Not Available ✗', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
}

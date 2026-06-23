export interface CityEntry {
  name: string
  province: string
  postex: boolean
  lat: number
  lng: number
}

const CITIES: CityEntry[] = [
  // ── Punjab ──
  { name: 'Lahore', province: 'Punjab', postex: true, lat: 31.5204, lng: 74.3587 },
  { name: 'Faisalabad', province: 'Punjab', postex: true, lat: 31.4504, lng: 73.1350 },
  { name: 'Rawalpindi', province: 'Punjab', postex: true, lat: 33.5651, lng: 73.0169 },
  { name: 'Multan', province: 'Punjab', postex: true, lat: 30.1575, lng: 71.5249 },
  { name: 'Gujranwala', province: 'Punjab', postex: true, lat: 32.1877, lng: 74.1945 },
  { name: 'Sialkot', province: 'Punjab', postex: true, lat: 32.4945, lng: 74.5228 },
  { name: 'Bahawalpur', province: 'Punjab', postex: true, lat: 29.4020, lng: 71.6757 },
  { name: 'Sargodha', province: 'Punjab', postex: true, lat: 32.0836, lng: 72.6713 },
  { name: 'Gujrat', province: 'Punjab', postex: true, lat: 32.5742, lng: 74.0754 },
  { name: 'Sheikhupura', province: 'Punjab', postex: true, lat: 31.7167, lng: 73.9850 },
  { name: 'Rahim Yar Khan', province: 'Punjab', postex: true, lat: 28.4217, lng: 70.2989 },
  { name: 'Jhelum', province: 'Punjab', postex: true, lat: 32.9357, lng: 73.7314 },
  { name: 'Sahiwal', province: 'Punjab', postex: true, lat: 30.6671, lng: 73.1085 },
  { name: 'Okara', province: 'Punjab', postex: true, lat: 30.8093, lng: 73.4457 },
  { name: 'Kasur', province: 'Punjab', postex: true, lat: 31.1156, lng: 74.4464 },
  { name: 'Vehari', province: 'Punjab', postex: true, lat: 30.0450, lng: 72.3518 },
  { name: 'Dera Ghazi Khan', province: 'Punjab', postex: true, lat: 29.9614, lng: 70.4841 },
  { name: 'Chiniot', province: 'Punjab', postex: true, lat: 31.7221, lng: 72.9784 },
  { name: 'Hafizabad', province: 'Punjab', postex: true, lat: 32.0696, lng: 73.6808 },
  { name: 'Mandi Bahauddin', province: 'Punjab', postex: true, lat: 32.5855, lng: 73.4949 },
  { name: 'Narowal', province: 'Punjab', postex: true, lat: 32.1011, lng: 74.8787 },
  { name: 'Layyah', province: 'Punjab', postex: true, lat: 30.9619, lng: 70.9390 },
  { name: 'Bhakkar', province: 'Punjab', postex: true, lat: 31.6262, lng: 71.0647 },
  { name: 'Khushab', province: 'Punjab', postex: true, lat: 32.2956, lng: 72.3504 },
  { name: 'Mianwali', province: 'Punjab', postex: true, lat: 32.5854, lng: 71.5470 },
  { name: 'Chakwal', province: 'Punjab', postex: true, lat: 32.9320, lng: 72.8579 },
  { name: 'Attock', province: 'Punjab', postex: true, lat: 33.7675, lng: 72.3678 },
  { name: 'Pakpattan', province: 'Punjab', postex: true, lat: 30.3438, lng: 73.3874 },
  { name: 'Toba Tek Singh', province: 'Punjab', postex: true, lat: 30.9713, lng: 72.4827 },
  { name: 'Jhang', province: 'Punjab', postex: true, lat: 31.3062, lng: 72.3290 },
  { name: 'Lodhran', province: 'Punjab', postex: true, lat: 29.5404, lng: 71.6328 },
  { name: 'Khanewal', province: 'Punjab', postex: true, lat: 30.3035, lng: 71.9298 },
  { name: 'Muzaffargarh', province: 'Punjab', postex: true, lat: 30.0729, lng: 71.1924 },
  { name: 'Rajanpur', province: 'Punjab', postex: true, lat: 29.1031, lng: 70.3233 },
  { name: 'Nankana Sahib', province: 'Punjab', postex: true, lat: 31.4488, lng: 73.7063 },
  { name: 'Murree', province: 'Punjab', postex: true, lat: 33.9077, lng: 73.3938 },
  { name: 'Hasilpur', province: 'Punjab', postex: true, lat: 29.6965, lng: 72.5560 },
  { name: 'Arifwala', province: 'Punjab', postex: true, lat: 30.2941, lng: 73.0661 },
  { name: 'Kamalia', province: 'Punjab', postex: true, lat: 30.7266, lng: 72.6397 },
  { name: 'Ahmedpur East', province: 'Punjab', postex: true, lat: 29.1450, lng: 71.2600 },
  { name: 'Kot Addu', province: 'Punjab', postex: true, lat: 30.4700, lng: 70.9700 },
  { name: 'Wazirabad', province: 'Punjab', postex: true, lat: 32.4435, lng: 74.1186 },
  { name: 'Burewala', province: 'Punjab', postex: true, lat: 30.1619, lng: 72.6540 },
  { name: 'Talagang', province: 'Punjab', postex: true, lat: 32.9270, lng: 72.4820 },
  { name: 'Pattoki', province: 'Punjab', postex: true, lat: 31.0225, lng: 73.8479 },
  { name: 'Shorkot', province: 'Punjab', postex: true, lat: 30.8261, lng: 72.2469 },
  { name: 'Dunyapur', province: 'Punjab', postex: true, lat: 29.8000, lng: 71.2300 },

  // ── Sindh ──
  { name: 'Karachi', province: 'Sindh', postex: true, lat: 24.8607, lng: 67.0011 },
  { name: 'Hyderabad', province: 'Sindh', postex: true, lat: 25.3960, lng: 68.3578 },
  { name: 'Sukkur', province: 'Sindh', postex: true, lat: 27.7052, lng: 68.8574 },
  { name: 'Larkana', province: 'Sindh', postex: true, lat: 27.5600, lng: 68.2050 },
  { name: 'Nawabshah', province: 'Sindh', postex: true, lat: 26.2442, lng: 68.4100 },
  { name: 'Mirpur Khas', province: 'Sindh', postex: true, lat: 25.5276, lng: 69.0111 },
  { name: 'Khairpur', province: 'Sindh', postex: true, lat: 27.5300, lng: 68.7600 },
  { name: 'Dadu', province: 'Sindh', postex: true, lat: 26.7300, lng: 67.7800 },
  { name: 'Badin', province: 'Sindh', postex: true, lat: 24.6560, lng: 68.8380 },
  { name: 'Thatta', province: 'Sindh', postex: true, lat: 24.7475, lng: 67.9225 },
  { name: 'Tando Adam', province: 'Sindh', postex: true, lat: 25.7667, lng: 68.6667 },
  { name: 'Tando Allahyar', province: 'Sindh', postex: true, lat: 25.4667, lng: 68.7167 },
  { name: 'Sanghar', province: 'Sindh', postex: true, lat: 26.0500, lng: 68.9500 },
  { name: 'Jacobabad', province: 'Sindh', postex: true, lat: 28.2800, lng: 68.4400 },
  { name: 'Shikarpur', province: 'Sindh', postex: true, lat: 27.9600, lng: 68.6500 },
  { name: 'Kandhkot', province: 'Sindh', postex: true, lat: 28.2400, lng: 69.1800 },
  { name: 'Kashmore', province: 'Sindh', postex: true, lat: 28.4300, lng: 69.5800 },
  { name: 'Ghotki', province: 'Sindh', postex: true, lat: 28.0040, lng: 69.3150 },
  { name: 'Umerkot', province: 'Sindh', postex: true, lat: 25.3630, lng: 69.7400 },
  { name: 'Mithi', province: 'Sindh', postex: true, lat: 24.7400, lng: 69.8100 },
  { name: 'Sehwan', province: 'Sindh', postex: true, lat: 26.4200, lng: 67.8600 },
  { name: 'Moro', province: 'Sindh', postex: true, lat: 26.6700, lng: 68.0000 },
  { name: 'Kotri', province: 'Sindh', postex: true, lat: 25.3700, lng: 68.3000 },
  { name: 'Hala', province: 'Sindh', postex: true, lat: 25.8200, lng: 68.4200 },
  { name: 'Rohri', province: 'Sindh', postex: true, lat: 27.6900, lng: 68.9000 },
  { name: 'Ratodero', province: 'Sindh', postex: true, lat: 27.6300, lng: 68.2800 },

  // ── Khyber Pakhtunkhwa ──
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.0150, lng: 71.5249 },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.1500, lng: 73.2200 },
  { name: 'Mardan', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.1980, lng: 72.0440 },
  { name: 'Swat', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.7890, lng: 72.3560 },
  { name: 'Mingora', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.7710, lng: 72.3650 },
  { name: 'Kohat', province: 'Khyber Pakhtunkhwa', postex: true, lat: 33.5900, lng: 71.4400 },
  { name: 'Bannu', province: 'Khyber Pakhtunkhwa', postex: true, lat: 32.9900, lng: 70.6000 },
  { name: 'Dera Ismail Khan', province: 'Khyber Pakhtunkhwa', postex: true, lat: 31.8300, lng: 70.9000 },
  { name: 'Charsadda', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.1400, lng: 71.7400 },
  { name: 'Nowshera', province: 'Khyber Pakhtunkhwa', postex: true, lat: 33.9900, lng: 72.0000 },
  { name: 'Swabi', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.1200, lng: 72.4700 },
  { name: 'Mansehra', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.3300, lng: 73.2000 },
  { name: 'Haripur', province: 'Khyber Pakhtunkhwa', postex: true, lat: 33.9900, lng: 72.9300 },
  { name: 'Battagram', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.6800, lng: 73.0200 },
  { name: 'Timergara', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.8300, lng: 71.8300 },
  { name: 'Hangu', province: 'Khyber Pakhtunkhwa', postex: true, lat: 33.5300, lng: 71.0600 },
  { name: 'Karak', province: 'Khyber Pakhtunkhwa', postex: true, lat: 33.1200, lng: 71.0800 },
  { name: 'Tank', province: 'Khyber Pakhtunkhwa', postex: true, lat: 32.2200, lng: 70.3800 },
  { name: 'Lakki Marwat', province: 'Khyber Pakhtunkhwa', postex: true, lat: 32.6100, lng: 70.9100 },
  { name: 'Chitral', province: 'Khyber Pakhtunkhwa', postex: true, lat: 35.8500, lng: 71.7900 },
  { name: 'Topi', province: 'Khyber Pakhtunkhwa', postex: true, lat: 34.0700, lng: 72.6200 },

  // ── Balochistan ──
  { name: 'Quetta', province: 'Balochistan', postex: true, lat: 30.1798, lng: 66.9750 },
  { name: 'Gwadar', province: 'Balochistan', postex: true, lat: 25.1264, lng: 62.3228 },
  { name: 'Turbat', province: 'Balochistan', postex: true, lat: 26.0025, lng: 63.0556 },
  { name: 'Khuzdar', province: 'Balochistan', postex: true, lat: 27.8200, lng: 66.6300 },
  { name: 'Chaman', province: 'Balochistan', postex: true, lat: 30.9220, lng: 66.4590 },
  { name: 'Sibi', province: 'Balochistan', postex: true, lat: 29.5500, lng: 67.8800 },
  { name: 'Zhob', province: 'Balochistan', postex: true, lat: 31.3400, lng: 69.4500 },
  { name: 'Loralai', province: 'Balochistan', postex: true, lat: 30.3800, lng: 68.5900 },
  { name: 'Dalbandin', province: 'Balochistan', postex: true, lat: 28.8900, lng: 64.4100 },
  { name: 'Mastung', province: 'Balochistan', postex: true, lat: 29.8000, lng: 66.8500 },
  { name: 'Nushki', province: 'Balochistan', postex: true, lat: 29.5500, lng: 66.0100 },
  { name: 'Panjgur', province: 'Balochistan', postex: true, lat: 26.9700, lng: 64.1000 },
  { name: 'Kalat', province: 'Balochistan', postex: true, lat: 29.0300, lng: 66.5900 },
  { name: 'Lasbela', province: 'Balochistan', postex: true, lat: 26.2100, lng: 66.2900 },
  { name: 'Uthal', province: 'Balochistan', postex: true, lat: 25.8100, lng: 66.6200 },
  { name: 'Dera Murad Jamali', province: 'Balochistan', postex: true, lat: 28.5500, lng: 68.2200 },
  { name: 'Ziarat', province: 'Balochistan', postex: true, lat: 30.3800, lng: 67.7200 },

  // ── Islamabad ──
  { name: 'Islamabad', province: 'Islamabad Capital Territory', postex: true, lat: 33.6844, lng: 73.0479 },

  // ── Gilgit-Baltistan ──
  { name: 'Gilgit', province: 'Gilgit-Baltistan', postex: true, lat: 35.9200, lng: 74.3100 },
  { name: 'Skardu', province: 'Gilgit-Baltistan', postex: true, lat: 35.3000, lng: 75.6300 },
  { name: 'Hunza', province: 'Gilgit-Baltistan', postex: true, lat: 36.3167, lng: 74.6500 },
  { name: 'Nagar', province: 'Gilgit-Baltistan', postex: true, lat: 36.2667, lng: 74.7167 },
  { name: 'Ghizer', province: 'Gilgit-Baltistan', postex: true, lat: 36.1500, lng: 73.9500 },
  { name: 'Diamer', province: 'Gilgit-Baltistan', postex: true, lat: 35.5500, lng: 74.0000 },
  { name: 'Ghanche', province: 'Gilgit-Baltistan', postex: true, lat: 35.4000, lng: 76.0000 },
  { name: 'Astore', province: 'Gilgit-Baltistan', postex: true, lat: 35.3500, lng: 74.8500 },

  // ── Azad Kashmir ──
  { name: 'Muzaffarabad', province: 'Azad Kashmir', postex: true, lat: 34.3700, lng: 73.4700 },
  { name: 'Mirpur', province: 'Azad Kashmir', postex: true, lat: 33.1480, lng: 73.7560 },
  { name: 'Rawalakot', province: 'Azad Kashmir', postex: true, lat: 33.8600, lng: 73.7600 },
  { name: 'Kotli', province: 'Azad Kashmir', postex: true, lat: 33.5200, lng: 73.9200 },
  { name: 'Bhimber', province: 'Azad Kashmir', postex: true, lat: 33.1400, lng: 74.0700 },
  { name: 'Bagh', province: 'Azad Kashmir', postex: true, lat: 33.9800, lng: 73.7900 },
  { name: 'Pallandri', province: 'Azad Kashmir', postex: true, lat: 34.3200, lng: 73.6800 },
  { name: 'Sudhnoti', province: 'Azad Kashmir', postex: true, lat: 34.0200, lng: 73.7300 },
  { name: 'Neelum', province: 'Azad Kashmir', postex: true, lat: 34.6000, lng: 74.9000 },
  { name: 'Haveli', province: 'Azad Kashmir', postex: true, lat: 34.0500, lng: 73.6500 },
]

export function getAllCities(): CityEntry[] {
  return CITIES
}

export function getCitiesByProvince(): Record<string, CityEntry[]> {
  const grouped: Record<string, CityEntry[]> = {}
  for (const c of CITIES) {
    if (!grouped[c.province]) grouped[c.province] = []
    grouped[c.province].push(c)
  }
  return grouped
}

export function detectProvince(city: string): string {
  return CITIES.find(c => c.name === city)?.province || 'Unknown'
}

export function isPostexServiceable(city: string): boolean {
  return CITIES.some(c => c.name === city && c.postex)
}

export function getCityCoordinates(name: string): { lat: number; lng: number } | null {
  const city = CITIES.find(c => c.name === name)
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
  if (!postexDelivers) {
    warnings.push(`PostEx "${address.city}" mein delivery nahi karta. Koi aur courier use karein.`)
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

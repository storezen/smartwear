export interface CityEntry {
  name: string
  province: string
  postex: boolean
}

const CITIES: CityEntry[] = [
  // ── Punjab ──
  { name: 'Lahore', province: 'Punjab', postex: true },
  { name: 'Faisalabad', province: 'Punjab', postex: true },
  { name: 'Rawalpindi', province: 'Punjab', postex: true },
  { name: 'Multan', province: 'Punjab', postex: true },
  { name: 'Gujranwala', province: 'Punjab', postex: true },
  { name: 'Sialkot', province: 'Punjab', postex: true },
  { name: 'Bahawalpur', province: 'Punjab', postex: true },
  { name: 'Sargodha', province: 'Punjab', postex: true },
  { name: 'Gujrat', province: 'Punjab', postex: true },
  { name: 'Sheikhupura', province: 'Punjab', postex: true },
  { name: 'Rahim Yar Khan', province: 'Punjab', postex: true },
  { name: 'Jhelum', province: 'Punjab', postex: true },
  { name: 'Sahiwal', province: 'Punjab', postex: true },
  { name: 'Okara', province: 'Punjab', postex: true },
  { name: 'Kasur', province: 'Punjab', postex: true },
  { name: 'Vehari', province: 'Punjab', postex: true },
  { name: 'Dera Ghazi Khan', province: 'Punjab', postex: true },
  { name: 'Chiniot', province: 'Punjab', postex: true },
  { name: 'Hafizabad', province: 'Punjab', postex: true },
  { name: 'Mandi Bahauddin', province: 'Punjab', postex: true },
  { name: 'Narowal', province: 'Punjab', postex: true },
  { name: 'Layyah', province: 'Punjab', postex: true },
  { name: 'Bhakkar', province: 'Punjab', postex: true },
  { name: 'Khushab', province: 'Punjab', postex: true },
  { name: 'Mianwali', province: 'Punjab', postex: true },
  { name: 'Chakwal', province: 'Punjab', postex: true },
  { name: 'Attock', province: 'Punjab', postex: true },
  { name: 'Pakpattan', province: 'Punjab', postex: true },
  { name: 'Toba Tek Singh', province: 'Punjab', postex: true },
  { name: 'Jhang', province: 'Punjab', postex: true },
  { name: 'Lodhran', province: 'Punjab', postex: true },
  { name: 'Khanewal', province: 'Punjab', postex: true },
  { name: 'Muzaffargarh', province: 'Punjab', postex: true },
  { name: 'Rajanpur', province: 'Punjab', postex: true },
  { name: 'Nankana Sahib', province: 'Punjab', postex: true },
  { name: 'Murree', province: 'Punjab', postex: true },
  { name: 'Hasilpur', province: 'Punjab', postex: true },
  { name: 'Arifwala', province: 'Punjab', postex: true },
  { name: 'Kamalia', province: 'Punjab', postex: true },
  { name: 'Ahmedpur East', province: 'Punjab', postex: true },
  { name: 'Kot Addu', province: 'Punjab', postex: true },
  { name: 'Wazirabad', province: 'Punjab', postex: true },
  { name: 'Burewala', province: 'Punjab', postex: true },
  { name: 'Talagang', province: 'Punjab', postex: true },
  { name: 'Pattoki', province: 'Punjab', postex: true },
  { name: 'Shorkot', province: 'Punjab', postex: true },
  { name: 'Dunyapur', province: 'Punjab', postex: true },

  // ── Sindh ──
  { name: 'Karachi', province: 'Sindh', postex: true },
  { name: 'Hyderabad', province: 'Sindh', postex: true },
  { name: 'Sukkur', province: 'Sindh', postex: true },
  { name: 'Larkana', province: 'Sindh', postex: true },
  { name: 'Nawabshah', province: 'Sindh', postex: true },
  { name: 'Mirpur Khas', province: 'Sindh', postex: true },
  { name: 'Khairpur', province: 'Sindh', postex: true },
  { name: 'Dadu', province: 'Sindh', postex: true },
  { name: 'Badin', province: 'Sindh', postex: true },
  { name: 'Thatta', province: 'Sindh', postex: true },
  { name: 'Tando Adam', province: 'Sindh', postex: true },
  { name: 'Tando Allahyar', province: 'Sindh', postex: true },
  { name: 'Sanghar', province: 'Sindh', postex: true },
  { name: 'Jacobabad', province: 'Sindh', postex: true },
  { name: 'Shikarpur', province: 'Sindh', postex: true },
  { name: 'Kandhkot', province: 'Sindh', postex: true },
  { name: 'Kashmore', province: 'Sindh', postex: true },
  { name: 'Ghotki', province: 'Sindh', postex: true },
  { name: 'Umerkot', province: 'Sindh', postex: true },
  { name: 'Mithi', province: 'Sindh', postex: true },
  { name: 'Sehwan', province: 'Sindh', postex: true },
  { name: 'Moro', province: 'Sindh', postex: true },
  { name: 'Kotri', province: 'Sindh', postex: true },
  { name: 'Hala', province: 'Sindh', postex: true },
  { name: 'Rohri', province: 'Sindh', postex: true },
  { name: 'Ratodero', province: 'Sindh', postex: true },

  // ── Khyber Pakhtunkhwa ──
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Mardan', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Swat', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Mingora', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Kohat', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Bannu', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Dera Ismail Khan', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Charsadda', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Nowshera', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Swabi', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Mansehra', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Haripur', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Battagram', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Timergara', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Hangu', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Karak', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Tank', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Lakki Marwat', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Chitral', province: 'Khyber Pakhtunkhwa', postex: true },
  { name: 'Topi', province: 'Khyber Pakhtunkhwa', postex: true },

  // ── Balochistan ──
  { name: 'Quetta', province: 'Balochistan', postex: true },
  { name: 'Gwadar', province: 'Balochistan', postex: true },
  { name: 'Turbat', province: 'Balochistan', postex: true },
  { name: 'Khuzdar', province: 'Balochistan', postex: true },
  { name: 'Chaman', province: 'Balochistan', postex: true },
  { name: 'Sibi', province: 'Balochistan', postex: true },
  { name: 'Zhob', province: 'Balochistan', postex: true },
  { name: 'Loralai', province: 'Balochistan', postex: true },
  { name: 'Dalbandin', province: 'Balochistan', postex: true },
  { name: 'Mastung', province: 'Balochistan', postex: true },
  { name: 'Nushki', province: 'Balochistan', postex: true },
  { name: 'Panjgur', province: 'Balochistan', postex: true },
  { name: 'Kalat', province: 'Balochistan', postex: true },
  { name: 'Lasbela', province: 'Balochistan', postex: true },
  { name: 'Uthal', province: 'Balochistan', postex: true },
  { name: 'Dera Murad Jamali', province: 'Balochistan', postex: true },
  { name: 'Ziarat', province: 'Balochistan', postex: true },

  // ── Islamabad ──
  { name: 'Islamabad', province: 'Islamabad Capital Territory', postex: true },

  // ── Gilgit-Baltistan ──
  { name: 'Gilgit', province: 'Gilgit-Baltistan', postex: true },
  { name: 'Skardu', province: 'Gilgit-Baltistan', postex: true },
  { name: 'Hunza', province: 'Gilgit-Baltistan', postex: true },
  { name: 'Nagar', province: 'Gilgit-Baltistan', postex: true },
  { name: 'Ghizer', province: 'Gilgit-Baltistan', postex: true },
  { name: 'Diamer', province: 'Gilgit-Baltistan', postex: true },
  { name: 'Ghanche', province: 'Gilgit-Baltistan', postex: true },
  { name: 'Astore', province: 'Gilgit-Baltistan', postex: true },

  // ── Azad Kashmir ──
  { name: 'Muzaffarabad', province: 'Azad Kashmir', postex: true },
  { name: 'Mirpur', province: 'Azad Kashmir', postex: true },
  { name: 'Rawalakot', province: 'Azad Kashmir', postex: true },
  { name: 'Kotli', province: 'Azad Kashmir', postex: true },
  { name: 'Bhimber', province: 'Azad Kashmir', postex: true },
  { name: 'Bagh', province: 'Azad Kashmir', postex: true },
  { name: 'Pallandri', province: 'Azad Kashmir', postex: true },
  { name: 'Sudhnoti', province: 'Azad Kashmir', postex: true },
  { name: 'Neelum', province: 'Azad Kashmir', postex: true },
  { name: 'Haveli', province: 'Azad Kashmir', postex: true },
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

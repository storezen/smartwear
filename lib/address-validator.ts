export const CITY_PROVINCE_MAP: Record<string, string> = {
  // Punjab
  Lahore: 'Punjab',
  Faisalabad: 'Punjab',
  Rawalpindi: 'Punjab',
  Multan: 'Punjab',
  Gujranwala: 'Punjab',
  Sialkot: 'Punjab',
  Bahawalpur: 'Punjab',
  Sargodha: 'Punjab',
  Gujrat: 'Punjab',
  Sheikhupura: 'Punjab',
  RahimYarKhan: 'Punjab',
  'Rahim Yar Khan': 'Punjab',
  Jhelum: 'Punjab',
  Sahiwal: 'Punjab',
  Okara: 'Punjab',
  Kasur: 'Punjab',
  Vehari: 'Punjab',
  DeraGhaziKhan: 'Punjab',
  'Dera Ghazi Khan': 'Punjab',
  Chiniot: 'Punjab',
  Hafizabad: 'Punjab',
  MandiBahauddin: 'Punjab',
  'Mandi Bahauddin': 'Punjab',
  Narowal: 'Punjab',
  Layyah: 'Punjab',
  Bhakkar: 'Punjab',
  Khushab: 'Punjab',
  Mianwali: 'Punjab',
  Chakwal: 'Punjab',
  Attock: 'Punjab',
  Pakpattan: 'Punjab',
  'Toba Tek Singh': 'Punjab',
  Jhang: 'Punjab',
  Lodhran: 'Punjab',
  Khanewal: 'Punjab',
  Muzaffargarh: 'Punjab',
  Rajanpur: 'Punjab',
  'Nankana Sahib': 'Punjab',
  Murree: 'Punjab',
  Hasilpur: 'Punjab',
  Arifwala: 'Punjab',
  Kamalia: 'Punjab',
  'Ahmedpur East': 'Punjab',
  'Kot Addu': 'Punjab',
  Wazirabad: 'Punjab',
  Burewala: 'Punjab',

  // Sindh
  Karachi: 'Sindh',
  Hyderabad: 'Sindh',
  Sukkur: 'Sindh',
  Larkana: 'Sindh',
  Nawabshah: 'Sindh',
  ShaheedBenazirabad: 'Sindh',
  MirpurKhas: 'Sindh',
  'Mirpur Khas': 'Sindh',
  Khairpur: 'Sindh',
  Dadu: 'Sindh',
  Badin: 'Sindh',
  Thatta: 'Sindh',
  TandoAdam: 'Sindh',
  'Tando Adam': 'Sindh',
  TandoAllahyar: 'Sindh',
  'Tando Allahyar': 'Sindh',
  Sanghar: 'Sindh',
  Jacobabad: 'Sindh',
  Shikarpur: 'Sindh',
  Kandhkot: 'Sindh',
  Kashmore: 'Sindh',
  Ghotki: 'Sindh',
  Umerkot: 'Sindh',
  Tharparkar: 'Sindh',
  Mithi: 'Sindh',
  Sehwan: 'Sindh',
  Moro: 'Sindh',
  Kotri: 'Sindh',
  Hala: 'Sindh',

  // Khyber Pakhtunkhwa
  Peshawar: 'Khyber Pakhtunkhwa',
  Abbottabad: 'Khyber Pakhtunkhwa',
  Mardan: 'Khyber Pakhtunkhwa',
  Swat: 'Khyber Pakhtunkhwa',
  Mingora: 'Khyber Pakhtunkhwa',
  Kohat: 'Khyber Pakhtunkhwa',
  Bannu: 'Khyber Pakhtunkhwa',
  'Dera Ismail Khan': 'Khyber Pakhtunkhwa',
  DIKhan: 'Khyber Pakhtunkhwa',
  Charsadda: 'Khyber Pakhtunkhwa',
  Nowshera: 'Khyber Pakhtunkhwa',
  Swabi: 'Khyber Pakhtunkhwa',
  Mansehra: 'Khyber Pakhtunkhwa',
  Haripur: 'Khyber Pakhtunkhwa',
  Battagram: 'Khyber Pakhtunkhwa',
  Timergara: 'Khyber Pakhtunkhwa',
  Hangu: 'Khyber Pakhtunkhwa',
  Karak: 'Khyber Pakhtunkhwa',
  Tank: 'Khyber Pakhtunkhwa',
  'Lakki Marwat': 'Khyber Pakhtunkhwa',
  Chitral: 'Khyber Pakhtunkhwa',

  // Balochistan
  Quetta: 'Balochistan',
  Gwadar: 'Balochistan',
  Turbat: 'Balochistan',
  Khuzdar: 'Balochistan',
  Chaman: 'Balochistan',
  Sibi: 'Balochistan',
  Zhob: 'Balochistan',
  Loralai: 'Balochistan',
  Dalbandin: 'Balochistan',
  Mastung: 'Balochistan',
  Nushki: 'Balochistan',
  Panjgur: 'Balochistan',
  Kalat: 'Balochistan',
  Lasbela: 'Balochistan',
  Uthal: 'Balochistan',
  DeraMuradJamali: 'Balochistan',
  'Dera Murad Jamali': 'Balochistan',
  Ziarat: 'Balochistan',

  // Islamabad
  Islamabad: 'Islamabad Capital Territory',

  // Gilgit-Baltistan
  Gilgit: 'Gilgit-Baltistan',
  Skardu: 'Gilgit-Baltistan',
  Hunza: 'Gilgit-Baltistan',
  Nagar: 'Gilgit-Baltistan',
  Ghizer: 'Gilgit-Baltistan',
  Diamer: 'Gilgit-Baltistan',
  Ghanche: 'Gilgit-Baltistan',
  Astore: 'Gilgit-Baltistan',

  // Azad Kashmir
  Muzaffarabad: 'Azad Kashmir',
  Mirpur: 'Azad Kashmir',
  Rawalakot: 'Azad Kashmir',
  Kotli: 'Azad Kashmir',
  Bhimber: 'Azad Kashmir',
  Bagh: 'Azad Kashmir',
  Pallandri: 'Azad Kashmir',
  Sudhnoti: 'Azad Kashmir',
  Neelum: 'Azad Kashmir',
  Haveli: 'Azad Kashmir',
}

// PostEx delivers to 650+ cities. This is the expanded major cities list.
export const POSTEX_CITIES: string[] = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
  'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
  'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sukkur', 'Abbottabad', 'Sargodha', 'Gujrat',
  'Sheikhupura', 'Rahim Yar Khan', 'RahimYarKhan',
  'Jhelum', 'Sahiwal', 'Okara', 'Kasur', 'Vehari',
  'Dera Ghazi Khan', 'DeraGhaziKhan', 'Chiniot',
  'Hafizabad', 'Mandi Bahauddin', 'Narowal', 'Layyah',
  'Bhakkar', 'Khushab', 'Mianwali', 'Chakwal', 'Attock',
  'Pakpattan', 'Toba Tek Singh', 'Jhang', 'Lodhran',
  'Khanewal', 'Muzaffargarh', 'Rajanpur', 'Nankana Sahib',
  'Murree', 'Hasilpur', 'Arifwala', 'Kamalia',
  'Ahmedpur East', 'Kot Addu', 'Wazirabad', 'Burewala',
  'Larkana', 'Nawabshah', 'ShaheedBenazirabad',
  'Mirpur Khas', 'MirpurKhas', 'Khairpur', 'Dadu', 'Badin',
  'Thatta', 'Tando Adam', 'TandoAdam', 'Tando Allahyar',
  'TandoAllahyar', 'Sanghar', 'Jacobabad', 'Shikarpur',
  'Kandhkot', 'Kashmore', 'Ghotki', 'Umerkot', 'Mithi',
  'Sehwan', 'Moro', 'Kotri', 'Hala',
  'Mardan', 'Swat', 'Mingora', 'Kohat', 'Bannu',
  'Dera Ismail Khan', 'Charsadda', 'Nowshera', 'Swabi',
  'Mansehra', 'Haripur', 'Battagram', 'Timergara', 'Hangu',
  'Karak', 'Tank', 'Lakki Marwat', 'Chitral',
  'Gwadar', 'Turbat', 'Khuzdar', 'Chaman', 'Sibi', 'Zhob',
  'Loralai', 'Dalbandin', 'Mastung', 'Nushki', 'Panjgur',
  'Kalat', 'Lasbela', 'Uthal', 'Dera Murad Jamali', 'Ziarat',
  'Gilgit', 'Skardu', 'Hunza', 'Nagar', 'Ghizer',
  'Diamer', 'Ghanche', 'Astore',
  'Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli',
  'Bhimber', 'Bagh', 'Pallandri', 'Sudhnoti', 'Neelum', 'Haveli',
]

export function detectProvince(city: string): string {
  return CITY_PROVINCE_MAP[city] || 'Unknown'
}

export function isPostexServiceable(city: string): boolean {
  return POSTEX_CITIES.includes(city)
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

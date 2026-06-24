import type { Review } from "@/types"

const FIRST_NAMES = [
  "Ahmed","Sara","Usman","Fatima","Bilal","Ayesha","Tariq","Hira","Rizwan","Maria",
  "Kamran","Zainab","Fahad","Nadia","Imran","Rabia","Hassan","Sadia","Naveed","Sanaullah",
  "Shahid","Iqra","Asif","Saima","Waqas","Tahira","Farhan","Bushra","Adeel","Nida",
  "Haroon","Kanwal","Zain","Rukhsar","Saad","Samina","Yasir","Farzana","Noman","Shazia",
  "Taimoor","Sobia","Junaid","Khadija","Salman","Uzma","Omar","Noreen","Daniyal","Mehwish",
  "Adnan","Shabnam","Zubair","Neelam","Faisal","Arifa","Mohsin","Shama","Waleed","Nasreen",
  "Javed","Shazia","Naeem","Rubina","Ghulam","Parveen","Sajjad","Nasreen","Khalid","Shamim",
  "Pervaiz","Tasneem","Rashid","Shahnaz","Akram","Zubaida","Iftikhar","Farkhanda","Irshad","Shamshad",
  "Mobeen","Nagina","Arslan","Shagufta","Tanveer","Farhat","Rashid","Bilkis","Aamir","Nasira",
  "Zahid","Kausar","Sohail","Amtul","Raja","Bashiran","Ashraf","Riffat","Hameed","Mahjabeen",
  "Nadeem","Shaista","Shafqat","Shakeela","Sultan","Fehmida","Javed","Kishwar","Maqsood","Razia",
  "Anwar","Shamim","Rauf","Sughran","Khalil","Zareen","Fazal","Mumtaz","Ishtiaq","Shafqat",
  "Shabbir","Abida","Iqbal","Pakeeza","Javaid","Zahida","Mushtaq","Saeeda","Manzoor","Shahida",
  "Afzal","Rubina","Tahir","Najma","Saleem","Khalida","Jahangir","Shahina","Aslam","Nargis",
  "Rehan","Fouzia","Irfan","Musarrat","Abrar","Shakila","Shoukat","Shamshad","Riaz","Zakia",
  "Sikandar","Naheed","Sohail","Nargis","Mahmood","Safia","Zafar","Tahira","Murtaza","Shaheen",
  "Junaid","Fozia","Shoaib","Naheed","Aqeel","Shazma","Shafi","Shahana","Tauseef","Nazia",
  "Fawad","Ruqayya","Jamshed","Anila","Shahbaz","Shumaila","Sarfaraz","Shameem","Ijaz","Mariam",
]

const LAST_NAMES = [
  "Khan","Ali","Malik","Ahmed","Hassan","Hussain","Iqbal","Shaikh","Qureshi","Rana",
  "Sheikh","Farooq","Raza","Parveen","Ashraf","Butt","Tariq","Abbas","Shaheen","Javed",
  "Chaudhry","Rasheed","Yousaf","Siddiqui","Niazi","Bhatti","Akhtar","Naqvi","Arain","Minhas",
  "Hashmi","Mirza","Syed","Gill","Awan","Kiyani","Ranja","Mughal","Durrani","Tanoli",
  "Jatoi","Leghari","Khokhar","Rajput","Gujjar","Wattoo","Lodhi","Gillani","Qazi","Meo",
  "Janjua","Cheema","Pirzada","Magsi","Sethi","Bajwa","Chohan","Talpur","Sahi","Chandio",
  "Abbasi","Daudpota","Rind","Jaffri","Tur","Siyal","Bhutto","Shar","Buzdar","Langah",
  "Kakar","Mengal","Zehri","Tareen","Mazari","Jogezai","Zardari","Khosa","Magsi","Domki",
  "Agha","Moin","Saad","Rumi","Nasir","Zaman","Haider","Karam","Fazal","Amin",
  "Rahim","Sattar","Sadiq","Waris","Rashid","Saleem","Nazir","Latif","Jabbar","Qadir",
  "Larik","Palijo","Khuhro","Soomro","Abro","Unar","Memon","Korai","Jiskani","Bhayo",
  "Zaman","Khalid","Wahid","Subhan","Tahir","Rauf","Maqsood","Hamid","Majeed","Sajid",
  "Burki","Sherazi","Tirmazi","Faridi","Siddiqi","Qadri","Ansari","Sabri","Suhrawardi","Rizvi",
]

const CITIES = [
  "Lahore","Karachi","Islamabad","Rawalpindi","Faisalabad","Multan","Peshawar","Quetta",
  "Sialkot","Gujranwala","Gujrat","Sargodha","Bahawalpur","Sahiwal","Jhelum","Hyderabad",
  "Sukkur","Abbottabad","Burewala","Mardan","Khanewal","Sheikhupura","Rahim Yar Khan",
  "Jhang","Dera Ghazi Khan","Chiniot","Okara","Mandi Bahauddin","Nawabshah","Murree",
  "Chakwal","Attock","Haripur","Kohat","Bannu","Larkana","Mirpur Khas","Turbat",
  "Kasur","Vehari","Wazirabad","Kamoke","Hafizabad","Hasilpur","Kharian","Daska",
  "Gojra","Mian Channu","Chishtian","Dadu","Jacobabad","Shikarpur","Khairpur","Nowshera",
  "Hasilpur","Lodhran","Pattoki","Samundri","Arifwala","Jaranwala","Toba Tek Singh","Kotli",
  "Bhimber","Mirpur","Muzaffarabad","Swat","Mingora","Chitral","Gilgit","Skardu","Hunza",
]

const TIME_FRAMES = [
  "2 din mein","3 din mein","4 din mein","1 hafte mein","kal hi","parson",
  "do din pehle","teen din pehle","chaar din pehle","1 hafte pehle","10 din mein",
  "2 hafte mein","15 din mein","3 hafte mein","ek mahine mein",
]

const TIME_AGOS = [
  "2 din pehle","3 din pehle","1 hafte pehle","do hafte pehle","15 din pehle",
  "ek mahine pehle","2 mahine pehle","3 mahine pehle","kuch din pehle",
  "thore din pehle","1 hafte hua","2 hafte hue","1 mahina hua","2 mahine hue", "pichle hafte",
]

const FEATURES_WATCH = [
  "Display","Touch screen","Battery life","BT calling","Health tracking","Heart rate sensor",
  "SPO2 monitor","Sleep tracking","Step counter","Water resistance","Build quality",
  "Screen resolution","UI smoothness","Watch faces","Notification system","Charging speed",
  "Alarm function","Camera control","Music control","GPS tracking","Bluetooth connectivity",
  "Microphone quality","Speaker volume","Vibration motor","Strap quality",
]

const FEATURES_HEADPHONE = [
  "Sound quality","Bass response","Noise cancellation","Mic quality","Comfort level",
  "Build quality","Battery timing","Wireless range","Call clarity","Music experience",
  "Cable quality","Ear cushion","Foldable design","Weight comfort","Volume control",
]

const FEATURES_CHARGER = [
  "Charging speed","Cable length","Build quality","Adapter quality","Fast charging support",
  "Heat management","Compatibility","Port durability","Cable flexibility","Safety protection",
]

const FEATURES_CASE = [
  "Material quality","Grip","Drop protection","Color accuracy","Button accessibility",
  "Camera protection","Raised edges","Slim profile","Design look","Feel in hand",
]

function getFeaturePool(categorySlug: string): string[] {
  const c = categorySlug?.toLowerCase() || ""
  if (c.includes("watch")) return FEATURES_WATCH
  if (c.includes("headphone") || c.includes("earphone") || c.includes("earbud")) return FEATURES_HEADPHONE
  if (c.includes("charger") || c.includes("charging")) return FEATURES_CHARGER
  if (c.includes("case") || c.includes("cover")) return FEATURES_CASE
  return FEATURES_WATCH
}

const DELIVERY_EXPS = [
  "COD ka option hai to bht acha hai open kr k dekh lo phir paise do",
  "Open box delivery ka maza hi kuch aur hai — check kr k phir pay kia",
  "Cash on delivery par liya to koi risk nhi tha",
  "Delivery wala bohat polite tha, product check krwa k phir paise liye",
  "Packaging bohat achi thi, product bilkul safe aya",
  "Free delivery ka option bht acha hai, extra kuch nhi lgana",
  "Open parcel kr k dekha to product bilkul wesa hi tha jesa dikhaya tha",
  "COD ki waja se trust aa gya, pehle check kia phir paise diye",
  "Courier walay ne box open kr k dikhaya, check kia phr paise liye",
  "Open box delivery k baad pay kia to tension free ho gya",
]

const PRICE_REMARKS = [
  "Same product market mein {marketPrice} ka milta hai, yahan bohat sasta mila",
  "Es price mein itna aala product kahi aur nhi milta",
  "Price k hisaab se quality bohat achi hai",
  "Local market se compare kia to 30% bachat hui",
  "Mehnga laga lakin quality dekh k price reasonable lgta hai",
  "Bht aala product hai or price bhi reasonable hai",
  "Paisa vasool product hai bilkul",
  "Is price range mein sb se best option hai ye",
  "Thora mehnga hai lakin quality dekh k lagta nhi k paise zaya gaye",
  "Bht sasta mil gya comparatively",
  "Jitne paise hain us se zyada quality mil rahi hai",
  "Sale price mein lia to aur bhi acha deal mila",
]

const FAMILY_REF = [
  "apni wife k liye","apni biwi k liye","apne husband k liye","apne bhai k liye",
  "apni behn k liye","apne papa k liye","apni ammi k liye","apne beta k liye",
  "apni beti k liye","apne dost k liye","apni sister k liye","apne bf k liye",
  "apne gf k liye","apne cousin k liye","apne bachy k liye","apne nephew k liye",
  "apni niece k liye","apne saas k liye","apne sasur k liye","apne mamoo k liye",
  "apni khala k liye","apne chacha k liye","apne taya k liye","apni phuppo k liye",
]

const PERSONAL_REF = [
  "apne liye","khud k liye","personal use k liye","office k liye","gym k liye",
  "school k liye","college k liye","university k liye","travel k liye","daily use k liye",
]

const FRIEND_REF = [
  "Mere 2 dost","Mere 3 dost","Mere cousin","Mere bhai","Meri behn","Mera dost",
  "Meri friend","Mere roommate","Mere class fellow","Mere colleague",
  "Mere 2 bhaiyon","Mere 3 bhaiyon","Meri 2 friends","Mere 2 cousins",
]

const POSITIVE_ADJS = [
  "bohat aala","bht achi","bohat achi","lajawab","best","excellent","superb",
  "top class","bohat umda","mashallah","bohat premium","solid","outstanding",
  "perfect","wonderful","remarkable","impressive","exceptional","fantastic",
]

const NEGATIVE_ADJS = [
  "thora kamzor","average","theek thaak","utna acha nhi","expected se km",
  "disappointing","frustrating","poor quality","not up to mark",
  "mediocre","below average","unreliable",
]

const VERDICTS_5 = [
  "Highly recommended for everyone 👍",
  "Must buy! 🔥",
  "Bohat achi product hai, sb ko recommend krunga",
  "5 star from my side ⭐⭐⭐⭐⭐",
  "Full satisfaction. Keep up the good work 🚀",
  "Best purchase of the year 🎯",
  "Value for money ✅",
  "Would definitely buy again",
  "Zero regrets. Bohat aala product hai",
  "Ab tak 3 logo ko recommend kr chuka hu sb ne liya or sb ko acha laga",
  "I m very happy with this purchase",
  "Great quality, great price. Highly recommended",
  "One of the best online purchases I've made",
  "Trusted seller, genuine product, fast delivery",
  "Paisa vasool ❤️",
  "Mashallah bohat achi cheez hai",
  "Bohat aala experience tha overall",
  "Sb se best online purchase so far",
  "Keep it up seller! Great work",
  "Dil khush kr dia is product ne",
]

const VERDICTS_4 = [
  "Overall bohat achi hai. 4 star de rha hu 🌟",
  "Recommended for everyone. Thora improvement ho to 5 star",
  "Bohat achi product hai lakin kuch minor issues hain",
  "Overall theek hai. 4 star from my side",
  "Achi product hai, aik dafa try kr k dekhna chahiye",
  "Will recommend to friends and family",
  "Good purchase overall",
  "Muje acha laga, price k hisaab se bohat achi hai",
  "Consistent quality. Second order b same acha tha",
  "Satisfied customer. 4 star must",
]

const VERDICTS_3 = [
  "Theek hai. Price k mutabiq average hai",
  "Kuch khaas nhi lakin kaam chl jaye ga",
  "Mixed feelings. Kuch features achy hain kuch nhi",
  "Average product. Umeed se thora km mila",
  "Theek thaak hai. Zyada expectations na rakho",
  "Price k hisaab se theek hai. Full price pe nhi leta",
  "Kaam chlata hai but premium feel nhi hai",
  "Acha hai lakin aur behtar ho sakta hai",
  "Time k sath pta chle ga kitna tikta hai",
  "Thora improvement ki zaroorat hai",
]

const VERDICTS_2 = [
  "Muje khushi nhi mili is product se 😕",
  "Umeed se km mila. Not fully satisfied",
  "Kuch issues hain jin ki waja se recommend nhi kr sakta",
  "Disappointed. Expected better quality",
  "Paise waste ho gaye. Not worth it",
  "Seller se contact kia lakin response slow tha",
  "Product theek nhi aya jo order kia tha",
  "Quality issues hain. Exchange krwana pare ga",
  "Durability ka concern hai. Nhi tikta zyada",
]

const VERDICTS_1 = [
  "Bohat buri product hai. Na lena kisi ko bhi recommend nhi krta ❌",
  "Waste of money. Poor quality. Highly disappointed",
  "Bht issue hai. Exchange bhi mushkil hai",
  "Product ne 1 hafte mein kaam krna band kr dia",
  "Frustrating experience. Seller ne b help nhi ki",
  "Zero stars. Selling cheap quality at high price",
  "Screen freeze ho gai. Watch dead ho gai",
  "Quality utni achi nhi jitni dikhayi gayi thi",
  "Ghar walon ne b kaha waste of money hai",
]

const POSITIVE_COMMENTS = [
  "{feature} bohat achi hai, {brand} ne acha kaam kia hai",
  "{feature} ka quality top class hai",
  "{feature} ne muje impress kr dia",
  "{feature} ka experience outstanding hai",
  "{feature} bilkul wesa hi kaam krta hai jesa dikhaya tha",
  "{feature} mashaAllah bohat responsive hai",
  "{feature} ki performance dekh k bohat acha laga",
  "{feature} ne mera confidence jit lia",
  "{feature} bohat smooth hai or lag free hai",
  "{feature} ne muje surprise kr dia itna acha nhi socha tha",
]

const NEUTRAL_COMMENTS = [
  "{feature} theek kaam krta hai lakin zyada khaas nhi",
  "{feature} average hai. Kaam chl jata hai",
  "{feature} mein koi masla nhi lakin koi excellence bhi nhi",
  "{feature} theek hai lakin expected se thora km hai",
  "{feature} kaam to krta hai lakin utna smooth nhi jitna socha tha",
  "{feature} mein inconsistency hai. Kabhi acha kabhi average",
  "{feature} acceptable hai is price range mein",
]

const NEGATIVE_COMMENTS = [
  "{feature} bohat kamzor hai. Improvement chahiye",
  "{feature} ne muje disappoint kia",
  "{feature} theek se kaam nhi kr raha",
  "{feature} mein bohot issues hain",
  "{feature} expected se bht km nikla",
  "{feature} ki quality achi nhi hai bilkul",
  "{feature} time k sath kharab ho gya",
  "{feature} ne 1 hafte mein kaam krna band kr dia",
]

const MULTI_ORDER_REF = [
  "Yeh mera {orderNum} order hai is site se. Pehle bhi acha tha ab bhi acha hai",
  "Mene pehle bhi yahan se liya tha, is bar b consistency achi hai",
  "Mene {orderNum} products order kiye hain ab tak, sb achy aaye",
  "Dosri bar order kr rha hu. Trusted seller hai ye",
  "Pehli bar order kia to acha laga, ab dubara mangwaya",
  "Mere {count} dost aur bhaiyon ne b order kia sb ko acha laga",
  "Mene apne ghar k {count} logo k liye alag alag mangwaye",
  "Family mein sab is site se order krte hain ab",
]

const EMOJIS_POS = ["❤️","🔥","✅","🎯","🚀","👌","💯","⭐","🌟","💪","🎉","✨","🏆","💎","⚡","🎊","💫","👑","🔋","📱","⌚","🎧","💝","🛡️"]
const EMOJIS_NEG = ["😕","😞","👎","❌","😤","😫","💔","😭"]

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function hashProductId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

function pickMulti<T>(arr: T[], count: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function generateName(seed: number): string {
  const r = seededRandom(seed)
  const fn = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]
  const ln = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]
  if (r() > 0.7) {
    const mi = LAST_NAMES[Math.floor(r() * 30)]
    return `${fn} ${mi} ${ln}`
  }
  return `${fn} ${ln}`
}

function generateDates(count: number, seed: number): string[] {
  const rand = seededRandom(seed)
  const now = Date.now()
  const twoYears = 2 * 365 * 24 * 60 * 60 * 1000
  const dates: string[] = []
  for (let i = 0; i < count; i++) {
    const offset = rand() * twoYears
    const d = new Date(now - offset)
    dates.push(d.toISOString())
  }
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

function generateReviewText(
  productName: string,
  brand: string,
  categorySlug: string,
  rating: number,
  seed: number
): string {
  const rand = seededRandom(seed)
  const parts: string[] = []
  const features = getFeaturePool(categorySlug)
  const marketPrice = (6000 + Math.floor(rand() * 14000)).toLocaleString()

  const opener = [
    () => `Mene ye ${productName} ${pick(TIME_AGOS, rand)} liya tha.`,
    () => `${pick(TIME_AGOS, rand)} mene ${productName} order kia tha.`,
    () => `${pick(TIME_FRAMES, rand)} ${productName} muje deliver ho gya.`,
    () => `Maine ${productName} ${pick(TIME_AGOS, rand)} purchase kia.`,
    () => `${pick(TIME_AGOS, rand)} ye ${productName} mene liya.`,
    () => `${pick(TIME_AGOS, rand)} ${productName} ka order dia tha, ${pick(TIME_FRAMES, rand)} aa gya.`,
    () => `Mene ${productName} ${pick(TIME_AGOS, rand)} mangwaya or ${pick(TIME_FRAMES, rand)} mil gya.`,
    () => `${pick(TIME_AGOS, rand)} ${productName} ka order place kia tha, bohat jaldi deliver ho gya.`,
    () => `${productName} ${pick(TIME_AGOS, rand)} purchase kia. ${pick(TIME_FRAMES, rand)} deliver ho gya.`,
    () => `Finally ${productName} ${pick(TIME_AGOS, rand)} aa gya. Wait worth tha.`,
  ]

  parts.push(pick(opener, rand)())

  if (rating === 5 || rating === 4) {
    const posCount = 1 + Math.floor(rand() * 2)
    const picked = pickMulti(FEATURES_WATCH, posCount, rand)
    for (const f of picked) {
      const template = pick(POSITIVE_COMMENTS, rand)
      parts.push(template.replace("{feature}", f).replace("{brand}", brand))
    }
    if (rand() > 0.5) {
      parts.push(`Muje ${pick(POSITIVE_ADJS, rand)} laga, ${pick(FAMILY_REF, rand)} bhi ${pick(POSITIVE_ADJS, rand)} laga.`)
    }
    if (rand() > 0.5) {
      parts.push(pick(DELIVERY_EXPS, rand) + ".")
    }
    if (rand() > 0.6) {
      parts.push(pick(PRICE_REMARKS, rand).replace("{marketPrice}", marketPrice))
    }
    if (rand() > 0.7) {
      const orderNum = 2 + Math.floor(rand() * 4)
      const count = 2 + Math.floor(rand() * 3)
      parts.push(pick(MULTI_ORDER_REF, rand).replace("{orderNum}", String(orderNum)).replace("{count}", String(count)))
    }
    parts.push(pick(VERDICTS_5, rand))

  } else if (rating === 3) {
    if (rand() > 0.5) {
      const f = pick(features, rand)
      parts.push(pick(NEUTRAL_COMMENTS, rand).replace("{feature}", f).replace("{brand}", brand))
    }
    if (rand() > 0.4) {
      const f2 = pick(features, rand)
      parts.push(pick(POSITIVE_COMMENTS, rand).replace("{feature}", f2).replace("{brand}", brand))
    }
    if (rand() > 0.5) {
      parts.push(pick(DELIVERY_EXPS, rand) + ".")
    }
    if (rand() > 0.6) {
      parts.push(pick(PRICE_REMARKS, rand).replace("{marketPrice}", marketPrice))
    }
    parts.push(pick(VERDICTS_3, rand))

  } else {
    const negCount = 1 + Math.floor(rand() * 2)
    const picked = pickMulti(features, negCount, rand)
    for (const f of picked) {
      const template = pick(NEGATIVE_COMMENTS, rand)
      parts.push(template.replace("{feature}", f).replace("{brand}", brand))
    }
    if (rand() > 0.4) {
      parts.push(`${pick(TIME_FRAMES, rand)} mein hi problem start ho gai.`)
    }
    if (rand() > 0.5) {
      parts.push("Seller se contact kia to response acha tha lakin resolution time laga.")
    }
    if (rand() > 0.6 && rating === 1) {
      parts.push("Paise waste ho gaye. Koi b recommend nhi kr skta.")
    }
    parts.push(pick(rating === 1 ? VERDICTS_1 : VERDICTS_2, rand))
  }

  if (rand() > 0.6 && parts.length > 1) {
    parts.push(pick(EMOJIS_POS, rand))
  } else if (rating <= 2 && rand() > 0.5) {
    parts.push(pick(EMOJIS_NEG, rand))
  }

  return parts.join(" ")
}

const STORAGE_KEY = "sw-user-reviews"

function getStoredReviews(): Review[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch { return [] }
}

function saveStoredReviews(reviews: Review[]): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews)) } catch {}
}

const sellerResponses = [
  "Thank you for your feedback! We're glad you're enjoying the product. 🙏",
  "Thank you for your honest review. We'll work on improving the quality. ❤️",
  "We appreciate your review! Happy to hear you're satisfied with your purchase.",
  "Sorry to hear about your experience. Please contact our support team.",
  "Thank you for choosing Smartwear! Your feedback motivates us. 🚀",
  "We're sorry for the inconvenience. DM us your details and we'll resolve this.",
  "Thank you for your detailed review! We value your feedback. ⭐",
  "Glad you loved the product! Visit again for more amazing deals.",
]

export function submitReview(review: Omit<Review, "id" | "created_at" | "is_verified">): Review {
  const newReview: Review = {
    ...review,
    id: `user-rev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    is_verified: true,
    created_at: new Date().toISOString(),
  }
  const stored = getStoredReviews()
  stored.push(newReview)
  saveStoredReviews(stored)
  return newReview
}

export function generateProductReviews(
  productId: string,
  categorySlug: string,
  productRating: number,
  reviewsCount: number
): Review[] {
  const baseSeed = hashProductId(productId)
  const productName = productId.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  const brand = "Smartwear"

  const maxReviews = Math.min(reviewsCount || 15, 50)
  const actualCount = Math.max(maxReviews, 3)

  const nameSeed = baseSeed
  const seed = baseSeed + 1000

  const targetDistribution = productRating >= 4.8
    ? [0.80, 0.15, 0.04, 0.01, 0]
    : productRating >= 4.5
    ? [0.65, 0.25, 0.07, 0.02, 0.01]
    : productRating >= 4.0
    ? [0.40, 0.35, 0.15, 0.07, 0.03]
    : productRating >= 3.5
    ? [0.25, 0.30, 0.25, 0.12, 0.08]
    : productRating >= 3.0
    ? [0.15, 0.25, 0.30, 0.20, 0.10]
    : [0.10, 0.15, 0.25, 0.30, 0.20]

  const dates = generateDates(actualCount, seed + 999)

  const generated: Review[] = []
  const usedNames = new Set<string>()

  for (let i = 0; i < actualCount; i++) {
    const reviewSeed = seed + i * 100
    const rand = seededRandom(reviewSeed)

    const roll = rand()
    let cumulative = 0
    let chosenRating = 5
    const ratings = [5, 4, 3, 2, 1]
    for (let r = 0; r < ratings.length; r++) {
      cumulative += targetDistribution[r]
      if (roll <= cumulative) {
        chosenRating = ratings[r]
        break
      }
    }

    let userName = generateName(nameSeed + i * 7 + 3)
    let attempts = 0
    while (usedNames.has(userName) && attempts < 50) {
      userName = generateName(nameSeed + i * 7 + 3 + attempts * 11)
      attempts++
    }
    usedNames.add(userName)

    const comment = generateReviewText(productName, brand, categorySlug, chosenRating, reviewSeed + 50)

    generated.push({
      id: `rev-${productId}-${i}`,
      product_id: productId,
      user_id: `user-${baseSeed % 10000}-${i}`,
      user_name: userName,
      rating: chosenRating,
      title: "",
      comment,
      is_verified: seededRandom(reviewSeed + 200)() > 0.25,
      created_at: dates[i],
      helpful_count: Math.floor(seededRandom(reviewSeed + 300)() * 25),
      seller_response: chosenRating >= 4 && i % 3 === 1
        ? sellerResponses[i % sellerResponses.length]
        : chosenRating <= 2 && i % 2 === 0
          ? sellerResponses[(i + 2) % sellerResponses.length]
          : undefined,
    })
  }

  const userReviews = getStoredReviews().filter(r => r.product_id === productId)
  return [...userReviews, ...generated]
}

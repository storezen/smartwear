import type { Review } from "@/types"

const PAKISTANI_NAMES = [
  "Ahmed Khan", "Sara Ali", "Usman Malik", "Fatima Zahra", "Bilal Hassan",
  "Ayesha Ahmed", "Tariq Mehmood", "Hira Naveed", "Rizwan Qureshi", "Maria Shaikh",
  "Kamran Abbas", "Zainab Tariq", "Fahad Rana", "Nadia Hussain", "Imran Sheikh",
  "Rabia Farooq", "Hassan Raza", "Sadia Parveen", "Naveed Ashraf", "Sanaullah Khan",
  "Shahid Iqbal", "Iqra Javed", "Asif Mahmood", "Saima Batool", "Waqas Ahmed",
  "Tahira Bibi", "Farhan Ali", "Bushra Khalid", "Adeel Akhtar", "Nida Fatima",
  "Haroon Rashid", "Kanwal Shafiq", "Zain Ali", "Rukhsar Bibi", "Saad Ahmed",
  "Samina Yousaf", "Yasir Arafat", "Farzana Ali", "Noman Siddiqui", "Shazia Noreen",
  "Taimoor Chaudhry", "Sobia Rasheed", "Junaid Iqbal", "Khadija Shah", "Salman Butt",
  "Uzma Sultana", "Omar Farooq", "Noreen Akram", "Daniyal Sheikh", "Mehwish Ali",
  "Adnan Rauf", "Shabnam Naz", "Zubair Ahmed", "Neelam Waqar", "Faisal Javed",
  "Arifa Noor", "Mohsin Naqvi", "Shama Parveen", "Waleed Hussain", "Nasreen Iqbal",
]

type ReviewTemplate = { rating: number; text: string }

const SMARTWATCH_REVIEWS: ReviewTemplate[] = [
  { rating: 5, text: "Bht aala watch hai yaar. Mene order kia tha or 2 din mein aa gya. Display bohat achi hai or battery bhi bohat achi chal rahi hai. Open parcel kia to product bht aala tha. Highly recommended 👌" },
  { rating: 5, text: "Mene apni wife k liye liya hai unko bohat acha laga. Layer achi hai or design premium hai. COD ka option hai to tension nhi hai. ❤️" },
  { rating: 4, text: "Quality to achi hai lakin thora price zyada lag raha hai. But overall theek hai. Battery timing achi hai. Features bhi saare kaam kr rahe hain." },
  { rating: 5, text: "Bht achi watch hai. Saare features kaam kr rahe hain. BT calling bht achi hai. Water resistant bhi hai. M impressed 👍" },
  { rating: 5, text: "Delivery bohat fast thi. Product bht aala tha. Packaging bhi achi thi. Open box delivery ka to maza hi aa gya 🎯" },
  { rating: 4, text: "Product acha hai lakin mujhe thora late mila. 3 din lag gaye. But watch in general bht achi hai. Display or design top hai." },
  { rating: 3, text: "Watch to achi hai lakin mujhe expected se thora km mila. Battery timing average hai. Price k hisab se theek hai." },
  { rating: 5, text: "Best watch ever in this price range. Mene 3 dostoon ko recommend kia hai sb ne liya or sb ko acha laga. Bohot zyada value for money hai 🔥" },
  { rating: 5, text: "Mera beta bohat khush hai. Us k liye liya tha school k liye. Features bohat achy hain or design bhi bht aala hai. COD ka option sb se acha hai." },
  { rating: 4, text: "Achi watch hai lakin strap thora kamzor hai. Overall product bht acha hai. Display or features bohat achy hain. 4 star from my side 🌟" },
  { rating: 5, text: "I m very happy with this purchase. Product exactly jesa description mein tha wesa hi mila. Full satisfaction. Keep up the good work 🚀" },
  { rating: 2, text: "Mje thora issue hai is ma. Battery theek ni chal rahi. Or pairing ma bhi problem aa rahi hai. Exchange krwana pare ga." },
  { rating: 5, text: "Bohat aala watch hai. Saare features kaam kr rahe hain. Bht comfortable hai or design bhi lajawab hai. Cash on delivery ka option bht acha hai." },
  { rating: 4, text: "Second watch lia hai is seller se. Pehla bhi acha tha ye bhi acha hai. Battery life achi hai or display bright hai. Recommended 👍" },
  { rating: 5, text: "Mashallah bohat acha product hai. Mene gift kia tha or bohat pasand aya sb ko. Delivery bhi time pr aai or packing bhi achi thi 💯" },
  { rating: 5, text: "Es price ma itna aala watch nhi milta anywhere else. Display quality top hai. BT calling ka feature bohat acha hai. Very happy customer ❤️" },
  { rating: 4, text: "Product acha hai lakin color thora different aya jo mene order kia tha. But overall theek hai. Features achy hain." },
  { rating: 5, text: "Bohat achi quality hai. Mene 3 mahine pehle liya tha ab tak perfect chl raha hai. Battery or display sb acha hai. Highly recommended for everyone ✅" },
  { rating: 3, text: "Average product hai. Kuch features hain jo kaam nhi krte. But price k mutabiq theek hai. COD available hai to check kr k lena." },
  { rating: 5, text: "Excellent watch with premium finishing. Sb se achi baat ye hai k open kr k dekh saktay hain phir pay kr saktay hain. Best policy 👍" },
]

const HEADPHONE_REVIEWS: ReviewTemplate[] = [
  { rating: 5, text: "Sound quality bohat achi hai. Bass bht heavy hai. Mene apne dost k liye bhi mangwaya hai. COD available hai to tension nhi 🔥" },
  { rating: 5, text: "Muje to bohat acha laga. Comfortable bhi hai or sound bhi clear hai. Long hours use kia to bhi aram hai. 5 star 🌟" },
  { rating: 4, text: "Build quality achi hai lakin thora weight zyada hai. But sound quality bohat clear hai. Recommended for music lovers 🎧" },
  { rating: 5, text: "Best headphones in this price range. Noise cancellation bht achi hai. Muje bohat acha laga. Free delivery ka option bht acha hai ✅" },
  { rating: 4, text: "Achy hain but battery timing kam hai. 6-7 hours chlti hai. Sound quality bohat achi hai overall theek hain." },
  { rating: 5, text: "Mene apne bhai k liye liya tha. Wo bohat khush hai. Sound or comfort dono top hai. Price bhi reasonable hai. Must buy! 🚀" },
  { rating: 3, text: "Theek hain lakin utna aala nhi hai jitna socha tha. Average sound quality. Price k hisab se thk hain." },
  { rating: 5, text: "Bohat aala sound hai. Vocals clear hain or bass bhi balanced hai. Muje bohat acha laga. Highly recommended for audiophiles 🎵" },
]

const GENERAL_REVIEWS: ReviewTemplate[] = [
  { rating: 5, text: "Product bohat acha hai. Bht din se dhund raha tha akhir mil gya. COD ka option hai to bht acha hai open kr k dekh lo phir paise do 💯" },
  { rating: 5, text: "Isko gift kiya tha or bohat pasand aya. Quality bhi achi hai or price bhi reasonable hai. Delivery bhi time pr aai ✅" },
  { rating: 4, text: "Mera bhai bol rha hai bht acha hai. Mene use kia to muje bhi acha laga. Highly recommended for everyone. Keep it up 🚀" },
  { rating: 5, text: "First time is site se order kia. Product acha aya or delivery bhi time pr. COD ka option hai to safe hai. Will order again 👍" },
  { rating: 5, text: "Bohat aala experience tha. Product original hai jese description mein tha. Packaging bhi bohat achi thi. 5 star must ⭐⭐⭐⭐⭐" },
  { rating: 4, text: "Quality achi hai lakin shipping thora late hui. Product jo manga tha wahi mila. Overall theek hai. 4 star." },
  { rating: 4, text: "Product description jesa hi mila. Dimensions sahi hain. Material bhi achi quality ka hai. COD ka option sb se best hai." },
  { rating: 5, text: "Bht achi quality hai or price bhi reasonable hai. Mene do baar order kia hai dono bar product acha mila. Trusted seller ✅" },
  { rating: 3, text: "Product theek hai lakin jaldi kharab ho gya. Thora month use kia hai. Warranty claim krna pare ga. Umeed hai theek ho jaye ga." },
  { rating: 5, text: "Mashallah bohat acha product hai. Family k liye liya sab ko bohat acha laga. Free delivery or COD dono options best hain 💯" },
  { rating: 5, text: "Best purchase of the month. Product quality or price dono perfect hain. Delivery bhi time pr or packing bhiht achi thi 🔥" },
  { rating: 4, text: "Product acha hai lakin thora mehnga hai. But quality dekh k price reasonable lagta hai. Ek bar use kro khud pta chl jaye ga." },
  { rating: 5, text: "Bohat achi cheez hai yaar. Mene do order kia hai ek apne liye ek dost k liye. Dono bohat satisfied hain. Thanks for great service 🙌" },
  { rating: 2, text: "Product utna acha nhi hai jitna show kia gaya tha. Thora disappointed hoon. Expected better quality at this price." },
  { rating: 5, text: "I am very satisfied with my purchase. Product exactly as described. Fast delivery and great packaging. Highly recommended seller 🌟" },
  { rating: 4, text: "Acha product hai overall. Kuch minor issues hain but seller ne promptly address kia. Customer service bht achi hai. Will buy again." },
  { rating: 5, text: "Bht aala product hai. Muje bohat acha laga. Sb features kaam kr rahe hain. Open box delivery ka option to best hai. Zero risk 🎯" },
  { rating: 3, text: "Theek thaak hai. Kuch khaas nhi hai but kaam chl jaye ga. Price kam ho to acha tha. Overall 3 star from my side." },
  { rating: 5, text: "Bohat achi quality or bohat achi service. Mene 4 product order kiye hain ab tak sb achy aaye hain. Trusted place to shop ✅" },
  { rating: 4, text: "Product theek hai. Jo dikhaya gaya us se thora different hai but overall acceptable hai. COD par liya to koi tension nhi." },
]

const CHARGER_REVIEWS: ReviewTemplate[] = [
  { rating: 5, text: "Charger bohat acha hai. Fast charging support krta hai. Mene apne iPhone k liye liya or perfect hai 🔌" },
  { rating: 4, text: "Acha charger hai lakin cable thora chota hai. But charging speed achi hai. Price bhi reasonable hai." },
  { rating: 5, text: "Original product mila. Mene do baar order kia hai. Dono bar same acha product mila. Highly recommended for everyone." },
  { rating: 5, text: "Bohat achi quality hai. Original jesa hi hai. Fast charging bhi support krta hai. Delivery bhi time pr aai ✅" },
]

const CASE_REVIEWS: ReviewTemplate[] = [
  { rating: 5, text: "Case bohat achi quality ka hai. Phone ma perfectly fit hai. Drop protection bhi achi hai. Recommended for everyone 📱" },
  { rating: 4, text: "Achi case hai lakin thora bulky hai. But protection k liye acha hai. Design bhi achi hai. COD par liya." },
  { rating: 5, text: "Muje bohat acha laga. Material achi quality ka hai or grip bhi achi hai. Mene apne wife k liye bhi mangwaya ❤️" },
  { rating: 5, text: "Best phone case in this price. Bohat aala look deta hai. Protection bhi bohat achi hai. Must buy! 🔥" },
]

const CATEGORY_REVIEW_MAP: Record<string, ReviewTemplate[]> = {
  "smart-watches": SMARTWATCH_REVIEWS,
  "smartwatch": SMARTWATCH_REVIEWS,
  "smartwatches": SMARTWATCH_REVIEWS,
  "headphones": HEADPHONE_REVIEWS,
  "headphone": HEADPHONE_REVIEWS,
  "earphones": HEADPHONE_REVIEWS,
  "earphone": HEADPHONE_REVIEWS,
  "earbuds": HEADPHONE_REVIEWS,
  "charger": CHARGER_REVIEWS,
  "chargers": CHARGER_REVIEWS,
  "charging": CHARGER_REVIEWS,
  "case": CASE_REVIEWS,
  "cases": CASE_REVIEWS,
  "cover": CASE_REVIEWS,
  "covers": CASE_REVIEWS,
}

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

function generateDates(count: number, seed: number): string[] {
  const rand = seededRandom(seed)
  const now = Date.now()
  const oneYear = 365 * 24 * 60 * 60 * 1000
  const dates: string[] = []
  for (let i = 0; i < count; i++) {
    const offset = rand() * oneYear
    const d = new Date(now - offset)
    dates.push(d.toISOString())
  }
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

function pickReviews(
  pool: ReviewTemplate[],
  productRating: number,
  count: number,
  seed: number
): ReviewTemplate[] {
  const rand = seededRandom(seed)

  const targetDistribution = productRating >= 4.8 ? [0.80, 0.15, 0.04, 0.01, 0]
    : productRating >= 4.5 ? [0.65, 0.25, 0.07, 0.02, 0.01]
    : productRating >= 4.0 ? [0.40, 0.35, 0.15, 0.07, 0.03]
    : productRating >= 3.5 ? [0.25, 0.30, 0.25, 0.12, 0.08]
    : productRating >= 3.0 ? [0.15, 0.25, 0.30, 0.20, 0.10]
    : [0.10, 0.15, 0.25, 0.30, 0.20]

  const result: ReviewTemplate[] = []
  const ratings = [5, 4, 3, 2, 1]

  for (let i = 0; i < count; i++) {
    const roll = rand()
    let cumulative = 0
    let chosenRating = 5
    for (let r = 0; r < ratings.length; r++) {
      cumulative += targetDistribution[r]
      if (roll <= cumulative) {
        chosenRating = ratings[r]
        break
      }
    }

    const candidates = pool.filter(r => r.rating === chosenRating)
    if (candidates.length === 0) {
      const fallback = pool[Math.floor(rand() * pool.length)]
      result.push(fallback)
    } else {
      result.push(candidates[Math.floor(rand() * candidates.length)])
    }
  }

  return result
}

export function generateProductReviews(
  productId: string,
  categorySlug: string,
  productRating: number,
  reviewsCount: number
): Review[] {
  const seed = hashProductId(productId)
  const rand = seededRandom(seed)

  const categoryPool = Object.entries(CATEGORY_REVIEW_MAP).find(([key]) =>
    categorySlug?.toLowerCase().includes(key)
  )
  const pool = categoryPool ? categoryPool[1] : GENERAL_REVIEWS
  const fullPool = [...pool, ...GENERAL_REVIEWS]

  const maxReviews = Math.min(reviewsCount || 15, 25)
  const actualCount = Math.max(maxReviews, 3)

  const picked = pickReviews(fullPool, productRating, actualCount, seed + 1)
  const dates = generateDates(actualCount, seed + 2)
  const nameSeed = seededRandom(seed + 3)

  const shuffledNames = [...PAKISTANI_NAMES].sort(() => nameSeed() - 0.5)

  return picked.map((review, index) => ({
    id: `rev-${productId}-${index}`,
    product_id: productId,
    user_id: `user-${seed % 1000}-${index}`,
    user_name: shuffledNames[index % shuffledNames.length],
    rating: review.rating,
    title: "",
    comment: review.text,
    is_verified: nameSeed() > 0.3,
    created_at: dates[index],
  }))
}

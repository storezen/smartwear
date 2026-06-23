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
  "Javed Akhtar", "Shazia Khan", "Naeem Bukhari", "Rubina Faisal", "Ghulam Hussain",
  "Parveen Akhtar", "Sajjad Ali", "Nasreen Anjum", "Khalid Mehmood", "Shamim Bibi",
  "Pervaiz Iqbal", "Tasneem Kausar", "Rashid Minhas", "Shahnaz Begum", "Akram Niazi",
  "Zubaida Khatoon", "Iftikhar Ahmed", "Farkhanda Anjum", "Irshad Bhatti", "Shamshad Akhtar",
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
  { rating: 4, text: "Faced some issues with BT connectivity at first but then it got resolved. Watch in itself is very good for this price range. Display and build quality both are impressive. Would recommend to others looking for a budget smartwatch with good features." },
  { rating: 5, text: "Maine ye watch apne papa ko gift di thi. Wo bohat khush hain. Unki umar 62 hai or unko ye watch bohat pasand aai. Heart rate or steps count bohat achi tarah kaam kr raha hai. Bohat achi product hai seniors k liye." },
  { rating: 1, text: "Bht issue hai is watch ma. 3 din ma screen scratch ho gai. Or battery bhi expected se km chl rhi hai. Mene contact kia to return krne ka kaha but us ma bhi time lge ga. Not happy with this purchase at all." },
  { rating: 5, text: "Bhai maza aagya. Is price range mein itna feature packed watch nhi milta. Mene sara market check kia tha. Ye sb se best hai. BT calling ka feature bohat acha hai jab driving ho to phone nikalne ki zaroorat nhi. ❤️🔥" },
  { rating: 4, text: "Build quality is solid. Watch feels premium on wrist. Only issue is the strap is a bit stiff initially but settles down after a few days of wear. Display quality is really vibrant. Overall a solid purchase for the price." },
  { rating: 5, text: "3 mahine ho gaye use karte huye. Zero issues. Battery aaj bhi 2 din chl jaati hai. Display mein koi scratch nhi aai. Water resistant bhi sahi hai. Maine haath dhoye bhi is k sath. Best decision ever." },
  { rating: 4, text: "Looks are amazing, definitely a head-turner. Muje kaafi compliments mile hain is watch pe. Size perfect hai wrist k liye. Thora heavy hai but aadat ho jati hai. COD par liya to koi risk nhi tha." },
  { rating: 3, text: "Theek hai but utna khaas nhi. Features hain but sab perfectly kaam nhi krte. Health tracking mein thora inconsistency hai. Baaki design acha hai or display bright hai. Price k hisaab se theek." },
  { rating: 5, text: "Delivery experience bht acha tha. Courier walay ne box open kr k dikhaya, check kia phr paise liye. Product as described. Fully satisfied. Mene 2 aur dostoon ko b suggest kia hai. 🎯" },
  { rating: 5, text: "Value for money ka sb se aala example hai ye. Mene 2 mahine research k baad liya hai or bohat acha laga. Saray features kaam kr rahay hain. Seller se b baat hui bht polite or helpful hain." },
  { rating: 4, text: "Battery backup is decent, around 2 days with regular use. Charging cable could be a bit longer but manageable. Display quality is excellent for the price point. Touch response is good. Happy with my purchase." },
  { rating: 5, text: "Mere 3 bhaiyon ne ek saath order kia. Sab ko alag color mangwaye. Sb bohat khush hain. Quality consistent hai har watch mein. Bulk order k liye bht achi deal hai." },
  { rating: 4, text: "Using this as my daily driver for workouts. The SPO2 and heart rate tracking are fairly accurate. Sweat resistance is good. Only wish the GPS was built-in instead of connected. But for the price, can't complain." },
  { rating: 5, text: "Saleem bhai ne recommend kia tha or bohat acha laga. Pehle hesitate kr rha tha online watch lene mein lakin trust ho gya ab. Next watch bhi yahi se lunga. Process bht smooth hai." },
  { rating: 2, text: "Product received but the box was slightly damaged. Watch works fine but I was expecting better packaging for a premium product. Or manual bhi Urdu mein ho to better hota. Thoda disappointment hai." },
  { rating: 5, text: "Mashallah. Bohat achi watch hai. Mera beta daily school k liye pehenta hai. Alarm, timer, steps sab use krta hai. Bohat helpful hai. COD k option ki waja se risk free purchase hai." },
  { rating: 5, text: "Watch came exactly as shown in pictures. Color accuracy is on point. The UI is smooth and the touch screen is responsive. Notifications work perfectly with my Android phone. Highly satisfied." },
  { rating: 4, text: "I was skeptical about the battery claims but it indeed lasts 2 days. Charging takes about 1.5 hours which is reasonable. The watch faces customization is a nice touch. Good product overall." },
  { rating: 5, text: "Bohat aala watch hai yr. Dil khush kr dia. Pehle soch rha tha fake hoga lakin original product mila. Seller bohat acha hai. Or delivery bhi time pr. Keep it up! 🇵🇰" },
  { rating: 5, text: "Got this for my teenage son. He absolutely loves it. The features are cool enough for his age but not too complicated. Parental controls through the app work well. Build quality can handle his active lifestyle." },
  { rating: 4, text: "Watch is good but the app experience could be better. Syncing takes a bit of time. Also the notification display could be improved. Hardware wise, excellent value. Software updates would make it perfect." },
  { rating: 5, text: "Same product Lahore mien 8000 ka mil rha tha. Mujhe yahan 5500 mien mila. Free delivery bhi. Toh bht faida hua. Log market mien overcharge krte hain. Online shopping ka faida uthao." },
  { rating: 3, text: "Middle of the road watch. Theek hai. Kuch features hain jo zaroori hain, kuch missing hain. Build quality achi hai lakin screen thora kamzor lagta hai. Tempered glass lgana pare ga." },
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
  { rating: 4, text: "Using these primarily for work calls. Mic quality is decent. Sound is clear on both ends. Comfortable for long meetings. Battery life could be better though." },
  { rating: 5, text: "Mene 3 different headphones compare kr k ye liya. Sb se aala sound quality hai is mein. Muje music production k liye bhi theek lagta hai casual level pe." },
  { rating: 2, text: "After a month, one side stopped working. Contacted support and they offered replacement but the process was slow. Sound quality was good while it lasted but durability is a concern." },
  { rating: 5, text: "Gym k liye best hai. Secure fit hai or sweat proof bhi. Sound bhi loud enough to hear over gym noise. Cable tangling nhi hoti. Highly recommended for fitness enthusiasts 💪" },
  { rating: 4, text: "Achi quality hai but thora expensive lagta hai similar options k against. However the bass quality is unmatched in this price bracket. So overall a decent deal." },
  { rating: 5, text: "Bohat aala product hai. Mene 2 pair liye hain. Ek ghar k liye ek office k liye. Comfort or sound quality dono top class. Delivery bhi fast thi." },
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
  { rating: 5, text: "Mene soch lia tha k agar product acha hua to review zaroor dunga. Ye product bohat acha hai. Seller se b baat hui unka behavior bht professional hai. Great experience overall." },
  { rating: 4, text: "I don't usually write reviews but this one deserves it. Product is genuine and the pricing is fair. Market mein is se sasta milta to bhi quality na hoti. COD option reduces the risk significantly." },
  { rating: 3, text: "Mixed feelings. Product acha hai lakin delivery process mein masla aya. 4 din lag gaye instead of 2. Support team ne respond kia but late. Product itself is okay for the price." },
  { rating: 5, text: "Genuine product with proper packaging. I compared it with the same item available in a local store and the quality matches. Saving around 30% by ordering online. Very happy with this purchase." },
  { rating: 4, text: "Product is good but I wish there were more color options available. Quality is top notch and delivery was on time. Open box delivery gave me peace of mind. Will recommend to friends." },
  { rating: 5, text: "Second order from here. First time bhi acha tha, is bar bhi acha hai. Consistency matters. Seller seems to genuinely care about quality control. My go-to place now for gadgets." },
  { rating: 2, text: "Product received but it was not exactly what I ordered. Slight variation in design. Could have been a warehouse mix-up. Support team offered return but the process is lengthy. Frustrating experience." },
  { rating: 5, text: "My niece recommended this store to me. She has ordered multiple times. I was hesitant initially being from a smaller city but delivery reached right on time. Trustworthy platform." },
  { rating: 4, text: "Good product at fair price. The only suggestion would be to improve the tracking system. Manual tracking through call is a bit old school. Otherwise everything was smooth." },
  { rating: 5, text: "Villager ho lakin hamara bhi haq hai quality product ka. Ye website se order kr k bohat acha laga. Product bilkul sahi aya. Delivery wala bhi acha tha. Thanks." },
]

const CHARGER_REVIEWS: ReviewTemplate[] = [
  { rating: 5, text: "Charger bohat acha hai. Fast charging support krta hai. Mene apne iPhone k liye liya or perfect hai 🔌" },
  { rating: 4, text: "Acha charger hai lakin cable thora chota hai. But charging speed achi hai. Price bhi reasonable hai." },
  { rating: 5, text: "Original product mila. Mene do baar order kia hai. Dono bar same acha product mila. Highly recommended for everyone." },
  { rating: 5, text: "Bohat achi quality hai. Original jesa hi hai. Fast charging bhi support krta hai. Delivery bhi time pr aai ✅" },
  { rating: 4, text: "Charging speed is good but the cable feels a bit thin. Hopefully it holds up. The adapter is solid though. Muje overall theek laga. Price bhi reasonable hai." },
  { rating: 5, text: "Bht aala charger hai yaar. Fast charging to kamal kr dia. Mera phone 30 min mein 60% charge ho gya. Ek dum original jesa lagta hai. Highly recommended." },
  { rating: 3, text: "Theek hai lakin MFi certified nhi hai. Works fine for now but long term compatibility ka concern hai. Price k mutabiq theek hai. Original Apple charger ka alternative nhi hai." },
  { rating: 5, text: "Mene 2 liye hain ek ghar k liye ek office k liye. Dono perfect kaam kr rahe hain. 1 month ho gya hai. Koi issue nhi. Good value for money product." },
]

const CASE_REVIEWS: ReviewTemplate[] = [
  { rating: 5, text: "Case bohat achi quality ka hai. Phone ma perfectly fit hai. Drop protection bhi achi hai. Recommended for everyone 📱" },
  { rating: 4, text: "Achi case hai lakin thora bulky hai. But protection k liye acha hai. Design bhi achi hai. COD par liya." },
  { rating: 5, text: "Muje bohat acha laga. Material achi quality ka hai or grip bhi achi hai. Mene apne wife k liye bhi mangwaya ❤️" },
  { rating: 5, text: "Best phone case in this price. Bohat aala look deta hai. Protection bhi bohat achi hai. Must buy! 🔥" },
  { rating: 4, text: "Color exactly jesa picture mein tha wesa hai. Material feels premium in hand. Buttons bhi accessible hain. Raised edges protect camera and screen well. Good purchase." },
  { rating: 5, text: "Bohat aala case hai. Mera phone gir gya tha kuch din pehle or case ne bcha lia. Agar case na hota to screen tut jati. Worth every penny. 🛡️" },
  { rating: 3, text: "Design acha hai but thora loose fit hai. Phone thora hilta hai andar. Drop protection to achi hai lakin snug fit hota to better hota. Average experience." },
  { rating: 5, text: "Mene apni sister k liye bhi mangwaya. Us ka phone new tha us ne bohat protect kia. Quality or design dono lajawab hain. Best seller for phone accessories." },
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
  const twoYears = 2 * oneYear
  const dates: string[] = []
  for (let i = 0; i < count; i++) {
    const offset = rand() * twoYears
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
  const seed = hashProductId(productId)

  const categoryPool = Object.entries(CATEGORY_REVIEW_MAP).find(([key]) =>
    categorySlug?.toLowerCase().includes(key)
  )
  const pool = categoryPool ? categoryPool[1] : GENERAL_REVIEWS
  const fullPool = [...pool, ...GENERAL_REVIEWS]

  const maxReviews = Math.min(reviewsCount || 15, 50)
  const actualCount = Math.max(maxReviews, 3)

  const picked = pickReviews(fullPool, productRating, actualCount, seed + 1)
  const dates = generateDates(actualCount, seed + 2)
  const nameSeed = seededRandom(seed + 3)

  const shuffledNames = [...PAKISTANI_NAMES].sort(() => nameSeed() - 0.5)

  const sellerResponses = [
    "Thank you for your feedback! We're glad you're enjoying the product. 🙏",
    "Thank you for your honest review. We'll work on improving the quality. If you need any assistance, please reach out to our support team.",
    "We appreciate your review! Happy to hear you're satisfied with your purchase. ❤️",
    "Sorry to hear about your experience. Please contact our support team and we'll make it right for you.",
    "Thank you for choosing Smartwear! Your feedback motivates us to keep improving. 🚀",
    "We're sorry for the inconvenience. Please DM us your order details and we'll resolve this ASAP.",
  ]

  const generated: Review[] = picked.map((review, index) => ({
    id: `rev-${productId}-${index}`,
    product_id: productId,
    user_id: `user-${seed % 1000}-${index}`,
    user_name: shuffledNames[index % shuffledNames.length],
    rating: review.rating,
    title: "",
    comment: review.text,
    is_verified: nameSeed() > 0.3,
    created_at: dates[index],
    helpful_count: Math.floor(seededRandom(seed + 5 + index)() * 20),
    seller_response: review.rating >= 4 && index % 3 === 1
      ? sellerResponses[index % sellerResponses.length]
      : review.rating <= 2 && index % 2 === 0
        ? sellerResponses[(index + 2) % sellerResponses.length]
        : undefined,
  }))

  const userReviews = getStoredReviews().filter(r => r.product_id === productId)

  return [...userReviews, ...generated]
}

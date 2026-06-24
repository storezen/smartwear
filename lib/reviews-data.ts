import type { Review } from "@/types"

const FIRST_NAMES = [
  "Ahmed","Sara","Usman","Fatima","Bilal","Ayesha","Tariq","Hira","Rizwan","Maria",
  "Kamran","Zainab","Fahad","Nadia","Imran","Rabia","Hassan","Sadia","Naveed","Sana",
  "Shahid","Iqra","Asif","Saima","Waqas","Tahira","Farhan","Bushra","Adeel","Nida",
  "Haroon","Kanwal","Zain","Rukhsar","Saad","Samina","Yasir","Farzana","Noman","Shazia",
  "Taimoor","Sobia","Junaid","Khadija","Salman","Uzma","Omar","Noreen","Daniyal","Mehwish",
  "Adnan","Shabnam","Zubair","Neelam","Faisal","Arifa","Mohsin","Shama","Waleed","Nasreen",
  "Javed","Shazia","Naeem","Rubina","Ghulam","Parveen","Sajjad","Nasreen","Khalid","Shamim",
  "Pervaiz","Tasneem","Rashid","Shahnaz","Akram","Zubaida","Iftikhar","Farkhanda","Irshad",
  "Mobeen","Nagina","Arslan","Shagufta","Tanveer","Farhat","Aamir","Bilkis","Raja","Ashraf",
  "Zahid","Kausar","Sohail","Amtul","Hameed","Mahjabeen","Nadeem","Shaista","Shafqat","Sultan",
  "Fehmida","Maqsood","Razia","Anwar","Rauf","Khalil","Zareen","Fazal","Mumtaz","Ishtiaq",
  "Shabbir","Abida","Pakeeza","Javaid","Zahida","Mushtaq","Saeeda","Manzoor","Shahida","Tahir",
  "Saleem","Khalida","Jahangir","Shahina","Aslam","Rehan","Fouzia","Irfan","Musarrat","Abrar",
  "Shoukat","Riaz","Zakia","Sikandar","Naheed","Mahmood","Safia","Zafar","Murtaza","Shaheen",
  "Shoaib","Aqeel","Shazma","Shafi","Shahana","Tauseef","Nazia","Fawad","Ruqayya","Anila",
  "Shahbaz","Shumaila","Sarfaraz","Ijaz","Mariam","Jahanzeb","Kashif","Yasmeen","Imtiaz",
  "Sajid","Nabeel","Shahana","Ahmad","Haleema","Adil","Mehek","Naeemuddin",
]

const LAST_NAMES = [
  "Khan","Ali","Malik","Ahmed","Hassan","Hussain","Iqbal","Shaikh","Qureshi","Rana",
  "Sheikh","Farooq","Raza","Parveen","Ashraf","Butt","Tariq","Abbas","Shaheen","Javed",
  "Chaudhry","Rasheed","Yousaf","Siddiqui","Niazi","Bhatti","Akhtar","Naqvi","Arain","Minhas",
  "Hashmi","Mirza","Syed","Gill","Awan","Kiyani","Mughal","Durrani","Tanoli",
  "Jatoi","Leghari","Khokhar","Rajput","Gujjar","Wattoo","Lodhi","Gillani","Qazi","Meo",
  "Janjua","Cheema","Pirzada","Magsi","Sethi","Bajwa","Chohan","Talpur","Sahi","Chandio",
  "Abbasi","Rind","Jaffri","Siyal","Bhutto","Shar","Buzdar","Langah",
  "Kakar","Mengal","Zehri","Tareen","Mazari","Zardari","Khosa","Domki",
  "Agha","Nasir","Zaman","Haider","Karam","Fazal","Amin",
  "Rahim","Sattar","Sadiq","Waris","Rashid","Saleem","Nazir","Latif","Jabbar","Qadir",
  "Larik","Khuhro","Soomro","Abro","Memon","Bhayo",
  "Zaman","Khalid","Wahid","Tahir","Rauf","Maqsood","Hamid","Majeed","Sajid",
  "Burki","Sherazi","Tirmazi","Faridi","Siddiqi","Qadri","Ansari","Sabri","Rizvi",
  "Lodhi","Mughal","Kiyani","Kasi","Jiskani","Korai","Chandio","Bhutto","Bugti",
  "Junejo","Bijarani","Rashdi","Lashari","Brohi","Jamali","Marri",
]

function seededRandom(seed: number): () => number {
  return () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646 }
}

function hashProductId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) { const char = id.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash }
  return Math.abs(hash)
}

function pick<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)] }

function generateName(seed: number): string {
  const r = seededRandom(seed)
  const fn = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]
  const ln = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]
  if (r() > 0.75) return `${fn} ${LAST_NAMES[Math.floor(r() * 30)]} ${ln}`
  return `${fn} ${ln}`
}

function generateDates(count: number, seed: number): string[] {
  const rand = seededRandom(seed); const now = Date.now(); const twoYears = 2 * 365 * 24 * 60 * 60 * 1000
  return Array.from({ length: count }, () => new Date(now - rand() * twoYears).toISOString()).sort()
}

type RawReview = { rating: number; text: string }

// ─── 5-STAR REVIEWS (persuasive, purchase-convincing) ────────────────
const R5: RawReview[] = [
  { rating: 5, text: "Mene ye product 2 hafte pehle order kia tha or kal muje deliver ho gya. Open kia to bohat achi lg rhi thi. Display bohat bright hai or touch bhi responsive hai. Saare features kaam kr rahe hain. Battery to 2 din chl gai heavy use mein. Mene market mein yehi 8000 mein dekha tha yahan bohat km mein mil gya. Sb ko recommend krunga." },
  { rating: 5, text: "Main ne pehle kabhi online product nhi liya tha lakin is seller ne trust dia. COD ka option tha to order kr dia. Courier walay ne box open kr k dikhaya, check kia, phir paise liye. Product bilkul wesa hi tha jesa description mein likha tha. Quality bohat achi hai." },
  { rating: 5, text: "Bohat achi product hai yaar. Mene 2 mahine research kr k liya hai or bilkul regret nhi. Sb features kaam kr rahe hain. BT calling driving k time bohat kaam ata hai — phone nikalne ki zaroorat nhi. Battery timing b achi hai 2 din chl jati hai." },
  { rating: 5, text: "Mene ye apne papa ko gift kia. Wo 62 saal k hain or unko bohat acha laga. Heart rate or steps count bohat accurate hai — hospital k machine se compare kia to same readings thi. Bohat achi product hai seniors k liye." },
  { rating: 5, text: "Bhai maza aa gya. Is price range mein itna feature packed product kahi nhi mile ga. Mene sara market check kia tha. Driving k time calls receive krni hoti hain to bohat easy hai. Mene apne 3 dostoon ko recommend kr dia." },
  { rating: 5, text: "Mene 3 mahine pehle liya tha or aaj tak perfect chl rha hai. Zero issues. Battery aaj b 2 din chl jati hai. Display mein koi scratch nhi aai. Water resistant b sahi hai — haath dhoye b is k sath. Mera bhai ne b same liya." },
  { rating: 5, text: "Open box delivery ka experience bohat acha tha. Pehle check kia phir paise diye. Product as shown. Quality bohat achi hai. Jo order kia tha wesa hi mila. Packaging b achi thi. Definitely recommend." },
  { rating: 5, text: "Bohat achi quality hai. Mene do baar order kia hai dono bar acha product mila. Packaging strong thi. COD ka option hai to safe hai. Mene market mein is se 2x price mein dekha hai lakin quality same hai." },
  { rating: 5, text: "Mere 2 bhaiyon ne ek saath order kia. Sab ko alag color mangwaye. Sb bohat khush hain. Quality consistent hai har product mein. Bulk order k liye b achi deal hai." },
  { rating: 5, text: "Kafi research krne k baad ye liya. Sb se achi quality is price range mein. Open box delivery ka option best hai. Product exactly jaisa description tha waisa hi mila. Full satisfaction." },
  { rating: 5, text: "Same product market mein 8000 ka mil rha tha. Mujhe yahan bohat km mein mila. Free delivery bhi. Online shopping ka faida uthao — log market mein overcharge krte hain. Bohat aala deal." },
  { rating: 5, text: "Mene product 2 hafte use kia hai. Display bohat bright hai — ghum mein b achi dikhti hai. Touch responsive hai. Notifications sahi aa rahe hain. Build quality solid hai. Soch rhe ho to le lo, regret nhi hoga." },
  { rating: 5, text: "Bohat achi cheez hai. Mene 5 product order kiye hain ab tak is seller se. Sb achy aaye. Consistency matters. Trust bht important hai online shopping mein or ye seller trustworthy hai." },
  { rating: 5, text: "Mera beta bohat khush hai is product se. School k liye bohat helpful hai — alarm, timer, steps sab use krta hai. Features achy hain or design bhi aala hai. COD k option ki waja se risk free purchase." },
  { rating: 5, text: "Got this for my teenage son. He absolutely loves it. Features are cool but not too complicated. Parental controls through the app work well. Build quality can handle his active lifestyle. Great value." },
  { rating: 5, text: "Meni ye watch apne partner ko gift di thi wo bohat khush hue. Design elegant hai or bohat premium feel ata hai. Calling feature driving k time bohat kaam ata hai. Cash on delivery pe mangwaya to safe tha." },
  { rating: 5, text: "Mene 2 mahine pehle liya tha or aaj tak perfect chl rha hai. Zara bhi problem nhi. Charging sirf 1 ghante mein full ho jati hai. Display scratch resistant hai. Bohat aala product." },
  { rating: 5, text: "Mene apney 2 bachon k liye liya. Dono ko bohat achi lagi. Alarm feature school k liye best hai. Steps count kr k competition krte hain dono. Battery 2 din chl jaati hai heavy use mein." },
  { rating: 5, text: "Saleem bhai ne recommend kia tha or bohat acha laga. Pehle hesitate kr rha tha online lene mein lakin trust ho gya. Next product bhi yahi se lunga. Process bht smooth hai." },
  { rating: 5, text: "Villager ho lakin hamara bhi haq hai quality product ka. Ye website se order kr k bohat acha laga. Product bilkul sahi aya. Delivery wala bhi acha tha. COD tha to pehle check kia phir pay kia." },
  { rating: 5, text: "Watch came exactly as shown in pictures. Color accuracy on point. UI smooth or touch screen responsive. Notifications work perfectly with my phone. Highly satisfied with this purchase." },
  { rating: 5, text: "Bohat aala product hai. Mene 4 product order kiye hain ab tak. Sb achy aaye hain. Seller genuine hai. Ghar walo ne bohat pasand kia. Free delivery or COD dono options best hain." },
  { rating: 5, text: "Bohat achi watch hai. Saare features kaam kr rahe hain. BT calling clear hai — speaker or microphone dono achy hain. Water resistant bhi hai. Display bright hai. Main impressed hoon." },
  { rating: 5, text: "Lahore se hu. Muje 2 din mein delivery mil gai. Watch bohat achi hai. Brand quality excellent hai. Features sab kaam kr rahe hain. Mera bhai ne bhi mangwa li ab." },
  { rating: 5, text: "Quetta se hu. Yahan online shopping ka trust nhi hota lakin COD ki waja se try kia. Product bohat acha aya. Watch premium lgti hai. Neighbors ne b pucha kahan se li. Sab ko recommend kia." },
  { rating: 5, text: "Bohat aala product hai. Dil khush kr dia. Pehle soch rha tha fake hoga lakin original mila. Seller bohat acha hai. Delivery b time pr. Sb ko recommend kr rha hu." },
  { rating: 5, text: "Product bohat achi quality ka hai. Totally satisfied. Mene apne bhai k liye liya tha us ko bohat acha laga. Delivery time pr aai. COD ka option best hai." },
  { rating: 5, text: "First time is site se order kia. Thora hesitant tha lakin COD tha to try kia. Product achi quality ka mila. Delivery b time pr aai. Next time b yahi se lunga. Sb ko recommend krunga." },
  { rating: 5, text: "Bht achi packing thi. Product exactly jesa description mein tha waisa hi mila. Seller ne achi tarah guide kia. Bohat achi quality or price b reasonable hai. Sab ko recommend kr rahi hu." },
  { rating: 5, text: "I was skeptical about battery claims but it indeed lasts 2 days. Charging takes about 1.5 hours. Watch faces customization is a nice touch. Good product overall. Value for money." },
  { rating: 5, text: "Es price mein itna aala product kahi aur nhi mile ga. Mene sara market check kia tha. Ye sb se best hai. COD ka option hai to tension free." },
  { rating: 5, text: "Bohat achi quality hai yaar. Mene 2 mahine pehle liya tha. Charging 1 ghante mein full ho jati hai. Display scratch resistant hai. Features sab kaam kr rahe hain." },
  { rating: 5, text: "Product exactly jaisa description mein tha waisa hi mila. Full satisfaction. Delivery b time pr aai or courier wala b polite tha. COD ka option best hai sb se." },
  { rating: 5, text: "Mene ye meri ammi k liye liya unko heart rate monitor chahiye tha. Bohat accurate hai — hospital k machine se same readings. Blood oxygen b accurate hai. Ammi bohat khush hain." },
  { rating: 5, text: "Mujhe bohat acha laga. Mene apne bhai k liye b mangwaya. Us ko b acha laga. Sb features kaam kr rahe hain. COD available tha to tension nhi thi." },
  { rating: 5, text: "Kafi dino se dhund rha tha. Finally mil gya or bohat achi quality nikli. Delivery fast thi. Product achi quality ka hai. Open box delivery ka maza hi kuch aur hai." },
  // ─── MAX-QUALITY PREMIUM REVIEWS ──────────────────────────────────────
  { rating: 5, text: "Maine ye kafi research k baad liya hai or honestly bohat impressed hu. Display quality bohat vibrant hai with deep colors. Build quality premium feel deti hai haath mein. BT calling ka feature kaam karta hai bilkul clear — driving k time bohat helpful. Battery life 2 din se zyada chl jati hai moderate use mein. Seller ne open box delivery ki thi to pehle check kia phir pay kia. Market mein same product 30% zyada ka hai. Mene apne 4 dostoon ko recommend kia hai or sab ne purchase b kia hai. Sb ko acha laga hai. Agar aap soch rhe hain to le lijiye, regret nhi hoga." },
  { rating: 5, text: "Absolutely amazing product. Mene socha b nhi tha k itne affordable price mein itni premium quality mile gi. Packaging bohat achi thi or product bilkul fresh condition mein aya. Display quality is outstanding — brightness bohat achi hai or touch response bhi smooth hai. Sab features kaam kr rahe hain exactly jaisa bataya gya tha. Health tracking features accurate hain. Muje pehle online shopping ka thora dar lagta tha lakin is seller ne trust build kia. COD ka option hai to aap bilkul tension free ho k order kr sakte hain. Highly recommended for everyone." },
  { rating: 5, text: "Mene ye product apne liye nhi apne father k liye liya tha or unki满意度 ne mera din bna dia. Unki age 65 hai or unko smartwatch use krne mein koi difficulty nhi aai. Setup bohat easy hai. Heart rate, SPO2, steps sab accurate readings de rha hai. Unko bohat acha lag raha hai daily use krna. Main khud impressed hu build quality or design se. COD ka option hai to aap parcel check kr k hi paise dein. Seller ne promised time pe deliver kia. Bohot achi product hai seniors k liye ya gift k liye." },
  { rating: 5, text: "Bht achi product hai. Mene do mahine pehle li thi or aaj tak absolutely perfect chl rhi hai. Zara bhi issue nhi aya. Battery life bohot achi hai — 2 din se zyada chl jati hai. Display bright hai or dhup mein b achi dikhti hai. Water resistant hai to hath dhone ya light rain mein koi issue nhi. Fitness tracking features accurate hain. UI smooth hai or notifications sahi aa rahe hain. Mene apne ghar k 3 aur members k liye b same product order kia hai sb ko bohat acha laga. COD available hai to safe purchase hai. Definitely 5 star." },
  { rating: 5, text: "Muje ye product kafi arse se dekh rha tha finally purchase kia or it was the best decision. Bht aala product hai yaar. Display to bohat hi beautiful hai — colors vibrant hain or brightness bhi achi hai. Music control, camera control, notification alerts sab perfect kaam kr raha hai. Build quality solid hai. Ek baat jo muje sb se achi lagi wo hai open box delivery — aap parcel khol k dekh sakte hain check kr sakte hain aur phir paise de sakte hain. Is se trust build hota hai. Seller bohat professional hai. Next purchase b yahi se krunga." },
  { rating: 5, text: "Waow! Just waow! Mene apni wife k liye anniversary gift k liye liya tha or wo bohat khush hai. Design itna elegant hai k bracelet jaisa lgta hai. Display quality outstanding hai. Features sab kaam kr rahe hain. Lakin sb se achi baat ye hai k ladies k liye b bohat suitable hai — size perfect hai wrist k liye or lightweight bhi hai. COD option tha to maine bina tension k order kia. Delivery on time aai. Packaging bhi bohat achi thi gift k liye. Definitely recommend kr rha hu sab ko." },
]

const R4: RawReview[] = [
  { rating: 4, text: "Product bohat acha hai lakin delivery mein 4 din lag gaye jabke 2 din ka bola tha. But product itself bohat achi quality ka hai. Display vibrant hai. Touch responsive hai. Sirf delivery timing improve krni chahiye." },
  { rating: 4, text: "Quality achi hai lakin price thora zyada lag rha hai compared to similar options. But overall theek hai. Battery timing achi hai. Features saare kaam kr rahe hain. COD ka option best hai." },
  { rating: 4, text: "Achi watch hai lakin strap thora kamzor hai. Baqi sab bohat acha hai. Display or features achy hain. Seller ne b achi service di. 4 star from my side." },
  { rating: 4, text: "Build quality solid hai. Watch feels premium on wrist. Thora heavy hai lakin aadat ho jati hai. Display vibrant hai. Features achy hain. Overall a solid purchase for the price." },
  { rating: 4, text: "Battery backup decent hai around 2 days. Charging cable could be longer but manageable. Display quality excellent for the price. Touch response good. Happy with purchase." },
  { rating: 4, text: "I was skeptical about battery claims but it indeed lasts 2 days. Charging takes about 1.5 hours which is reasonable. Watch faces customization is nice touch. Good overall." },
  { rating: 4, text: "Mene apne bhai k liye liya. Us ko acha laga. Mene b check kia quality achi hai. Sirf ek minor issue tha jo seller ne resolve kr dia. Customer service achi hai." },
  { rating: 4, text: "Product acha hai lakin shipping thora late thi. 2 din mein expected tha 4 din lage. Product itself bohat achi quality ka hai. Packaging b achi thi. Overall recommended." },
  { rating: 4, text: "Value for money hai. Thora improvement ho skta hai lakin jo price hai us k hisaab se bohat achi quality hai. COD ka option best hai. 4 star." },
  { rating: 4, text: "Using this for daily workouts. SPO2 and heart rate fairly accurate. Sweat resistance good. Wish GPS was built-in instead of connected. But for the price can't complain." },
  { rating: 4, text: "Achi watch hai overall. Notifications sahi aa rahe hain. Call quality clear hai. Ek issue ye hai k Urdu notifications properly show nhi hote. Fix karo to 5 star." },
  { rating: 4, text: "Watch achi hai lakin manual Urdu mein b honi chahiye. Hardware wise bohat achi hai — screen strong hai, build quality solid hai. Features achy hain." },
  { rating: 4, text: "Faced some issues with BT connectivity at first but then got resolved. Watch is good for this price range. Display and build quality impressive. Would recommend." },
  { rating: 4, text: "Second order from here. First time bhi acha tha is bar bhi acha hai. Consistency matters. Seller genuinely cares about quality control. My go-to place now." },
  { rating: 4, text: "Color exactly jesa picture mein tha wesa hai. Material premium feel hai haath mein. Buttons accessible hain. Raised edges protect camera and screen well. Good purchase." },
]

// ─── 3-STAR REVIEWS (balanced — good + bad + neutral) ────────────────
const R3: RawReview[] = [
  { rating: 3, text: "Design bohat acha hai or features b theek hain lakin battery timing average hai. Overall koi issue nhi lakin improvements ki gunnjaish hai. COD par liya to risk nhi tha." },
  { rating: 3, text: "Build quality achi hai lakin kuch features utne smooth nhi chlte jitne expect kiye the. Display achi hai or delivery b time pr aai. Price k hisaab se theek hai." },
  { rating: 3, text: "Product to acha hai lakin jesa socha tha utna aala nhi nikla. Design achi hai, features hain lakin performance mein thora gap hai. Kaam chl jata hai." },
  { rating: 3, text: "Looks achy hain or delivery b time pr aai lakin performance mein thora gap hai. Kuch features achy hain kuch average. Overall koi masla nhi." },
  { rating: 3, text: "Quality theek hai. Kuch cheezein achi hain kuch average. Seller bohat acha hai lakin product mein improvement chahiye. Price k hisaab se acceptable." },
  { rating: 3, text: "Display bright hai lakin battery zyada der nhi chlti. Design acha hai. Baqi sab theek hai. COD available tha to check kr k lena." },
  { rating: 3, text: "Watch ka design bohat acha hai lakin expected se thora km mila. Battery timing average hai lakin display achi hai. Price k hisab se theek hai." },
  { rating: 3, text: "Theek hai but utna khaas nhi. Features hain lakin sab perfectly kaam nhi krte. Health tracking mein inconsistency hai lakin overall kaam chl jata hai." },
  { rating: 3, text: "Average product hai. Kuch features kaam nhi krte lakin basic features achy hain. Price k mutabiq theek hai. COD available tha to safe tha." },
  { rating: 3, text: "Middle of the road. Kuch features hain jo zaroori hain kuch missing. Screen thora kamzor lagta hai is liye tempered glass lgana pare ga. Baqi design acha hai." },
  { rating: 3, text: "Not bad but not great either. Quality achi hai lakin expected performance se thora km hai. Seller bohat acha hai or delivery b time pr aai. Product mein thora aur improvement chahiye." },
  { rating: 3, text: "Product theek hai lakin expected se thora km mila. Display quality achi hai lakin battery timing average hai. Kuch features theek se kaam nhi krte lakin basic features achy hain." },
  { rating: 3, text: "Mene do hafte use kia hai. Kuch achi cheezein hain kuch nhi. Build quality achi hai lakin screen thora kamzor lagta hai. Features mein se kuch bohat achy hain jaise display or design." },
  { rating: 3, text: "Sound quality theek hai lakin utna aala nhi jitna socha tha. Comfort acha hai lakin clarity utni achi nhi. Build quality achi hai. Price k hisaab se theek." },
]

// ─── 2-STAR REVIEWS (frustrated but honest) ──────────────────────────
const R2: RawReview[] = [
  { rating: 2, text: "Design bohat acha hai lakin quality utni achi nhi jitni expect ki thi. Ek hafte mein hi issues aane lage. Seller ne help ki lakin time lga. Improvement chahiye." },
  { rating: 2, text: "Jo dikhaya gya us se farq tha. Kaam to kr rha hai lakin waisa nhi jesa socha tha. Looks achy hain lakin performance average hai. Seller ne offer kia help lakin process slow tha." },
  { rating: 2, text: "Looks achy hain lakin material quality theek nhi. Thora time use k baad hi issues aane lage. Pehle to acha laga lakin phir problem start hui. Warranty hai lakin process lamba hai." },
  { rating: 2, text: "Product kaam krta hai lakin jaldi kharab ho gya. Design to acha tha lakin durability ka masla hai. Seller ne help ki lakin resolution mein time lga. Umeed thi k zyada achi hogi." },
  { rating: 2, text: "Product theek hai lakin jitni ummeed thi utna acha nhi nikla. Kuch features kaam nhi krte. Price k mutabiq theek thaak hai lakin is se acha kuch aur available hai." },
  { rating: 2, text: "Design to acha hai lakin battery theek nhi chal rhi. Pairing mein b issue aa rha hai. Seller se baat ki lakin time lge ga resolve honey mein. Product achi lgti hai lakin performance mein masla hai." },
  { rating: 2, text: "Product received but box slightly damaged. Watch works fine lakin expected better packaging for this price. Manual Urdu mein ho to better hota. Quality theek hai lakin presentation improve krni chahiye." },
  { rating: 2, text: "After a month one side stopped working. Sound quality was good while it lasted lakin durability ka concern hai. Support offered replacement but process was slow." },
]

// ─── 1-STAR REVIEWS (genuinely bad experience, but not purely rants) ──
const R1: RawReview[] = [
  { rating: 1, text: "Pehle 2 din to achi chli lakin phir 1 hafte mein screen freeze ho gai. Seller ne warranty ka kaha lakin return process bohat lamba hai. Design achi thi lakin quality issue hai." },
  { rating: 1, text: "Design bohat acha tha lakin quality bohat buri nikli. Jo dikhaya gya wo nhi mila. Seller ne kuch help ki lakin kafi time lga. Kisi ko recommend nhi kr skta." },
  { rating: 1, text: "Shuru mein to acha laga lakin jaldi kharab ho gya. Product ne 1 hafte mein kaam krna band kr dia. Paisay waste ho gaye. Same product kisi aur brand ka lo." },
]

const STORAGE_KEY = "sw-user-reviews"

function getStoredReviews(): Review[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") } catch { return [] }
}

function saveStoredReviews(reviews: Review[]): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews)) } catch {}
}

const sellerResponses = [
  "Thank you for your feedback! We're glad you're enjoying the product. 🙏",
  "Thank you for your honest review. We'll work on improving. ❤️",
  "We appreciate your review! Happy you're satisfied with your purchase.",
  "Sorry to hear about your experience. Please contact our support team.",
  "Thank you for choosing Smartwear! Your feedback motivates us. 🚀",
  "We're sorry for the inconvenience. DM us your details and we'll resolve this.",
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

  const maxReviews = Math.min(reviewsCount || 15, 50)
  const actualCount = Math.max(maxReviews, 6)

  // All products are 4.0+ rated, so distribution stays positive
  const dist = productRating >= 4.8 ? [0.78, 0.14, 0.06, 0.02, 0]
    : productRating >= 4.5 ? [0.60, 0.25, 0.10, 0.04, 0.01]
    : productRating >= 4.3 ? [0.42, 0.30, 0.18, 0.07, 0.03]
    : productRating >= 4.1 ? [0.30, 0.32, 0.22, 0.11, 0.05]
    : [0.25, 0.30, 0.25, 0.13, 0.07]

  const dates = generateDates(actualCount, baseSeed + 999)
  const allReviews = [...R5, ...R4, ...R3, ...R2, ...R1]

  const generated: Review[] = []
  const usedNames = new Set<string>()

  for (let i = 0; i < actualCount; i++) {
    const reviewSeed = baseSeed + i * 100
    const rand = seededRandom(reviewSeed)

    const roll = rand()
    let cumulative = 0
    let chosenRating = 5
    const ratingValues = [5, 4, 3, 2, 1]
    for (let r = 0; r < ratingValues.length; r++) {
      cumulative += dist[r]
      if (roll <= cumulative) { chosenRating = ratingValues[r]; break }
    }

    const candidates = allReviews.filter(rr => rr.rating === chosenRating)
    const text = candidates.length > 0
      ? pick(candidates, rand)
      : { rating: chosenRating, text: "Product theek hai. Overall kaam chl jata hai." }

    let userName = generateName(baseSeed + i * 7 + 3)
    let attempts = 0
    while (usedNames.has(userName) && attempts < 50) {
      userName = generateName(baseSeed + i * 7 + 3 + attempts * 11)
      attempts++
    }
    usedNames.add(userName)

    generated.push({
      id: `rev-${productId}-${i}`,
      product_id: productId,
      user_id: `user-${baseSeed % 10000}-${i}`,
      user_name: userName,
      rating: chosenRating,
      title: "",
      comment: text.text,
      is_verified: seededRandom(reviewSeed + 200)() > 0.25,
      created_at: dates[i],
      helpful_count: Math.floor(seededRandom(reviewSeed + 300)() * 30),
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

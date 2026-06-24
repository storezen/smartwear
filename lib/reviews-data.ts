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
  "Mobeen","Nagina","Arslan","Shagufta","Tanveer","Farhat","Rashid","Bilkis","Aamir","Nasira",
  "Zahid","Kausar","Sohail","Amtul","Raja","Bashiran","Ashraf","Riffat","Hameed","Mahjabeen",
  "Nadeem","Shaista","Shafqat","Shakeela","Sultan","Fehmida","Maqsood","Razia","Anwar","Shamim",
  "Rauf","Sughran","Khalil","Zareen","Fazal","Mumtaz","Ishtiaq","Shafqat","Shabbir","Abida",
  "Iqbal","Pakeeza","Javaid","Zahida","Mushtaq","Saeeda","Manzoor","Shahida","Afzal","Rubina",
  "Tahir","Najma","Saleem","Khalida","Jahangir","Shahina","Aslam","Nargis","Rehan","Fouzia",
  "Irfan","Musarrat","Abrar","Shakila","Shoukat","Riaz","Zakia","Sikandar","Naheed","Sohail",
  "Mahmood","Safia","Zafar","Murtaza","Shaheen","Shoaib","Aqeel","Shazma","Shafi","Shahana",
  "Tauseef","Nazia","Fawad","Ruqayya","Jamshed","Anila","Shahbaz","Shumaila","Sarfaraz","Ijaz",
  "Mariam","Jahanzeb","Kashif","Fareeha","Sajid","Yasmeen","Nabeel","Shahana","Imtiaz","Farkhanda",
  "Ahmad","Zainab","Sikandar","Fazal","Haleema","Shabbir","Farkhanda","Adil","Mehek","Naeemuddin",
]

const LAST_NAMES = [
  "Khan","Ali","Malik","Ahmed","Hassan","Hussain","Iqbal","Shaikh","Qureshi","Rana",
  "Sheikh","Farooq","Raza","Parveen","Ashraf","Butt","Tariq","Abbas","Shaheen","Javed",
  "Chaudhry","Rasheed","Yousaf","Siddiqui","Niazi","Bhatti","Akhtar","Naqvi","Arain","Minhas",
  "Hashmi","Mirza","Syed","Gill","Awan","Kiyani","Mughal","Durrani","Tanoli",
  "Jatoi","Leghari","Khokhar","Rajput","Gujjar","Wattoo","Lodhi","Gillani","Qazi","Meo",
  "Janjua","Cheema","Pirzada","Magsi","Sethi","Bajwa","Chohan","Talpur","Sahi","Chandio",
  "Abbasi","Rind","Jaffri","Tur","Siyal","Bhutto","Shar","Buzdar","Langah",
  "Kakar","Mengal","Zehri","Tareen","Mazari","Zardari","Khosa","Domki",
  "Agha","Moin","Nasir","Zaman","Haider","Karam","Fazal","Amin",
  "Rahim","Sattar","Sadiq","Waris","Rashid","Saleem","Nazir","Latif","Jabbar","Qadir",
  "Larik","Palijo","Khuhro","Soomro","Abro","Memon","Bhayo",
  "Zaman","Khalid","Wahid","Subhan","Tahir","Rauf","Maqsood","Hamid","Majeed","Sajid",
  "Burki","Sherazi","Tirmazi","Faridi","Siddiqi","Qadri","Ansari","Sabri","Rizvi",
  "Lodhi","Mughal","Kiyani","Kasi","Zehri","Jiskani","Korai","Chandio","Bhutto","Bugti",
  "Magsi","Leghari","Khuhro","Junejo","Bijarani","Rashdi","Lashari","Brohi","Jamali","Marri",
]

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

function generateName(seed: number): string {
  const r = seededRandom(seed)
  const fn = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)]
  const ln = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)]
  if (r() > 0.75) {
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

type RawReview = { rating: number; text: string }

// ─── SHORT REVIEWS (1-2 sentences, 5-20 words) ─────────────────────────
const SHORT_5: RawReview[] = [
  { rating: 5, text: "Product bohat achi quality ka hai. Totally satisfied." },
  { rating: 5, text: "Mashallah bohat achi product hai. Sb kaam kr raha hai." },
  { rating: 5, text: "Bht aala product hai. Highly recommended." },
  { rating: 5, text: "Same as shown. Bohat achi quality." },
  { rating: 5, text: "Product bohat acha hai. Delivery b time pr aai." },
  { rating: 5, text: "Jo bola tha woi mila. Bohat achi quality." },
  { rating: 5, text: "Bht acha laga. Totally worth it." },
  { rating: 5, text: "Mashallah. Bohat hi umda product hai." },
  { rating: 5, text: "Product achi quality ka hai. Satisfied." },
  { rating: 5, text: "Cash on delivery mil gya. Bohat achi cheez hai." },
  { rating: 5, text: "Bohat zabardast product hai. 5 star." },
  { rating: 5, text: "Quality achi hai. Price b reasonable hai." },
  { rating: 5, text: "Bht achi quality. COD ka option best hai." },
  { rating: 5, text: "Product bohat acha hai. Mene 2 order kiye hain." },
  { rating: 5, text: "Bht din se dhund rha tha. Finally mil gya." },
  { rating: 5, text: "Original product mila. Bohat acha laga." },
  { rating: 5, text: "Open box delivery ka maza hi kuch aur hai." },
  { rating: 5, text: "Bohat achi packing. Product as described." },
  { rating: 5, text: "Fully satisfied. Highly recommended seller." },
  { rating: 5, text: "Time pr aa gya. Product bht aala hai." },
  { rating: 5, text: "Brand new condition mein mila. Great quality." },
  { rating: 5, text: "COD available hai to risk nhi. Product acha hai." },
  { rating: 5, text: "Best purchase of the month. Quality top hai." },
  { rating: 5, text: "Mene apne bhai k liye liya. Wo bohat khush hai." },
  { rating: 5, text: "Delivery fast thi. Product achi quality ka hai." },
  { rating: 5, text: "Sab features kaam kr rahe hain. Bohat acha hai." },
  { rating: 5, text: "Im impressed. Product bohat achi quality ka hai." },
  { rating: 5, text: "Genuine product. Same as shown in pictures." },
  { rating: 5, text: "Es price mein itna aala kahi aur nhi mile ga." },
  { rating: 5, text: "Bohat achi cheez hai. COD par liya to safe tha." },
  { rating: 5, text: "Paisa vasool product hai." },
  { rating: 5, text: "Bohat aala. Agar aap soch rhe ho to le lo." },
  { rating: 5, text: "Mashallah bohat khub. Full satisfaction." },
  { rating: 5, text: "Great quality. Great price. Highly recommended." },
  { rating: 5, text: "Bht achi product hai yaar. Lelo tension nhi hai." },
  { rating: 5, text: "Seller bohat acha hai. Product original hai." },
  { rating: 5, text: "Open kia check kia. Phir pay kia. Best experience." },
  { rating: 5, text: "Bohat achi quality or bohat achi service." },
  { rating: 5, text: "Trusted place to shop. Mene 4 bar order kia hai." },
  { rating: 5, text: "Bht achi product hai. 2 mahine ho gaye perfect chl rhi." },
  { rating: 5, text: "Zero issues. Bohat achi quality." },
  { rating: 5, text: "Muje bohat acha laga. Sb ko recommend krunga." },
  { rating: 5, text: "Bohat hi behtareen product hai. Shukriya." },
  { rating: 5, text: "Received in good condition. Totally satisfied." },
  { rating: 5, text: "Product as described. Fast delivery. Quality good." },
  { rating: 5, text: "Ghar walo ne b pasand kia. Bohat achi cheez hai." },
  { rating: 5, text: "Bht achi quality hai. Original product mila." },
  { rating: 5, text: "Dil khush kr dia is product ne." },
  { rating: 5, text: "Mene 2 product liye hain. Dono achy hain." },
  { rating: 5, text: "Fully satisfied with product and delivery." },
]

const SHORT_4: RawReview[] = [
  { rating: 4, text: "Quality achi hai lakin price thora zyada hai." },
  { rating: 4, text: "Product acha hai lakin delivery late hui." },
  { rating: 4, text: "Bohat achi quality hai lakin color options km hain." },
  { rating: 4, text: "Achi product hai lakin expected se thora chota hai." },
  { rating: 4, text: "Overall theek hai. 4 star." },
  { rating: 4, text: "Product achi quality ka hai lakin packing average thi." },
  { rating: 4, text: "Theek hai. Kaam chl jaye ga." },
  { rating: 4, text: "Achi hai lakin zyada khaas nhi." },
  { rating: 4, text: "Jo order kia tha wesa hi aya. Satisfied." },
  { rating: 4, text: "Product to acha hai lakin thoda late mila." },
  { rating: 4, text: "Quality achi hai. Ek mahina ho gya use krte." },
  { rating: 4, text: "Achi product hai lakin strap thora kamzor hai." },
]

const SHORT_3: RawReview[] = [
  { rating: 3, text: "Average product hai. Umeed se thora km mila." },
  { rating: 3, text: "Theek thaak hai. Kuch khaas nhi." },
  { rating: 3, text: "Kaam to kr rha hai lakin utna smooth nhi." },
  { rating: 3, text: "Price k hisaab se theek hai. Warna nhi leta." },
  { rating: 3, text: "Mixed feelings. Kuch acha hai kuch nhi." },
  { rating: 3, text: "Product acha hai lakin jaldi kharab ho gya." },
  { rating: 3, text: "Middle of the road product. Theek hai." },
  { rating: 3, text: "Ziyada acha nhi lakin kaam chl jata hai." },
]

const SHORT_2: RawReview[] = [
  { rating: 2, text: "Expected better quality. Thora disappointment hai." },
  { rating: 2, text: "Product utna acha nhi hai jitna dikhaya gya." },
  { rating: 2, text: "Quality theek nhi hai. Paisa waste ho gya." },
  { rating: 2, text: "Kuch din mein hi problem start ho gai." },
  { rating: 2, text: "Jesi quality expect ki thi wesi nhi mili." },
]

const SHORT_1: RawReview[] = [
  { rating: 1, text: "Product ne 1 hafte mein kaam krna band kr dia." },
  { rating: 1, text: "Bohat buri quality hai. Na lo." },
  { rating: 1, text: "Waste of money. Koi b purchase na kre." },
]

// ─── MEDIUM REVIEWS (3-4 sentences) ──────────────────────────────────
const MEDIUM_5: RawReview[] = [
  { rating: 5, text: "Bohat achi product hai. Mene apne bhai k liye liya tha us ko bohat acha laga. Delivery bhi time pr aai. COD ka option best hai." },
  { rating: 5, text: "Mene socha tha k itne price mein kya mile ga lakin product dekh k impressive ho gya. Quality bohat achi hai. Sb kaam kr rha hai. Highly recommended." },
  { rating: 5, text: "Product quality bohat achi hai. Same as shown in pictures. COD available tha to tension nhi thi. Delivery bhi fast thi. Totally satisfied." },
  { rating: 5, text: "Open parcel kia to bohat achi quality thi. Jo order kia tha wesa hi mila. Packing bhi achi thi. Cash on delivery ka option best hai. Sb ko recommend krunga." },
  { rating: 5, text: "Mene 3 mahine pehle liya tha ab tak perfect chl rha hai. Koi issue nhi aya. Battery bhi achi hai. Display quality bohat bright hai. Value for money." },
  { rating: 5, text: "Bohat aala product hai. Mene market mein is se 2x price mein dekha hai lakin quality same hai. Yahan bohat reasonable price mein mil gya. Delivery b free thi. Highly recommended!" },
  { rating: 5, text: "Mene apne papa ko gift kia tha. Wo bohat khush hain. Quality bohat achi hai or features sab kaam kr rahe hain. Bohat achi product hai seniors k liye b." },
  { rating: 5, text: "First time is site se order kia. Thora hesitant tha lakin COD option tha to try kia. Product achi quality ka mila. Next time b yahan se lunga." },
  { rating: 5, text: "Bht aala product hai. Mene 2 dostoon ko recommend kia unho ne b liya or un ko b acha laga. Quality consistent hai. Great experience overall." },
  { rating: 5, text: "Bohat achi quality hai. Mene do baar order kia hai dono bar acha product mila. Packaging bhi strong thi. COD ka option hai to safe hai. Trusted seller." },
  { rating: 5, text: "Mashallah bohat acha product hai. Ghar walo ne bohat pasand kia. Free delivery thi or COD tha to koi risk nhi tha. Must buy product hai ye." },
  { rating: 5, text: "Main ne ye product 2 hafte pehle order kia tha. Bohat achi quality hai or price bhi reasonable hai. Seller ne achi tarah guide kia. Sab ko recommend krungi." },
  { rating: 5, text: "Kafi research krne k baad ye product liya. Sb se achi quality hai is price range mein. Open box delivery ka option best hai. Satisfied customer." },
  { rating: 5, text: "Product exactly jaisa description mein tha waisa hi mila. Full satisfaction. Delivery bhi time pr aai or courier wala bhi polite tha. Highly recommended seller." },
  { rating: 5, text: "Mujhe ye product kafi din se chahiye tha. Finally order kia or bohat achi quality mili. COD par liya to risk free tha. Sb ko recommend kr rha hu." },
  { rating: 5, text: "Bohat achi cheez hai. Mene 4 product order kiye hain ab tak is seller se. Sb achy aaye hain. Consistency matters. Trusted seller." },
  { rating: 5, text: "Mera beta bohat khush hai is product se. School k liye bohat helpful hai. Features achy hain or design bhi bht aala hai. COD ka option sb se acha hai." },
  { rating: 5, text: "Product bohat aala hai. Market mein se compare kia to bohat sasta mila yahan. Delivery bi time pr aai. Sb features perfect kaam kr rahe hain." },
  { rating: 5, text: "Open box delivery ka experience bohat acha tha. Pehle check kia phir paise diye. Product as shown. Quality bohat achi hai. Definitely recommend." },
  { rating: 5, text: "Mai ne apni wife k liye order kia tha. Unko bohat acha laga. Design premium hai or quality bhi top class hai. COD available tha to safe purchase." },
  { rating: 5, text: "Bohat aala product hai yr. Pehle soch rha tha fake hoga lakin bilkul original mila. Delivery b time pr aai. Or product bohat achi quality ka hai." },
]

const MEDIUM_4: RawReview[] = [
  { rating: 4, text: "Product achi quality ka hai lakin thora weight zyada hai. Overall theek hai. Features achy hain. 4 star de rha hu." },
  { rating: 4, text: "Quality achi hai lakin mujhe 3 din lage delivery mein. Product itself bohat acha hai. Display or design top hai. Recommended for everyone." },
  { rating: 4, text: "Product description jesa hi mila. Sirf color thora different tha jo maine expect kia tha. But overall quality achi hai. COD par liya." },
  { rating: 4, text: "Achi product hai lakin battery timing expected se thora km hai. Baqi sab theek hai. Price k hisaab se achi quality hai." },
  { rating: 4, text: "Product theek hai. Jo dikhaya gya us se thora farq tha lakin acceptable hai. COD par liya to koi tension nhi. Overall recommended." },
  { rating: 4, text: "Build quality solid hai. Thora heavy hai haath mein lakin aadat ho jati hai. Features achy hain. Next time zyada acha product lunga." },
  { rating: 4, text: "Mene apne bhai k liye liya. Us ko acha laga. Mene b check kia quality achi hai. Sirf ek minor issue tha jo seller ne resolve kr dia." },
  { rating: 4, text: "Product acha hai lakin shipping thora late thi. 2 din mein expected tha 4 din lage. Product itself bohat achi quality ka hai. Packaging achi thi." },
  { rating: 4, text: "Muje overall theek laga. Kuch features hain jo kaam nhi krte lakin main features achy hain. Price k hisaab se achi deal hai." },
  { rating: 4, text: "Value for money hai. Thora improvement ho skta hai lakin jo price hai us k hisaab se bohat achi quality hai. COD ka option best hai." },
]

const MEDIUM_3: RawReview[] = [
  { rating: 3, text: "Average hai. Kuch features theek hain kuch nhi. Battery timing average hai. Price k hisaab se theek hai. Zyada expectations na rakho." },
  { rating: 3, text: "Product to acha hai lakin warranty process thora mushkil hai. Seller ne respond kia lakin time lga. Product itself 3 star worthy hai." },
  { rating: 3, text: "Theek thaak hai yaar. Kuch khaas feature nhi hai lakin basic use k liye kaam chl jata hai. Price kam hota to acha hota." },
  { rating: 3, text: "Mene 2 hafte use kia hai. Kuch issues hain lakin overall theek hai. Is price mein is se acha kuch aur available hai to wo lo." },
  { rating: 3, text: "Not bad but not great either. Quality achi hai lakin expected performance se thora km hai. Seller bohat acha hai lakin product average hai." },
]

const MEDIUM_2: RawReview[] = [
  { rating: 2, text: "Product theek nhi aya. Jo order kia tha us mein variation tha. Exchange krwana chahta tha lakin process lamba hai. Not satisfied." },
  { rating: 2, text: "Muje thora issue hai. Battery theek nhi chal rhi. Pairing mein b masla aa rha hai. Seller se baat ki lakin time lge ga." },
  { rating: 2, text: "Product ne 1 mahine mein kaam krna band kr dia. Quality expected se bht km thi. Warranty hai lakin process bohat slow hai." },
]

const MEDIUM_1: RawReview[] = [
  { rating: 1, text: "Bht issue hai. Product ne 1 hafte mein kaam krna band kr dia. Seller ne kaha warranty hai lakin return process bohat lamba hai. Waste of money." },
  { rating: 1, text: "Quality bohat buri hai. Jo dikhaya gya tha wo nhi mila. Seller se contact kia to response acha tha lakin resolution time laga. Not recommended." },
]

// ─── LONG REVIEWS (5+ sentences, detailed experience) ─────────────────
const LONG_5: RawReview[] = [
  { rating: 5, text: "Mene ye product 2 hafte pehle order kia tha or kal muje deliver ho gya. Open kia to bohat achi lg rhi thi. Display bohat bright hai or touch bhi responsive hai. Saare features kaam kr rahe hain. Battery to 2 din chl gai heavy use mein. Mene market mein yehi product 8000 mein dekha tha yahan bohat km mein mil gya. Bohat aala deal hai. Sb ko recommend krunga." },
  { rating: 5, text: "Main ne pehle kabhi online product nhi liya tha lakin is seller ne trust dia. COD ka option tha to maine order kr dia. Product 3 din mein aa gya. Courier walay ne box open kr k dikhaya, check kia, phir paise liye. Product bilkul wesa hi tha jesa description mein likha tha. Quality bohat achi hai or ab main apne dostoon ko b recommend kr chuka hu." },
  { rating: 5, text: "Mene 3 mahine pehle liya tha or aaj tak bilkul perfect chl rha hai. Zero issues. Battery aaj b 2 din chl jati hai. Display mein koi scratch nhi aai. Water resistant b sahi hai. Maine haath dhoye b is k sath koi issue nhi. Mera bhai ne b same product liya or us ko b acha laga. Best decision ever." },
  { rating: 5, text: "Bohat achi product hai yaar. Mene 2 mahine research kr k liya hai or bilkul regret nhi. Sb features kaam kr rahe hain. BT calling ka feature driving k time bohat kaam ata hai. Phone nikalne ki zaroorat nhi. Battery timing b achi hai 2 din chl jati hai. COD ka option hai to tension nhi. Highly recommended." },
  { rating: 5, text: "Mene ye product apne papa ko gift kia tha. Wo 62 saal k hain or unko bohat acha laga. Mene unko sikhaya kaise use krna hai. Heart rate or steps count bohat achi accuracy hai. Hospital k machine se compare kia to same readings thi. Bohat achi product hai seniors k liye. Sb ko recommend kr skte hain." },
  { rating: 5, text: "Bhai maza aa gya. Is price range mein itna feature packed product nhi milta. Mene sara market check kia tha Ye sb se best hai. Muje driving k time calls receive krni hoti hain, ye bohat helpful hai. Or COD ka option hai to tension free. Mene apne 3 dostoon ko recommend kr dia hai sb ne liya or sb ko acha laga." },
  { rating: 5, text: "Actually mene pehle 2 product aur order kiye the doosri sites se jo achy nhi aye. Phir ye site mili or bohat acha experience rha. Product original aya, packing achi thi, delivery time pr aai. Seller se b baat hui bohat polite or helpful hain. Open box delivery to kamal hai. Ab main yahi se order krunga." },
  { rating: 5, text: "Bohat aala product hai yr. Main ne bht soch samjh k liya hai. Sb se achi baat ye hai k open kr k dekh saktay hain phir pay kr saktay hain. Is se trust build hota hai. Product quality is excellent. Mene local store mein compare kia same product 30% zyada ka tha. SB ko recommend kr rha hu." },
]

const LONG_4: RawReview[] = [
  { rating: 4, text: "Product bohat achi quality ka hai lakin mujhe delivery mein 4 din lag gaye jabke 2 din ka bola tha. But product itself bohat acha hai. Display vibrant hai. Touch responsive hai. Features sab kaam kr rahe hain. Sirf delivery timing improve krni chahiye. Baqi sab theek hai." },
  { rating: 4, text: "I was skeptical about the battery claims but it indeed lasts around 2 days. Charging takes about 1.5 hours which is reasonable. The customization options like watch faces are a nice touch. Only issue is the app syncing takes a bit of time. Hardware wise excellent value for the price." },
  { rating: 4, text: "Mene ye product 1 hafte use kia hai. Overall experience acha hai. Design bohat premium hai haath mein. Thora heavy hai lakin aadat ho jati hai. Jo features bataye gaye hain wo mostly kaam kr rahe hain. Ek do features hain jo expected se km hain lakin price k hisaab se acceptable hai." },
]

const LONG_3: RawReview[] = [
  { rating: 3, text: "Product theek hai lakin mujhe expected se thora km mila. Display quality achi hai lakin battery timing average hai. Kuch features hain jo theek se kaam nhi krte. Health tracking mein inconsistency hai. Seller bohat acha hai lakin product mein improvement ki zaroorat hai. Price k hisaab se theek hai." },
  { rating: 3, text: "Mene do hafte use kia hai. Kuch achi cheezein hain kuch nhi. Build quality achi hai lakin screen thora kamzor lagta hai. Tempered glass lgana pare ga. Features mein se kuch bohat achy hain kuch average. Overall mixed experience. COD par liya to risk nhi tha." },
]

// ─── CATEGORY-SPECIFIC REVIEWS ────────────────────────────────────────

const SMARTWATCH_5: RawReview[] = [
  { rating: 5, text: "Bht aala watch hai yaar. Mene order kia tha or 2 din mein aa gya. Display bohat achi hai or battery bhi bohat achi chal rahi hai. Open parcel kia to product bht aala tha." },
  { rating: 5, text: "Mene apni wife k liye liya hai unko bohat acha laga. Design premium hai or quality bhi achi hai. COD ka option hai to tension nhi hai." },
  { rating: 5, text: "Bht achi watch hai. Saare features kaam kr rahe hain. BT calling bht achi hai. Water resistant bhi hai. Main impressed hoon." },
  { rating: 5, text: "Delivery bohat fast thi. Product bht aala tha. Packaging bhi achi thi. Open box delivery ka to maza hi aa gya." },
  { rating: 5, text: "Best watch in this price range. Mene 3 dostoon ko recommend kia sb ne liya or sb ko acha laga. Bohat value for money hai." },
  { rating: 5, text: "Mera beta bohat khush hai. School k liye liya tha. Features bohat achy hain or design bhi bht aala hai." },
  { rating: 5, text: "Mashallah bohat achi watch hai. Gift kia tha or bohat pasand aya sb ko. Delivery b time pr aai." },
  { rating: 5, text: "Es price mein itna aala watch nhi milta. Display quality top hai. BT calling ka feature bohat acha hai." },
  { rating: 5, text: "Excellent watch with premium finishing. Sb se achi baat ye hai k open kr k dekh saktay hain phir pay kr saktay hain." },
  { rating: 5, text: "Bohat aala watch hai. Saare features kaam kr rahe hain. Bht comfortable hai or design bhi lajawab hai." },
  { rating: 5, text: "Bhai maza aagya. Is price range mein itna feature packed watch nhi milta. Mene sara market check kia tha." },
  { rating: 5, text: "3 mahine ho gaye use karte huye. Zero issues. Battery aaj bhi 2 din chl jaati hai. Display mein koi scratch nhi aai." },
  { rating: 5, text: "Delivery experience bht acha tha. Courier walay ne box open kr k dikhaya. Product as described. Sb dostoon ko suggest kia." },
  { rating: 5, text: "Value for money ka sb se aala example hai ye. 2 mahine research k baad liya bohat acha laga. Seller bht polite hain." },
  { rating: 5, text: "Mere 3 bhaiyon ne ek saath order kia. Sab ko alag color mangwaye. Sb bohat khush hain. Quality consistent hai." },
  { rating: 5, text: "Same product Lahore mein 8000 ka mil rha tha. Mujhe yahan bohat km mein mila. Free delivery bhi. Bht faida hua." },
  { rating: 5, text: "Maine ye watch apne papa ko gift di. Wo bohat khush hain. Heart rate or steps bohat achi tarah kaam kr raha hai." },
  { rating: 5, text: "Watch came exactly as shown. Color accuracy on point. UI smooth hai. Notifications work perfectly. Highly satisfied." },
  { rating: 5, text: "Got this for my teenage son. He absolutely loves it. Features are cool but not too complicated. Build quality can handle his lifestyle." },
  { rating: 5, text: "Bht aala watch hai yr. Dil khush kr dia. Pehle soch rha tha fake hoga lakin original mila. Seller bohat acha hai." },
  { rating: 5, text: "Bohat achi quality hai yaar. Mene 2 mahine pehle liya tha or aaj tak perfect chl rha hai. Charging 1 ghante mein full ho jati hai." },
  { rating: 5, text: "Mene apney 2 bachon k liye li. Dono ko bohat achi lagi. Alarm feature school k liye best hai. Steps count kr k competition krte hain." },
  { rating: 5, text: "Meni ye watch apne partner ko gift di thi wo bohat khush hue. Design elegant hai or bohat premium feel ata hai." },
  { rating: 5, text: "Bohat aala watch hai. Mene gym mein use kia sweat proof hai or steps counting accurate hai. Price k hisab se best hai." },
  { rating: 5, text: "Muje pehle doubt tha lakin product dekh k bohat acha laga. Zero regrets. BT calling clear hai or display bright hai." },
]

const SMARTWATCH_4: RawReview[] = [
  { rating: 4, text: "Quality to achi hai lakin thora price zyada lag raha hai. But overall theek hai. Battery timing achi hai. Features saare kaam kr rahe hain." },
  { rating: 4, text: "Achi watch hai lakin strap thora kamzor hai. Overall product bht acha hai. Display or features bohat achy hain." },
  { rating: 4, text: "Second watch lia hai is seller se. Pehla bhi acha tha ye bhi acha hai. Battery life achi hai or display bright hai." },
  { rating: 4, text: "Build quality solid hai. Watch feels premium on wrist. Only issue is strap thora stiff hai initially. Display vibrant hai." },
  { rating: 4, text: "Looks are amazing, definitely a head-turner. Size perfect hai wrist k liye. Thora heavy hai but aadat ho jati hai." },
  { rating: 4, text: "Faced some issues with BT connectivity at first but then got resolved. Watch is good for this price range. Display quality impressive." },
  { rating: 4, text: "Battery backup decent hai around 2 days. Charging cable could be longer but manageable. Touch response is good." },
  { rating: 4, text: "Using this for workouts. SPO2 and heart rate fairly accurate. Sweat resistance good. Only wish GPS was built-in." },
  { rating: 4, text: "Watch is good but the app experience could be better. Syncing takes time. Hardware wise excellent value." },
  { rating: 4, text: "Product description jesa mila. SPO2 heart rate sab kaam kr rha hai. 1 mahina ho gya koi masla nhi." },
  { rating: 4, text: "Quality achi hai lakin Urdu notifications properly show nhi hote. Fix karo to 5 star. Baqi sab acha hai." },
  { rating: 4, text: "Achi watch hai overall. Notifications sahi aa rahe hain. Call quality clear hai. Ek do minor issues hain." },
  { rating: 4, text: "Watch achi hai lakin manual Urdu mein b honi chahiye. Hardware wise bohat achi hai. Screen strong hai." },
  { rating: 4, text: "Achi watch hai lakin color thora different aya jo order kia tha. But overall theek hai. Features achy hain." },
]

const SMARTWATCH_3: RawReview[] = [
  { rating: 3, text: "Watch to achi hai lakin expected se thora km mila. Battery timing average hai. Price k hisab se theek hai." },
  { rating: 3, text: "Theek hai but utna khaas nhi. Features hain but sab perfectly kaam nhi krte. Health tracking mein inconsistency hai." },
  { rating: 3, text: "Average product hai. Kuch features kaam nhi krte. Price k mutabiq theek hai. COD available hai to check kr lena." },
  { rating: 3, text: "Middle of the road watch. Kuch features hain jo zaroori hain kuch missing. Screen thora kamzor lagta hai. Tempered glass lgana pare ga." },
  { rating: 3, text: "Theek hai but kuch issues hain. Display achi hai lakin battery timing ka masla hai. Overall kaam chl jata hai." },
]

const SMARTWATCH_2: RawReview[] = [
  { rating: 2, text: "Mje thora issue hai. Battery theek ni chal rhi. Pairing mein b problem aa rhi hai. Exchange krwana pare ga." },
  { rating: 2, text: "Product received but box slightly damaged. Watch works fine but expected better packaging. Manual Urdu mein ho to better tha." },
  { rating: 2, text: "Bht issue hai. 3 din mein screen scratch ho gai. Battery expected se km chl rhi. Return krne mein b time lge ga." },
]

const SMARTWATCH_1: RawReview[] = [
  { rating: 1, text: "Bht issue hai watch mein. 1 hafte mein screen freeze ho gai. Seller ne kaha warranty hai lakin return process bohat lamba hai." },
  { rating: 1, text: "Bakwas product hai. Quality bohat buri hai. Na lo kisi ko b recommend nhi krunga. Paisay waste ho gaye." },
]

const HEADPHONE_5: RawReview[] = [
  { rating: 5, text: "Sound quality bohat achi hai. Bass bht heavy hai. Comfortable bhi hain or COD available tha." },
  { rating: 5, text: "Muje to bohat acha laga. Comfortable bhi hai or sound bhi clear hai. Long hours use kia to bhi aram hai." },
  { rating: 5, text: "Best headphones in this price range. Noise cancellation bht achi hai. Free delivery ka option bht acha hai." },
  { rating: 5, text: "Mene apne bhai k liye liya tha. Wo bohat khush hai. Sound or comfort dono top hai. Must buy." },
  { rating: 5, text: "Bohat aala sound hai. Vocals clear hain or bass balanced hai. Highly recommended for music lovers." },
  { rating: 5, text: "Gym k liye best hai. Secure fit hai or sweat proof bhi. Sound loud enough for gym noise." },
  { rating: 5, text: "Mene 3 headphones compare kr k ye liya. Sb se aala sound quality hai. Music production k liye b acha hai." },
  { rating: 5, text: "Bohat aala product hai. 2 pair liye hain. Ek ghar k liye ek office k liye. Comfort top class hai." },
  { rating: 5, text: "Mujhe music sunne ka bohat shok hai. Inho ne experience next level kr dia. Voice detail bohat achi hai." },
  { rating: 5, text: "Boost aala sound hai yaar. Noise isolation bohat achi hai. COD par liya to risk nhi tha." },
  { rating: 5, text: "Using these for work calls. Mic quality is decent. Sound clear on both ends. Comfortable for long meetings." },
  { rating: 5, text: "Bohat achi quality hai. Bass heavy hai. Mene dost k liye b mangwaya hai. Sb ko recommend kr rha hu." },
  { rating: 5, text: "Mene sister k liye liye online class k liye. Comfortable hain or mic clear hai. Teachers ne voice clear boli." },
  { rating: 5, text: "Gamers k liye best hai. Mic quality clear hai. Soundstage achi hai FPS games k liye. Value for money." },
  { rating: 5, text: "Long hours use krne k baad b comfortable hain. Sound quality bohat achi hai. Free delivery bohat achi baat hai." },
]

const HEADPHONE_4: RawReview[] = [
  { rating: 4, text: "Build quality achi hai lakin thora weight zyada hai. Sound clear hai. Recommended for music lovers." },
  { rating: 4, text: "Achy hain but battery timing kam hai. 6-7 hours chlti hai. Sound quality bohat achi hai overall theek hain." },
  { rating: 4, text: "Achi quality hai but thora expensive lagta hai similar options se. However bass quality is unmatched." },
  { rating: 4, text: "Comfortable hain lakin thoda weight feel hota hai 2 ghante baad. Sound quality bohat achi hai. Overall recommended." },
  { rating: 4, text: "Sound quality top hai lakin cable thora chota hai. Price k hisaab se achi quality hai. COD par liya." },
]

const HEADPHONE_3: RawReview[] = [
  { rating: 3, text: "Theek hain lakin utna aala nhi jitna socha tha. Average sound quality. Price k hisab se theek hain." },
  { rating: 3, text: "Average hain. Bass theek hai lakin clarity utni achi nhi. Price k hisaab se theek hai." },
]

const HEADPHONE_2: RawReview[] = [
  { rating: 2, text: "After a month one side stopped working. Support offered replacement but process slow. Sound quality was good while it lasted." },
  { rating: 2, text: "Wired earphones expected the lakin ye thoda heavy hain. Sound quality average. Ghar walo ne kaha vapas kr do." },
]

const CHARGER_5: RawReview[] = [
  { rating: 5, text: "Charger bohat acha hai. Fast charging support krta hai. Mene apne phone k liye liya or perfect hai." },
  { rating: 5, text: "Original product mila. Mene do baar order kia hai. Dono bar same acha product mila." },
  { rating: 5, text: "Bohat achi quality hai. Original jesa hi hai. Fast charging support krta hai. Delivery time pr aai." },
  { rating: 5, text: "Bht aala charger hai yaar. Fast charging kamal kr dia. Phone 30 min mein 60% charge ho gya." },
  { rating: 5, text: "Mene 2 liye hain ek ghar k liye ek office k liye. Dono perfect kaam kr rahe hain. 1 month ho gya." },
  { rating: 5, text: "Bohat achi quality charger hai. Heat management b achi hai. Fast charging perfectly kaam krta hai." },
  { rating: 5, text: "Original jaisa hi experience hai. Build quality solid hai. COD par liya to safe tha." },
  { rating: 5, text: "Bht achi quality hai. Cable b achi hai or adapter solid hai. Price b reasonable hai." },
  { rating: 5, text: "Fast charging bohat achi hai. Mene iPhone k liye liya or perfect kaam kr rha hai." },
  { rating: 5, text: "Charger quality bohat achi hai. 2 mahine ho gaye perfect chl rha hai. Recommended." },
]

const CHARGER_4: RawReview[] = [
  { rating: 4, text: "Acha charger hai lakin cable thora chota hai. Charging speed achi hai. Price reasonable hai." },
  { rating: 4, text: "Charging speed good but cable feels a bit thin. Adapter solid hai. Overall theek laga." },
  { rating: 4, text: "Achi quality hai lakin MFi certified nhi hai. Works fine for now. Price k mutabiq theek hai." },
  { rating: 4, text: "Fast charging support krta hai lakin thora slow detect krta hai. Baqi sab theek hai." },
]

const CHARGER_3: RawReview[] = [
  { rating: 3, text: "Theek hai lakin utna fast charging support nhi hai jitna bataya tha. Average product hai." },
  { rating: 3, text: "Kaam kr rha hai lakin build quality thora average hai. Price k hisaab se theek hai." },
]

const CASE_5: RawReview[] = [
  { rating: 5, text: "Case bohat achi quality ka hai. Phone mein perfectly fit hai. Drop protection bhi achi hai." },
  { rating: 5, text: "Muje bohat acha laga. Material achi quality ka hai or grip bhi achi hai. Mene wife k liye b mangwaya." },
  { rating: 5, text: "Best phone case in this price. Bohat aala look deta hai. Protection bhi bohat achi hai. Must buy." },
  { rating: 5, text: "Bohat aala case hai. Mera phone gir gya tha or case ne bcha lia. Worth every penny." },
  { rating: 5, text: "Color exactly jesa picture mein tha wesa hai. Material feels premium. Buttons accessible hain." },
  { rating: 5, text: "Mene sister k liye b mangwaya. Quality or design dono lajawab hain. Best seller for accessories." },
  { rating: 5, text: "Phone mein perfectly fit hai. Camera protection b achi hai. Slim profile hai jo bohat acha laga." },
  { rating: 5, text: "Grip bohat achi hai. Phone slippery nhi lagta. Drop protection ka confidence milta hai." },
  { rating: 5, text: "Bohat achi quality case hai. Buttons easy to press hain. Ports b properly accessible hain." },
  { rating: 5, text: "Raised edges protect camera and screen. Material feels premium. Recommended for everyone." },
]

const CASE_4: RawReview[] = [
  { rating: 4, text: "Achi case hai lakin thora bulky hai. Protection k liye acha hai. Design bhi achi hai." },
  { rating: 4, text: "Color accurate hai lakin thora loose fit hai. Drop protection achi hai. Overall theek hai." },
  { rating: 4, text: "Design acha hai but thora loose fit hai. Phone thora hilta hai andar. Protection achi hai." },
  { rating: 4, text: "Quality achi hai lakin thora heavy hai. Protection k liye acha hai. COD par liya." },
]

const CASE_3: RawReview[] = [
  { rating: 3, text: "Theek hai. Protection to achi hai lakin design utna acha nhi. Expected se thora km hai." },
  { rating: 3, text: "Average case hai. Kaam chl jata hai lakin premium feel nhi hai. Price k hisaab se theek hai." },
]

// ─── POOL ASSEMBLY ────────────────────────────────────────────────────

const POOL_SMARTWATCH: RawReview[] = [
  ...SHORT_5, ...SHORT_4, ...SHORT_3, ...SHORT_2, ...SHORT_1,
  ...MEDIUM_5, ...MEDIUM_4, ...MEDIUM_3, ...MEDIUM_2, ...MEDIUM_1,
  ...LONG_5, ...LONG_4, ...LONG_3,
  ...SMARTWATCH_5, ...SMARTWATCH_4, ...SMARTWATCH_3, ...SMARTWATCH_2, ...SMARTWATCH_1,
]

const POOL_HEADPHONE: RawReview[] = [
  ...SHORT_5, ...SHORT_4, ...SHORT_3, ...SHORT_2, ...SHORT_1,
  ...MEDIUM_5, ...MEDIUM_4, ...MEDIUM_3, ...MEDIUM_2,
  ...HEADPHONE_5, ...HEADPHONE_4, ...HEADPHONE_3, ...HEADPHONE_2,
]

const POOL_CHARGER: RawReview[] = [
  ...SHORT_5, ...SHORT_4, ...SHORT_3, ...SHORT_2,
  ...CHARGER_5, ...CHARGER_4, ...CHARGER_3,
]

const POOL_CASE: RawReview[] = [
  ...SHORT_5, ...SHORT_4, ...SHORT_3,
  ...CASE_5, ...CASE_4, ...CASE_3,
]

const POOL_GENERAL: RawReview[] = [
  ...SHORT_5, ...SHORT_4, ...SHORT_3, ...SHORT_2, ...SHORT_1,
  ...MEDIUM_5, ...MEDIUM_4, ...MEDIUM_3, ...MEDIUM_2, ...MEDIUM_1,
  ...LONG_5, ...LONG_4, ...LONG_3,
]

const CATEGORY_POOLS: Record<string, RawReview[]> = {
  "smart-watches": POOL_SMARTWATCH, "smartwatch": POOL_SMARTWATCH, "smartwatches": POOL_SMARTWATCH,
  "headphones": POOL_HEADPHONE, "headphone": POOL_HEADPHONE,
  "earphones": POOL_HEADPHONE, "earphone": POOL_HEADPHONE, "earbuds": POOL_HEADPHONE,
  "charger": POOL_CHARGER, "chargers": POOL_CHARGER, "charging": POOL_CHARGER,
  "case": POOL_CASE, "cases": POOL_CASE, "cover": POOL_CASE, "covers": POOL_CASE,
}

function getPool(categorySlug: string): RawReview[] {
  const c = categorySlug?.toLowerCase() || ""
  for (const [key, pool] of Object.entries(CATEGORY_POOLS)) {
    if (c.includes(key)) return pool
  }
  return POOL_GENERAL
}

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
  const pool = getPool(categorySlug)

  const maxReviews = Math.min(reviewsCount || 15, 50)
  const actualCount = Math.max(maxReviews, 3)

  const targetDistribution = productRating >= 4.8
    ? [0.82, 0.13, 0.04, 0.01, 0]
    : productRating >= 4.5
    ? [0.68, 0.22, 0.07, 0.02, 0.01]
    : productRating >= 4.0
    ? [0.42, 0.33, 0.15, 0.07, 0.03]
    : productRating >= 3.5
    ? [0.25, 0.30, 0.25, 0.12, 0.08]
    : productRating >= 3.0
    ? [0.15, 0.25, 0.30, 0.20, 0.10]
    : [0.10, 0.15, 0.25, 0.30, 0.20]

  const dates = generateDates(actualCount, baseSeed + 999)

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
      cumulative += targetDistribution[r]
      if (roll <= cumulative) { chosenRating = ratingValues[r]; break }
    }

    const candidates = pool.filter(rr => rr.rating === chosenRating)
    const text = candidates.length > 0
      ? pick(candidates, rand)
      : { rating: chosenRating, text: "Average product hai. Theek hai overall." }

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

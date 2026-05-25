import { getStoreMeta } from "./store-meta"
import { getSeoData } from "./seo"

export interface HeroData {
  badge: string
  title: string
  highlightedWord: string
  description: string
  primaryButtonText: string
  primaryButtonUrl: string
  secondaryButtonText: string
  secondaryButtonUrl: string
  bgImage: string
  featuredImage: string
  trustFeatures: { label: string; icon: string }[]
  layout?: "bento" | "centered" | "split" | "fullscreen"
}

export interface CategoryItem {
  name: string
  image: string
  count: number
  icon: string
}

export interface CategoriesData {
  badge: string
  title: string
  description: string
  items: CategoryItem[]
  displayCount?: number
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface FeaturesData {
  badge: string
  title: string
  description: string
  items: FeatureItem[]
}

export interface ProductSectionData {
  badge: string
  title: string
  description: string
}

export interface FeatureData {
  title: string
  description: string
  icon: string
}

export interface PromoBannerData {
  text: string
  buttonText: string
  buttonUrl: string
  bgColor: string
  textColor: string
  buttonBgColor: string
  buttonTextColor: string
  dismissible: boolean
}

export interface NewsletterData {
  title: string
  description: string
  placeholder: string
  buttonText: string
  bgImage: string
  bgColor: string
}

export interface BrandStoryData {
  title: string
  description: string
  image: string
  buttonText: string
  buttonUrl: string
}

export interface TestimonialItem {
  name: string
  role: string
  avatar: string
  text: string
  rating: number
}

export interface TestimonialsData {
  title: string
  description: string
  items: TestimonialItem[]
}

export interface InstagramData {
  title: string
  description: string
  images: string[]
  link: string
  linkText: string
}

export interface FeaturedCollectionData {
  title: string
  description: string
  image: string
  buttonText: string
  buttonUrl: string
  badge: string
}

export interface BrandLogosData {
  title: string
  logos: string[]
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQData {
  title: string
  description: string
  items: FAQItem[]
}

export interface StatsItem {
  value: string
  label: string
  prefix: string
  suffix: string
}

export interface StatsData {
  title: string
  description: string
  items: StatsItem[]
}

export interface LookbookItem {
  image: string
  title: string
}

export interface LookbookData {
  title: string
  description: string
  items: LookbookItem[]
}

export interface ProcessStep {
  icon: string
  title: string
  description: string
}

export interface ProcessData {
  title: string
  description: string
  steps: ProcessStep[]
}

export interface PressItem {
  quote: string
  source: string
  logo: string
}

export interface PressData {
  title: string
  description: string
  items: PressItem[]
}

export type BackgroundType = "color" | "gradient" | "image"
export type PaddingPreset = "compact" | "comfortable" | "luxury"

export interface SectionStyle {
  backgroundType: BackgroundType
  backgroundColor: string
  backgroundGradient: string
  backgroundImage: string
  padding: PaddingPreset
}

export interface SeoData {
  metaTitle: string
  metaDescription: string
  ogImage: string
  keywords: string
  favicon: string
}

export interface SectionData {
  hero: HeroData
  categories: CategoriesData
  features: FeaturesData
  newArrivals: ProductSectionData
  bestSellers: ProductSectionData
  heroActive: boolean
  categoriesActive: boolean
  newArrivalsActive: boolean
  bestSellersActive: boolean
  featuresActive: boolean
  promoBannerActive: boolean
  newsletterActive: boolean
  brandStoryActive: boolean
  testimonialsActive: boolean
  instagramActive: boolean
  featuredCollectionActive: boolean
  brandLogosActive: boolean
  faqActive: boolean
  statsActive: boolean
  lookbookActive: boolean
  processActive: boolean
  pressActive: boolean
  siteName: string
  siteTagline: string
  logo: string
  promoBanner: PromoBannerData
  newsletter: NewsletterData
  brandStory: BrandStoryData
  testimonials: TestimonialsData
  instagram: InstagramData
  featuredCollection: FeaturedCollectionData
  brandLogos: BrandLogosData
  faq: FAQData
  stats: StatsData
  lookbook: LookbookData
  process: ProcessData
  press: PressData
  seo: SeoData
  sectionOrder: string[]
  sectionStyles: Record<string, SectionStyle>
  productCardLayout?: "bento" | "minimal" | "bordered" | "glass"
}

export const SECTION_KEYS = ["hero", "categories", "newArrivals", "bestSellers", "features", "promoBanner", "newsletter", "brandStory", "testimonials", "instagram", "featuredCollection", "brandLogos", "faq", "stats", "lookbook", "process", "press"] as const

export type SectionKey = (typeof SECTION_KEYS)[number]

const DEFAULT_SECTION_STYLE: SectionStyle = {
  backgroundType: "color",
  backgroundColor: "#FFFFFF",
  backgroundGradient: "",
  backgroundImage: "",
  padding: "compact",
}

export const defaultData: SectionData = {
  categories: {
    badge: "Browse",
    title: "All Categories",
    description: "Find your perfect smart companion from our curated categories",
    displayCount: 4,
    items: [
      { name: "Smart Watches", icon: "watch", image: "https://images.unsplash.com/photo-1546868871-af0de0e72c43?w=600&q=80", count: 48 },
      { name: "Fitness Trackers", icon: "shoe", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", count: 32 },
      { name: "Accessories", icon: "bag", image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f73?w=600&q=80", count: 24 },
      { name: "New Arrivals", icon: "sparkles", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80", count: 16 },
    ],
  },
  features: {
    badge: "Why Choose Us",
    title: "Trusted by Thousands",
    description: "We make your smart tech shopping smooth and reliable",
    items: [
      { icon: "truck", title: "Free Delivery", description: "On all orders over Rs. 3,000" },
      { icon: "shield", title: "100% Authentic", description: "Genuine products guaranteed" },
      { icon: "refresh", title: "7-Day Returns", description: "Easy return & exchange policy" },
      { icon: "headphones", title: "24/7 Support", description: "Dedicated customer service" },
    ],
  },
  newArrivals: {
    badge: "New Arrivals",
    title: "Fresh Off the Shelf",
    description: "The latest additions to our ever growing collection",
  },
  bestSellers: {
    badge: "Best Sellers",
    title: "Most Loved by Customers",
    description: "Our top-rated products, chosen by people like you",
  },
  hero: {
    badge: "FLAGSHIP SERIES",
    title: "Master your",
    highlightedWord: "momentum.",
    description: "Experience a revolutionary leap in wearable technology. Impeccable design meets unprecedented performance, crafted for those who refuse to compromise.",
    primaryButtonText: "Shop Now",
    primaryButtonUrl: "/contact",
    secondaryButtonText: "View Products",
    secondaryButtonUrl: "/products",
    bgImage: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1920&q=80",
    featuredImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    trustFeatures: [
      { label: "Free Delivery", icon: "truck" },
      { label: "1-Year Warranty", icon: "shield" },
      { label: "Cash on Delivery", icon: "banknote" },
    ],
    layout: "bento",
  },
  heroActive: true,
  categoriesActive: true,
  newArrivalsActive: true,
  bestSellersActive: true,
  featuresActive: true,
  promoBannerActive: true,
  newsletterActive: true,
  brandStoryActive: false,
  testimonialsActive: true,
  instagramActive: false,
  featuredCollectionActive: true,
  brandLogosActive: false,
  faqActive: true,
  statsActive: false,
  lookbookActive: false,
  processActive: true,
  pressActive: false,
  siteName: "SMARTWEAR",
  siteTagline: "Commerce",
  logo: "",
  promoBanner: {
    text: "Free shipping on all orders over Rs. 3,000",
    buttonText: "Shop Now",
    buttonUrl: "/products",
    bgColor: "#1E3A5F",
    textColor: "#FFFFFF",
    buttonBgColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    dismissible: true,
  },
  newsletter: {
    title: "Stay in the Loop",
    description: "Subscribe to get special offers, free giveaways, and exclusive deals.",
    placeholder: "Enter your email",
    buttonText: "Subscribe",
    bgImage: "",
    bgColor: "#1E3A5F",
  },
  brandStory: {
    title: "Our Story",
    description: "SMARTWEAR was born from a vision to merge cutting-edge wearable technology with everyday lifestyle. We partner with leading brands to bring you a curated selection of smart watches and accessories that keep you connected, fit, and ahead of the curve.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    buttonText: "Learn More",
    buttonUrl: "/about",
  },
  testimonials: {
    title: "What Our Customers Say",
    description: "Real reviews from real people who love SMARTWEAR.",
    items: [
      { name: "Alex M.", role: "Verified Buyer", avatar: "", text: "Exceptional build quality and seamless connectivity. The fitness tracking features exceeded my expectations.", rating: 5 },
      { name: "Jordan P.", role: "Verified Buyer", avatar: "", text: "Bought the ProSport as a gift — absolutely loved it. Will definitely order again.", rating: 5 },
      { name: "Casey R.", role: "Verified Buyer", avatar: "", text: "Great value for money. The packaging was premium and delivery was fast.", rating: 4 },
    ],
  },
  instagram: {
    title: "Follow Us",
    description: "Tag @smartwear to get featured.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80",
    ],
    link: "https://instagram.com",
    linkText: "@smartwear",
  },
  featuredCollection: {
    title: "The Smart Collection",
    description: "Curated smart watches and premium tech accessories crafted for those who live life at the edge of innovation. Featuring flagship models and limited drops.",
    image: "https://images.unsplash.com/photo-1546868871-af0de0e72c43?w=1200&q=80",
    buttonText: "Explore Collection",
    buttonUrl: "/products/category/clothing",
    badge: "New Drop",
  },
  brandLogos: {
    title: "As Featured In",
    logos: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Vogue_logo.svg/2560px-Vogue_logo.svg.png",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/GQ_logo.svg/2560px-GQ_logo.svg.png",
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Everything you need to know before making your purchase.",
    items: [
      { question: "What payment methods do you accept?", answer: "We accept Cash on Delivery (COD), JazzCash, EasyPaisa, and bank transfers. All payments are secure and verified." },
      { question: "How long does shipping take?", answer: "Orders are processed within 24 hours and delivered within 3-5 business days across Pakistan. International shipping takes 7-14 business days." },
      { question: "What is your return policy?", answer: "We offer a 7-day return policy on all unworn products. Items must be in original packaging with all tags attached." },
      { question: "Are your products authentic?", answer: "Absolutely. Every product comes with a certificate of authenticity and quality guarantee." },
    ],
  },
  stats: {
    title: "By the Numbers",
    description: "SMARTWEAR in numbers — trust built through quality and service.",
    items: [
      { value: "50", label: "Happy Customers", prefix: "", suffix: "K+" },
      { value: "4.9", label: "Average Rating", prefix: "", suffix: "/5" },
      { value: "3", label: "Years in Business", prefix: "", suffix: "+" },
      { value: "100", label: "Products", prefix: "", suffix: "+" },
    ],
  },
  lookbook: {
    title: "Wear the Future",
    description: "Curated smart tech for every lifestyle — see how our watches and accessories elevate your everyday.",
    items: [
      { image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", title: "Sport Elite" },
      { image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&q=80", title: "Urban Pro" },
      { image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80", title: "Classic Edge" },
      { image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80", title: "Tech Minimal" },
    ],
  },
  process: {
    title: "How It Works",
    description: "Three simple steps to your new smart tech.",
    steps: [
      { icon: "shopping-bag", title: "Browse & Select", description: "Explore our curated collection of premium smart watches and find your perfect match." },
      { icon: "check", title: "Place Your Order", description: "Secure checkout with multiple payment options. We'll confirm your order instantly." },
      { icon: "truck", title: "Fast Delivery", description: "Carefully packaged and delivered to your doorstep within 2-4 business days." },
    ],
  },
  press: {
    title: "In the Press",
    description: "What the media is saying about SMARTWEAR.",
    items: [
      { quote: "SMARTWEAR is redefining wearable tech retail with a curated selection that punches well above its weight class.", source: "TechCrunch", logo: "" },
      { quote: "The platform's commitment to quality and authenticity sets a new standard for smart watch ecommerce.", source: "Wired", logo: "" },
    ],
  },
  seo: {
    metaTitle: "SMARTWEAR — Premium Smart Watches & Accessories",
    metaDescription: "Premium smart watches and accessories curated for those who demand more from their tech. Shop the latest wearables at SMARTWEAR.",
    ogImage: "",
    keywords: "smart watches, wearables, fitness trackers, smartwear, tech accessories, lifestyle brand",
    favicon: "",
  },
  sectionOrder: ["hero", "categories", "newArrivals", "bestSellers", "features", "promoBanner", "newsletter", "brandStory", "testimonials", "instagram", "featuredCollection", "brandLogos", "faq", "stats", "lookbook", "process", "press"],
  sectionStyles: Object.fromEntries(
    SECTION_KEYS.map((k) => [
      k,
      {
        ...DEFAULT_SECTION_STYLE,
        backgroundColor: ["features", "testimonials", "faq", "process"].includes(k) ? "#F8F9FC" : "#FFFFFF",
      },
    ])
  ) as Record<string, SectionStyle>,
  productCardLayout: "minimal",
}

const STORAGE_KEY = "smartwear-sections-v2"
const SETTINGS_KEY = "sections-v2"

export function getDefaultSectionStyle(): SectionStyle {
  return { ...DEFAULT_SECTION_STYLE }
}

export function getSectionStyle(data: SectionData, key: string): SectionStyle {
  return data.sectionStyles[key] ? { ...data.sectionStyles[key] } : { ...DEFAULT_SECTION_STYLE }
}

function isValidSectionData(data: unknown): data is SectionData {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  return typeof d.hero === "object" && d.hero !== null && typeof d.siteName === "string"
}

function mergeData(saved: Partial<SectionData>): SectionData {
  return {
    ...defaultData,
    ...saved,
    categories: { ...defaultData.categories, ...saved.categories, items: saved.categories?.items ?? defaultData.categories.items },
    features: { ...defaultData.features, ...saved.features, items: saved.features?.items ?? defaultData.features.items },
    newArrivals: { ...defaultData.newArrivals, ...saved.newArrivals },
    bestSellers: { ...defaultData.bestSellers, ...saved.bestSellers },
    hero: { ...defaultData.hero, ...saved.hero },
    promoBanner: { ...defaultData.promoBanner, ...saved.promoBanner },
    newsletter: { ...defaultData.newsletter, ...saved.newsletter },
    brandStory: { ...defaultData.brandStory, ...saved.brandStory },
    testimonials: { ...defaultData.testimonials, ...saved.testimonials, items: saved.testimonials?.items ?? defaultData.testimonials.items },
    instagram: { ...defaultData.instagram, ...saved.instagram },
    featuredCollection: { ...defaultData.featuredCollection, ...saved.featuredCollection },
    brandLogos: { ...defaultData.brandLogos, ...saved.brandLogos },
    faq: { ...defaultData.faq, ...saved.faq, items: saved.faq?.items ?? defaultData.faq.items },
    stats: { ...defaultData.stats, ...saved.stats, items: saved.stats?.items ?? defaultData.stats.items },
    lookbook: { ...defaultData.lookbook, ...saved.lookbook, items: saved.lookbook?.items ?? defaultData.lookbook.items },
    process: { ...defaultData.process, ...saved.process, steps: saved.process?.steps ?? defaultData.process.steps },
    press: { ...defaultData.press, ...saved.press, items: saved.press?.items ?? defaultData.press.items },
    seo: { ...defaultData.seo, ...saved.seo },
    sectionStyles: { ...defaultData.sectionStyles, ...saved.sectionStyles },
  }
}

export function getSections(): SectionData {
  if (typeof window === "undefined") return defaultData
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.hero === "object" && parsed.hero !== null) {
        if (typeof parsed.siteName === "string") {
          return mergeData(parsed)
        }
        const meta = getStoreMeta()
        const seo = getSeoData()
        return mergeData({
          ...parsed,
          siteName: meta.siteName,
          siteTagline: meta.siteTagline,
          logo: meta.logo,
          seo,
        })
      }
    }
  } catch (err) {
    console.error("Failed to load sections:", err)
  }
  return defaultData
}

export function saveSections(data: SectionData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent("smartwear-sections-changed"))
  fetch(`/api/settings/${SETTINGS_KEY}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(data) }),
  }).catch((err) => console.error("Failed to save sections:", err))
}

export async function initSectionsFromApi(): Promise<void> {
  try {
    const res = await fetch(`/api/settings/${SETTINGS_KEY}`)
    if (!res.ok) return
    const { value } = await res.json()
    if (!value) return
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing || existing === "null") {
      localStorage.setItem(STORAGE_KEY, value)
      window.dispatchEvent(new Event("smartwear-sections-changed"))
    }
  } catch (err) {
    console.error("Failed to init sections from API:", err)
  }
}

export function subscribe(callback: () => void): () => void {
  window.addEventListener("smartwear-sections-changed", callback)
  return () => window.removeEventListener("smartwear-sections-changed", callback)
}

export function resetSections(): SectionData {
  const fresh = JSON.parse(JSON.stringify(defaultData)) as SectionData
  saveSections(fresh)
  return fresh
}

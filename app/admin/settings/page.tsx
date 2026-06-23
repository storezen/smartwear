"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Save, Store, Truck, Link as LinkIcon,
  CheckCircle2, AlertCircle, Globe, Phone, MapPin,
  Clock, MessageCircle, Instagram, Facebook, Twitter, Youtube,
  BadgePercent, Megaphone, Image as ImageIcon, Search,
  ShieldCheck, Heart, PackageOpen, Banknote, RefreshCw, Lock,
} from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { toast } from "sonner"
import { z } from "zod"

const settingsSchema = z.object({
  store_name: z.string().min(1, "Store name is required"),
  store_tagline: z.string().optional(),
  whatsapp_number: z.string().optional(),
  whatsapp_message: z.string().optional(),
  support_phone: z.string().optional(),
  support_email: z.string().email("Invalid email").optional().or(z.literal("")),
  legal_email: z.string().optional().or(z.literal("")),
  privacy_email: z.string().optional().or(z.literal("")),
  store_address_line1: z.string().optional(),
  store_address_line2: z.string().optional(),
  store_city: z.string().optional(),
  business_hours: z.string().optional(),
  social_instagram: z.string().optional(),
  social_facebook: z.string().optional(),
  social_twitter: z.string().optional(),
  social_youtube: z.string().optional(),
  shipping_flat_rate: z.string().optional(),
  free_delivery_threshold: z.coerce.number().optional(),
  shipping_standard_rate: z.coerce.number().optional(),
  shipping_express_rate: z.coerce.number().optional(),
  cod_available: z.boolean().optional(),
  payment_methods: z.string().optional(),
  announcement_line1: z.string().optional(),
  announcement_line2: z.string().optional(),
  announcement_line3: z.string().optional(),
  hero_headline: z.string().optional(),
  hero_subtitle: z.string().optional(),
  hero_badge_text: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
  security_badges: z.string().optional(),
  trust_badges: z.string().optional(),
  postex_api_token: z.string().optional().nullable(),
  postex_webhook_secret: z.string().optional().nullable(),
  tiktok_pixel_id: z.string().optional().nullable(),
  tiktok_access_token: z.string().optional().nullable(),
})

type SettingsForm = z.infer<typeof settingsSchema>

const tabs = [
  { id: "store", label: "Store Identity", icon: Store, desc: "Name, tagline & SEO" },
  { id: "contact", label: "Contact Info", icon: Phone, desc: "Phone, email, address & hours" },
  { id: "social", label: "Social Media", icon: Instagram, desc: "Instagram, Facebook, Twitter, YouTube" },
  { id: "shipping", label: "Shipping & Payments", icon: Truck, desc: "Rates, thresholds & payment methods" },
  { id: "announcement", label: "Announcement Bar", icon: Megaphone, desc: "Top banner messages" },
  { id: "hero", label: "Hero Banner", icon: ImageIcon, desc: "Headline, subtitle & badge" },
  { id: "badges", label: "Trust Badges", icon: ShieldCheck, desc: "Security badges & trust signals" },
  { id: "integrations", label: "Integrations", icon: LinkIcon, desc: "PostEx & TikTok" },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("store")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SettingsForm>({
    store_name: "",
    store_tagline: "",
    whatsapp_number: "",
    whatsapp_message: "",
    support_phone: "",
    support_email: "",
    legal_email: "",
    privacy_email: "",
    store_address_line1: "",
    store_address_line2: "",
    store_city: "",
    business_hours: "",
    social_instagram: "",
    social_facebook: "",
    social_twitter: "",
    social_youtube: "",
    shipping_flat_rate: "",
    free_delivery_threshold: 10000,
    shipping_standard_rate: 200,
    shipping_express_rate: 500,
    cod_available: true,
    payment_methods: "",
    announcement_line1: "",
    announcement_line2: "",
    announcement_line3: "",
    hero_headline: "",
    hero_subtitle: "",
    hero_badge_text: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    security_badges: "",
    trust_badges: "",
    postex_api_token: "",
    postex_webhook_secret: "",
    tiktok_pixel_id: "",
    tiktok_access_token: "",
  })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setFormData((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) }))
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load settings")
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const validated = settingsSchema.parse(formData)

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `Server error (${res.status})`)
      }

      toast.success("Settings saved successfully!")
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message)
      } else {
        toast.error("Failed to save settings")
      }
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof SettingsForm, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const renderInput = (id: keyof SettingsForm, label: string, type = "text", placeholder = "", isSensitive = false) => {
    const isConfigured = isSensitive && formData[id] === "********"
    return (
      <div className="space-y-1.5 group">
        <div className="flex justify-between items-end">
          <label htmlFor={id} className="text-[10px] font-semibold tracking-widest uppercase text-white/70 group-focus-within:text-[#B8860B] transition-colors">
            {label}
          </label>
          {isConfigured && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Configured
            </span>
          )}
        </div>
        <input
          type={type}
          id={id}
          value={formData[id] as string || ''}
          onChange={(e) => update(id, e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 bg-white/[0.02] border border-white/10 rounded-lg px-3 text-white placeholder-white/20 focus:border-[#B8860B] focus:bg-white/[0.05] outline-none transition-all text-[12px]"
        />
      </div>
    )
  }

  const renderTextarea = (id: keyof SettingsForm, label: string, placeholder = "") => (
    <div className="space-y-1.5 group">
      <label htmlFor={id} className="text-[10px] font-semibold tracking-widest uppercase text-white/70 group-focus-within:text-[#B8860B] transition-colors">
        {label}
      </label>
      <textarea
        id={id}
        value={formData[id] as string || ''}
        onChange={(e) => update(id, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:border-[#B8860B] focus:bg-white/[0.05] outline-none transition-all text-[12px] resize-none"
      />
    </div>
  )

  const renderToggle = (id: keyof SettingsForm, label: string) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={!!formData[id]}
          onChange={(e) => update(id, e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 rounded-full bg-white/10 peer-checked:bg-emerald-500 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white peer-checked:translate-x-4 transition-transform shadow" />
      </div>
      <span className="text-[12px] text-white/70 group-hover:text-white transition-colors">{label}</span>
    </label>
  )

  const renderSectionHeader = (icon: React.ReactNode, title: string, desc: string) => (
    <div className="flex items-center gap-2.5 border-b border-white/10 pb-3 mb-5">
      <div className="p-1.5 bg-[#B8860B]/10 rounded-lg text-[#B8860B]">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <p className="text-[10px] text-white/50">{desc}</p>
      </div>
    </div>
  )

  if (loading) {
    return <div className="text-center py-20 text-white/50">Loading settings...</div>
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight mb-1">Command Center</h1>
          <p className="text-white/60 text-[12px]">Configure every aspect of your store — from branding to logistics.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#B8860B] to-[#D4A017] hover:to-[#E5B83B] text-black px-5 py-1.5 rounded-lg font-bold transition-all shadow-[0_0_16px_rgba(184,134,11,0.2)] disabled:opacity-50 text-[12px]"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#B8860B]/10 to-transparent border-l-2 border-[#B8860B]'
                    : 'hover:bg-white/[0.02] border-l-2 border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-[#B8860B]/20 text-[#B8860B]' : 'bg-white/5 text-white/60'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-semibold text-[13px] ${isActive ? 'text-[#B8860B]' : 'text-white'}`}>{tab.label}</h3>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5 hidden md:block">{tab.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <SpotlightCard className="p-5 bg-white/[0.02] border-white/5">

                {/* ────────────── STORE IDENTITY ────────────── */}
                {activeTab === "store" && (
                  <div className="space-y-5">
                    {renderSectionHeader(<Store className="w-4 h-4" />, "Store Identity", "Your brand name, tagline & SEO metadata")}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        {renderInput('store_name', 'Store Name', 'text', 'Smartwear Pakistan')}
                      </div>
                      <div className="md:col-span-2">
                        {renderInput('store_tagline', 'Store Tagline', 'text', 'Premium Watches & Accessories')}
                      </div>
                    </div>
                    <hr className="border-white/5" />
                    <div>
                      <h3 className="text-xs font-semibold text-white/80 mb-3 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-[#B8860B]" /> SEO
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {renderInput('seo_title', 'Meta Title', 'text', 'Smartwear • Premium Watches & Accessories')}
                        {renderTextarea('seo_description', 'Meta Description', "Pakistan's most trusted destination...")}
                        {renderTextarea('seo_keywords', 'Meta Keywords (comma separated)', 'smart watches, analog watches, luxury watches')}
                      </div>
                    </div>
                  </div>
                )}

                {/* ────────────── CONTACT INFO ────────────── */}
                {activeTab === "contact" && (
                  <div className="space-y-5">
                    {renderSectionHeader(<Phone className="w-4 h-4" />, "Contact Information", "Phone, email, physical address & business hours")}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <div className="p-3 bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-lg text-[11px] text-white/70">
                          These values appear on the Contact page, Footer, Terms, Privacy Policy, and the WhatsApp button.
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        {renderInput('whatsapp_number', 'WhatsApp Number (no +)', 'text', '923001234567')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        {renderInput('whatsapp_message', 'WhatsApp Prefilled Message', 'text', 'Hi Smartwear! I need help with my order.')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#B8860B] shrink-0" />
                        {renderInput('support_phone', 'Support Phone', 'text', '+92 300 1234567')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#B8860B] shrink-0" />
                        {renderInput('support_email', 'Support Email', 'email', 'concierge@smartwear.pk')}
                      </div>
                      {renderInput('legal_email', 'Legal Email (for Terms)', 'email', 'legal@smartwear.pk')}
                      {renderInput('privacy_email', 'Privacy Email (for Privacy Policy)', 'email', 'privacy@smartwear.pk')}
                    </div>

                    <hr className="border-white/5" />
                    <h3 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B8860B]" /> Physical Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderInput('store_address_line1', 'Address Line 1', 'text', 'MM Alam Road')}
                      {renderInput('store_address_line2', 'Address Line 2', 'text', 'Gulberg III')}
                      {renderInput('store_city', 'City / Region', 'text', 'Lahore, Pakistan')}
                    </div>

                    <hr className="border-white/5" />
                    <h3 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B8860B]" /> Business Hours
                    </h3>
                    {renderInput('business_hours', 'Business Hours', 'text', 'Mon-Sat: 10am - 8pm PKT')}
                  </div>
                )}

                {/* ────────────── SOCIAL MEDIA ────────────── */}
                {activeTab === "social" && (
                  <div className="space-y-5">
                    {renderSectionHeader(<Instagram className="w-4 h-4" />, "Social Media Links", "Appear in the footer and contact page")}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                        {renderInput('social_instagram', 'Instagram URL', 'url', 'https://instagram.com/smartwear.pk')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-400 shrink-0" />
                        {renderInput('social_facebook', 'Facebook URL', 'url', 'https://facebook.com/smartwear.pk')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-sky-400 shrink-0" />
                        {renderInput('social_twitter', 'Twitter / X URL', 'url', 'https://twitter.com/smartwear_pk')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-400 shrink-0" />
                        {renderInput('social_youtube', 'YouTube URL', 'url', 'https://youtube.com/@smartwearpk')}
                      </div>
                    </div>
                  </div>
                )}

                {/* ────────────── SHIPPING & PAYMENTS ────────────── */}
                {activeTab === "shipping" && (
                  <div className="space-y-5">
                    {renderSectionHeader(<Truck className="w-4 h-4" />, "Shipping & Payments", "Delivery rates, free threshold, and payment methods")}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput('free_delivery_threshold', 'Free Delivery Threshold (PKR)', 'number', '10000')}
                      {renderInput('shipping_flat_rate', 'Legacy Flat Rate (PKR)', 'number', '250')}
                      {renderInput('shipping_standard_rate', 'Standard Shipping (PKR)', 'number', '200')}
                      {renderInput('shipping_express_rate', 'Express Shipping (PKR)', 'number', '500')}
                    </div>

                    <hr className="border-white/5" />

                    <h3 className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                      <BadgePercent className="w-3.5 h-3.5 text-[#B8860B]" /> Payment Methods
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderToggle('cod_available', 'Cash on Delivery Available')}
                      {renderTextarea('payment_methods', 'Payment Methods (JSON array)', '["COD","JazzCash","Easypaisa","Bank Transfer"]')}
                    </div>
                  </div>
                )}

                {/* ────────────── ANNOUNCEMENT BAR ────────────── */}
                {activeTab === "announcement" && (
                  <div className="space-y-5">
                    {renderSectionHeader(<Megaphone className="w-4 h-4" />, "Announcement Bar", "3 rotating messages at the top of every page")}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-white/70">
                      These messages scroll in the top bar on every page. Keep them short — they auto-rotate every 4 seconds.
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {renderInput('announcement_line1', 'Announcement 1', 'text', 'Free Delivery on Orders Over Rs. 10,000')}
                      {renderInput('announcement_line2', 'Announcement 2', 'text', 'Open Box Delivery Available')}
                      {renderInput('announcement_line3', 'Announcement 3', 'text', '100% Cash on Delivery')}
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                      <p className="text-[11px] text-white/40 font-mono">
                        Preview: &ldquo;{formData.announcement_line1 || 'Free Delivery on Orders Over Rs. 10,000'}&rdquo; → &ldquo;{formData.announcement_line2 || 'Open Box Delivery Available'}&rdquo; → &ldquo;{formData.announcement_line3 || '100% Cash on Delivery'}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* ────────────── HERO BANNER ────────────── */}
                {activeTab === "hero" && (
                  <div className="space-y-5">
                    {renderSectionHeader(<ImageIcon className="w-4 h-4" />, "Hero Banner", "Main headline, subtitle, and badge on the homepage")}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        {renderInput('hero_headline', 'Headline', 'text', 'Premium Quality. No Premium Price.')}
                      </div>
                      <div className="md:col-span-2">
                        {renderTextarea('hero_subtitle', 'Subtitle', 'Smartwatches delivered to your doorstep...')}
                      </div>
                      {renderInput('hero_badge_text', 'Badge Text', 'text', 'New 2026')}
                    </div>
                  </div>
                )}

                {/* ────────────── TRUST BADGES ────────────── */}
                {activeTab === "badges" && (
                  <div className="space-y-5">
                    {renderSectionHeader(<ShieldCheck className="w-4 h-4" />, "Trust & Security Badges", "Badges shown on homepage, footer, and checkout")}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderTextarea('security_badges', 'Security Badges (Footer, Checkout) — JSON', '[{"label":"SSL Secure","icon":"Lock"},{"label":"100% COD","icon":"Banknote"}]')}
                      {renderTextarea('trust_badges', 'Trust Badges (Homepage) — JSON', '[{"label":"Fast Delivery","icon":"Truck"},{"label":"1 Year Warranty","icon":"ShieldCheck"}]')}
                    </div>
                    <div className="p-3 bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-lg flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] text-[#B8860B] font-medium">JSON Format Required</p>
                        <p className="text-[11px] text-white/60 mt-0.5">Each item needs: <code className="text-[10px] bg-black/30 px-1 rounded">label</code> (display text), <code className="text-[10px] bg-black/30 px-1 rounded">icon</code> (Lucide icon name). Icons are mapped on the frontend.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ────────────── INTEGRATIONS ────────────── */}
                {activeTab === "integrations" && (
                  <div className="space-y-8">
                    {/* PostEx */}
                    <div className="space-y-4">
                      {renderSectionHeader(<Truck className="w-4 h-4 text-blue-400" />, "PostEx Logistics", "Automated order booking and tracking")}

                      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 space-y-2">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/70">Webhook URL</p>
                        <p className="text-xs font-mono text-[#B8860B] break-all select-all">
                          {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/postex
                        </p>
                        <p className="text-[10px] text-white/40">
                          Set this URL in your PostEx dashboard. It receives real-time order status updates.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {renderInput('postex_api_token', 'PostEx API Token', 'password', 'Enter token to encrypt', true)}
                        {renderInput('postex_webhook_secret', 'PostEx Webhook Secret', 'password', 'x-postex-secret header value', true)}
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="space-y-4">
                      {renderSectionHeader(<Globe className="w-4 h-4 text-pink-400" />, "TikTok Conversions API", "Server-side event tracking for TikTok Ads")}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInput('tiktok_pixel_id', 'TikTok Pixel ID', 'text', 'CQU9XYZ123...')}
                        {renderInput('tiktok_access_token', 'TikTok CAPI Access Token', 'password', 'Enter token to encrypt', true)}
                      </div>
                    </div>
                  </div>
                )}

              </SpotlightCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

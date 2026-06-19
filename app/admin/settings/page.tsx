"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Store, Truck, Link as LinkIcon, CheckCircle2, AlertCircle, Globe } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { toast } from "sonner"
import { z } from "zod"

const settingsSchema = z.object({
  store_name: z.string().min(1, "Store name is required"),
  store_phone: z.string().optional(),
  store_email: z.string().email("Invalid email").optional().or(z.literal("")),
  shipping_flat_rate: z.string().optional(),
  postex_api_token: z.string().optional(),
  tiktok_pixel_id: z.string().optional(),
  tiktok_access_token: z.string().optional(),
})

type SettingsForm = z.infer<typeof settingsSchema>

const tabs = [
  { id: "store", label: "Store Identity", icon: Store, desc: "Manage branding & details" },
  { id: "shipping", label: "Fulfillment", icon: Truck, desc: "Delivery & shipping rules" },
  { id: "integrations", label: "Integrations", icon: LinkIcon, desc: "PostEx & TikTok" },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("store")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<SettingsForm>({
    store_name: "",
    store_phone: "",
    store_email: "",
    shipping_flat_rate: "",
    postex_api_token: "",
    tiktok_pixel_id: "",
    tiktok_access_token: "",
  })

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setFormData(data)
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

      if (!res.ok) throw new Error("Failed to save")
      
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

  const renderInput = (id: keyof SettingsForm, label: string, type = "text", placeholder = "", isSensitive = false) => {
    const isConfigured = isSensitive && formData[id] === "********"
    
    return (
      <div className="space-y-2 group">
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
        <div className="relative">
          <input
            type={type}
            id={id}
            value={formData[id] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
            placeholder={placeholder}
            className="w-full h-12 bg-white/[0.02] border border-white/10 rounded-xl px-4 text-white placeholder-white/20 focus:border-[#B8860B] focus:bg-white/[0.05] outline-none transition-all text-sm"
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-20 text-white/50">Loading settings...</div>
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-playfair mb-2">Command Center</h1>
          <p className="text-white/60">Configure your store's core operations and integrations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#B8860B] to-[#D4A017] hover:to-[#E5B83B] text-black px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(184,134,11,0.2)] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#B8860B]/10 to-transparent border-l-2 border-[#B8860B]' 
                    : 'hover:bg-white/[0.02] border-l-2 border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-[#B8860B]/20 text-[#B8860B]' : 'bg-white/5 text-white/60'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isActive ? 'text-[#B8860B]' : 'text-white'}`}>{tab.label}</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1 hidden md:block">{tab.desc}</p>
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
              <SpotlightCard className="p-8 bg-white/[0.02] border-white/5">
                
                {activeTab === "store" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-playfair text-white mb-1">Store Identity</h2>
                      <p className="text-sm text-white/50">Your brand's core details visible to customers.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        {renderInput('store_name', 'Store Name', 'text', 'Smartwear Pakistan')}
                      </div>
                      {renderInput('store_phone', 'Support Phone', 'text', 'e.g. 0300 1234567')}
                      {renderInput('store_email', 'Support Email', 'email', 'support@smartwear.pk')}
                    </div>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-xl font-playfair text-white mb-1">Fulfillment Rules</h2>
                      <p className="text-sm text-white/50">Configure shipping rates and delivery options.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {renderInput('shipping_flat_rate', 'Flat Shipping Rate (PKR)', 'number', 'e.g. 250')}
                    </div>
                    <div className="p-4 bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#B8860B] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-[#B8860B] font-medium">Free Shipping Threshold</p>
                        <p className="text-xs text-white/60 mt-1">Currently hardcoded to PKR 10,000 in the cart logic. To make it dynamic, it will require cart logic refactoring.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "integrations" && (
                  <div className="space-y-12">
                    {/* PostEx */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">PostEx Logistics</h2>
                          <p className="text-xs text-white/50">Automated order booking and tracking.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {renderInput('postex_api_token', 'PostEx API Token', 'password', 'Enter token to encrypt', true)}
                      </div>
                    </div>

                    {/* TikTok */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">TikTok Conversions API</h2>
                          <p className="text-xs text-white/50">Server-side event tracking for TikTok Ads.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderInput('tiktok_pixel_id', 'TikTok Pixel ID', 'text', 'e.g. CQU9XYZ123...')}
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

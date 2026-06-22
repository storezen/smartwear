"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Tag, Gift, Image as ImageIcon, CheckCircle2, Clock, Trash2 } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { toast } from "sonner"

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('promos') // Default to promos
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_uses: '',
    max_discount: ''
  })

  useEffect(() => {
    fetchPromos()
  }, [])

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/marketing/promos')
      const data = await res.json()
      if (Array.isArray(data)) setPromos(data)
    } catch (err) {
      toast.error('Failed to load promos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/marketing/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromo)
      })
      if (!res.ok) throw new Error('Failed to create promo')
      toast.success('Promo code created!')
      setIsModalOpen(false)
      setNewPromo({ code: '', discount_type: 'percentage', discount_value: '', min_order_value: '', max_uses: '', max_discount: '' })
      fetchPromos()
    } catch (error) {
      toast.error('Error creating promo code')
    }
  }

  const handleTogglePromo = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/marketing/promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      fetchPromos()
      toast.success('Status updated')
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return
    try {
      await fetch(`/api/admin/marketing/promos/${id}`, { method: 'DELETE' })
      fetchPromos()
      toast.success('Promo code deleted')
    } catch (error) {
      toast.error('Error deleting promo code')
    }
  }

  const handleSave = (item: string) => {
    toast.success(`${item} updated successfully!`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight mb-1">Marketing & Campaigns</h1>
          <p className="text-white/60 text-[12px]">Manage store banners, promo codes, and special offers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#B8860B] hover:bg-[#D4A017] text-white px-4 py-1.5 rounded-lg font-medium transition-colors shadow-[0_0_16px_rgba(184,134,11,0.2)] text-[11px]"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Campaign
        </button>
      </div>

      <div className="flex gap-3 border-b border-white/10 overflow-x-auto pb-2">
        {[
          { id: 'banners', label: 'Store Banners', icon: ImageIcon },
          { id: 'promos', label: 'Promo Codes', icon: Tag },
          { id: 'upsells', label: 'Upsell Offers', icon: Gift },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-white/10 text-white' 
              : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banners Section */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SpotlightCard className="p-6 border-[#B8860B]/30 shadow-[0_0_30px_rgba(184,134,11,0.05)]">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active Now
              </span>
              <button onClick={() => handleSave('Eid Mega Sale Hero')} className="text-white/40 hover:text-white text-sm">Save</button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Eid Mega Sale Hero</h3>
            <p className="text-sm text-white/60 mb-4">Replaces the main homepage banner with the Eid promotional graphics and 20% off CTA.</p>
            <div className="aspect-video rounded-lg bg-[#0C0F14] border border-white/10 flex items-center justify-center overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#B8860B]/20 to-transparent" />
               <span className="text-white/40 font-playfair text-lg">Eid Hero Preview</span>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Scheduled
              </span>
              <button onClick={() => handleSave('Top Bar Announcement')} className="text-white/40 hover:text-white text-sm">Save</button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Top Bar Announcement</h3>
            <p className="text-sm text-white/60 mb-4">"Free Shipping all over Pakistan this weekend!"</p>
            <div className="w-full py-3 rounded-lg bg-[#0C0F14] border border-white/10 flex items-center justify-center relative overflow-hidden">
               <span className="text-white/80 text-xs">Free Shipping all over Pakistan...</span>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Promos Section */}
      {activeTab === 'promos' && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-white/50">Loading promos...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sm text-white/50">
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Discount</th>
                  <th className="p-4 font-medium">Usage</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {promos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-white/50">No promo codes found</td>
                  </tr>
                ) : (
                  promos.map(promo => (
                    <tr key={promo.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{promo.code}</td>
                      <td className="p-4 text-[#D4A017] font-medium">
                        {promo.discount_type === 'percentage' && `${promo.discount_value}% OFF`}
                        {promo.discount_type === 'fixed' && `₨ ${promo.discount_value.toLocaleString()} OFF`}
                        {promo.discount_type === 'free_shipping' && `Free Shipping`}
                      </td>
                      <td className="p-4 text-white/70">{promo.usage_count} / {promo.max_uses || 'Unlimited'}</td>
                      <td className="p-4">
                        <button onClick={() => handleTogglePromo(promo.id, promo.is_active)}>
                          {promo.is_active ? (
                            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs">Active</span>
                          ) : (
                            <span className="text-white/40 bg-white/10 px-2 py-1 rounded text-xs">Expired</span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-3">
                        <button onClick={() => handleDeletePromo(promo.id)} className="text-red-400 hover:text-red-300" aria-label="Delete promo">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Upsells Section */}
      {activeTab === 'upsells' && (
        <div className="p-8 text-center text-white/50 bg-white/[0.02] border border-white/5 rounded-2xl">
          Upsell features coming soon.
        </div>
      )}

      {/* Create Promo Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#0A0D11] border border-white/10 p-6 rounded-2xl w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-white mb-4">Create Campaign (Promo)</h2>
              <form onSubmit={handleCreatePromo} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Promo Code</label>
                  <input
                    required
                    value={newPromo.code}
                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                    className="w-full bg-[#13171F] border border-white/10 rounded-lg p-2.5 text-white"
                    placeholder="e.g. SUMMER20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Type</label>
                    <select
                      value={newPromo.discount_type}
                      onChange={e => setNewPromo({...newPromo, discount_type: e.target.value})}
                      className="w-full bg-[#13171F] border border-white/10 rounded-lg p-2.5 text-white"
                    >
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed">Fixed Amount Off</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>
                  {newPromo.discount_type !== 'free_shipping' && (
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Value</label>
                      <input
                        required
                        type="number"
                        value={newPromo.discount_value}
                        onChange={e => setNewPromo({...newPromo, discount_value: e.target.value})}
                        className="w-full bg-[#13171F] border border-white/10 rounded-lg p-2.5 text-white"
                        placeholder={newPromo.discount_type === 'percentage' ? '10' : '500'}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Min Order Value</label>
                    <input
                      type="number"
                      value={newPromo.min_order_value}
                      onChange={e => setNewPromo({...newPromo, min_order_value: e.target.value})}
                      className="w-full bg-[#13171F] border border-white/10 rounded-lg p-2.5 text-white"
                      placeholder="e.g. 5000 (Optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Max Uses</label>
                    <input
                      type="number"
                      value={newPromo.max_uses}
                      onChange={e => setNewPromo({...newPromo, max_uses: e.target.value})}
                      className="w-full bg-[#13171F] border border-white/10 rounded-lg p-2.5 text-white"
                      placeholder="Unlimited (Optional)"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#B8860B] hover:bg-[#D4A017] rounded-xl text-white font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

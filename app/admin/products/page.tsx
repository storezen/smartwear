"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Archive, Eye, Edit2, Package as PackageIcon, Trash2, Tag, DollarSign, Image as ImageIcon, Box, ArrowLeft, CheckSquare, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { toast } from "sonner"
import { ProductStatusEnum } from "@/lib/validations/products"
import { CsvImporter } from "@/components/admin/csv-importer"
import { FileSpreadsheet } from "lucide-react"

const STATUSES = ProductStatusEnum.options;
const CATEGORIES = ['All', 'smart-watches', 'analog-watches', 'ladies-watches', 'watch-bands', 'phone-cases', 'watch-cases', 'power-banks', 'audio', 'chargers', 'accessories']

export default function AdminProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false) // Will be used as Sheet open state
  const [showImporter, setShowImporter] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterCategory, setFilterCategory] = useState("All")

  // Bulk Actions
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category_slug: 'Smartwatches',
    price: '',
    compare_price: '',
    stock: '',
    status: 'Draft',
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'],
    colors: ''
  })

  const load = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Please fill in required fields: Name and Price")
      return
    }

    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price),
        compare_price: formData.compare_price ? parseInt(formData.compare_price) : undefined,
        stock: parseInt(formData.stock) || 0,
        slug: formData.name.toLowerCase().replace(/ /g, '-'),
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      }

      const method = editingId ? 'PUT' : 'POST'
      if (editingId) (payload as any).id = editingId

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        toast.success(`Product ${editingId ? 'updated' : 'added'} successfully!`)
        setShowAddModal(false)
        setEditingId(null)
        load()
      } else {
        const err = await res.json()
        toast.error(`Failed: ${err.error || "Unknown error"}`)
      }
    } catch (e) {
      toast.error("An error occurred while saving")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Product deleted")
        setProducts(products.filter(p => p.id !== id))
      } else {
        toast.error("Failed to delete")
      }
    } catch(e) {
      toast.error("Error deleting product")
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm("DANGER: Are you sure you want to delete ALL products? This cannot be undone!")) return;
    try {
      const res = await fetch('/api/products/delete-all', { method: 'DELETE' })
      if (res.ok) {
        toast.success("All products deleted!")
        setProducts([])
      } else {
        toast.error("Failed to delete all products")
      }
    } catch(e) {
      toast.error("Error deleting products")
    }
  }

  const openEdit = (p: any) => {
    setFormData({
      name: p.name,
      category_slug: p.category_slug || 'Smartwatches',
      price: p.price.toString(),
      compare_price: p.compare_price ? p.compare_price.toString() : '',
      stock: p.stock?.toString() || '0',
      status: p.status || 'Draft',
      images: p.images || [],
      colors: p.colors ? p.colors.join(', ') : ''
    })
    setEditingId(p.id)
    setShowAddModal(true)
  }

  const openAdd = () => {
    setFormData({
      name: '', category_slug: 'Smartwatches', price: '', compare_price: '', stock: '10', status: 'Draft',
      images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'],
      colors: ''
    })
    setEditingId(null)
    setShowAddModal(true)
  }

  const toggleProductSelection = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    setSelectedProducts(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (!confirm(`Update ${selectedProducts.length} products to ${status}?`)) return
    
    try {
      // Basic sequential update for now
      for (const id of selectedProducts) {
        const product = products.find(p => p.id === id);
        if(!product) continue;
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, status })
        })
      }
      toast.success(`Successfully updated ${selectedProducts.length} products`)
      setSelectedProducts([])
      load()
    } catch(e) {
      toast.error("Error during bulk update")
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return
    try {
      for (const id of selectedProducts) {
        await fetch(`/api/products?id=${id}`, { method: 'DELETE' })
      }
      toast.success(`Deleted ${selectedProducts.length} products`)
      setSelectedProducts([])
      load()
    } catch(e) {
      toast.error("Error during bulk delete")
    }
  }

  const handleDeleteAllProducts = async () => {
    if (!confirm("⚠️ WARNING: Are you absolutely sure you want to delete ALL products in your database? This action CANNOT be undone!")) return;
    try {
      setLoading(true)
      const res = await fetch('/api/products?deleteAll=true', { method: 'DELETE' })
      if (res.ok) {
        toast.success("All products have been deleted successfully.")
        setSelectedProducts([])
        load()
      } else {
        toast.error("Failed to delete all products")
        setLoading(false)
      }
    } catch(e) {
      toast.error("Error deleting all products")
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus
    const matchesCategory = filterCategory === 'All' || (() => {
      const c = (p.category_slug || '').toLowerCase();
      const cat = filterCategory.toLowerCase();
      return c === cat;
    })();
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-playfair mb-2">Products Catalog</h1>
          <p className="text-white/60 text-sm">Manage inventory, pricing, and statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDeleteAllProducts}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" /> Delete All
          </button>
          <button 
            onClick={() => setShowImporter(true)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import CSV
          </button>
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#B8860B] hover:bg-[#D4A017] text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-[0_0_20px_rgba(184,134,11,0.2)]"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-white/10 pb-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                filterCategory === cat 
                ? 'bg-[#B8860B] text-white shadow-[0_0_15px_rgba(184,134,11,0.3)]' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'All Categories' : cat.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#B8860B] transition-colors w-[200px]"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#B8860B]"
          >
            <option value="All">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedProducts.length > 0 && (
        <div className="bg-[#B8860B]/20 border border-[#B8860B]/30 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium text-sm">{selectedProducts.length} products selected</span>
            <button onClick={() => setSelectedProducts([])} className="text-white/60 hover:text-white text-xs underline">Clear</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs mr-2">Change status to:</span>
            {['Active', 'Draft', 'Archived'].map(status => (
              <button 
                key={status}
                onClick={() => handleBulkStatusUpdate(status)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                {status}
              </button>
            ))}
            <div className="w-px h-4 bg-white/20 mx-2"></div>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Product List View */}
      {loading ? (
        <div className="text-center py-12 text-white/50">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center mt-6">
          <PackageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Products Found</h3>
          <p className="text-white/50 text-sm max-w-md mx-auto">Adjust filters or add a new product.</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40 bg-white/5">
                  <th className="p-4 w-12 text-center">
                    <button onClick={() => {
                      if (selectedProducts.length === filteredProducts.length) setSelectedProducts([])
                      else setSelectedProducts(filteredProducts.map(p => p.id))
                    }} className="text-white/40 hover:text-white">
                      <CheckSquare className="w-4 h-4 mx-auto" />
                    </button>
                  </th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium text-right">Price</th>
                  <th className="p-4 font-medium text-center">Stock</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    onClick={() => toggleProductSelection({ stopPropagation: () => {} } as any, product.id)}
                    className={`border-b border-white/5 transition-colors cursor-pointer ${
                      selectedProducts.includes(product.id) ? 'bg-[#B8860B]/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="p-4 text-center">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center mx-auto transition-colors ${
                        selectedProducts.includes(product.id) ? 'bg-[#B8860B] border-[#B8860B] text-black' : 'border-white/20 text-transparent'
                      }`}>
                        <CheckSquare className="w-3 h-3" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#0F1923] border border-white/5 overflow-hidden shrink-0">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-[#B8860B] transition-colors">{product.name}</p>
                          <p className="text-[10px] text-white/40 font-mono mt-0.5">{product.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-white/5 text-white/60 text-xs px-2.5 py-1 rounded-md border border-white/10 uppercase tracking-wider">
                        {product.category_slug}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-sm font-medium text-[#D4A017]">₨ {product.price?.toLocaleString()}</p>
                      {product.compare_price && (
                        <p className="text-[10px] text-white/40 line-through">₨ {product.compare_price.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border ${
                        product.stock > 10 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        product.stock > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <Box className="w-3 h-3" /> {product.stock || 0}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                        product.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        product.status === 'Draft' ? 'bg-white/10 text-white/60 border-white/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {product.status || 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEdit(product); }} 
                          className="w-8 h-8 rounded hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); window.open(`/products/${product.slug}`, '_blank'); }} 
                          className="w-8 h-8 rounded hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} 
                          className="w-8 h-8 rounded hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Edit Sheet */}
      <Sheet open={showAddModal} onOpenChange={setShowAddModal}>
        <SheetContent className="bg-[#0C0F14] border-l border-white/10 w-full sm:max-w-2xl overflow-y-auto p-0">
          {/* Animated top gradient border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B8860B] to-transparent opacity-50" />

          <div className="p-6 md:p-8 border-b border-white/5 sticky top-0 bg-[#0C0F14]/90 backdrop-blur-xl z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <SheetTitle className="text-2xl font-bold text-white font-playfair">{editingId ? 'Edit Product' : 'New Product'}</SheetTitle>
              <p className="text-sm text-white/50 mt-1">{editingId ? 'Update details and pricing.' : 'Add a new masterpiece.'}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <SheetClose className="px-5 py-2.5 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 text-sm">
                Cancel
              </SheetClose>
              <button onClick={handleSaveProduct} className="bg-gradient-to-r from-[#B8860B] to-[#D4A017] hover:to-[#E5B83B] text-black px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(184,134,11,0.2)] hover:shadow-[0_0_30px_rgba(184,134,11,0.4)] text-sm">
                {editingId ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-8">
            {/* General Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2"><Tag className="w-4 h-4 text-[#B8860B]" /> General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Product Name</label>
                  <input type="text" placeholder="e.g. Apple Watch Ultra" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#B8860B] focus:bg-white/10 transition-all shadow-inner" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Category</label>
                  <div className="relative">
                    <select value={formData.category_slug} onChange={e => setFormData({...formData, category_slug: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#B8860B] focus:bg-white/10 transition-all appearance-none shadow-inner">
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c} className="bg-[#0C0F14]">{c.replace('-', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 group">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> Colors (Comma separated)
                </label>
                <input type="text" placeholder="e.g. Space Black, Silver, Gold" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#B8860B] focus:bg-white/10 transition-all shadow-inner" />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#B8860B]" /> Pricing & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest">Price (PKR)</label>
                  <input type="number" placeholder="185000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#B8860B] transition-all font-mono shadow-inner" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Compare Price</label>
                  <input type="number" placeholder="200000" value={formData.compare_price} onChange={e => setFormData({...formData, compare_price: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white/60 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all font-mono shadow-inner line-through" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Stock</label>
                  <input type="number" placeholder="10" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#B8860B] transition-all font-mono shadow-inner" />
                </div>
              </div>
            </div>

            {/* Status & Media */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#B8860B]" /> Status & Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Visibility Status</label>
                  <div className="relative">
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#B8860B] focus:bg-white/10 transition-all appearance-none shadow-inner font-semibold">
                      {STATUSES.map(s => <option key={s} value={s} className="bg-[#0C0F14]">{s}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-widest">Primary Image URL</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {formData.images[0] ? (
                        <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-white/20" />
                      )}
                    </div>
                    <input type="text" placeholder="https://..." value={formData.images[0] || ''} onChange={e => setFormData({...formData, images: [e.target.value]})} className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#B8860B] transition-all font-mono text-sm" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Danger Zone */}
            {editingId && (
              <div className="mt-12 pt-6 border-t border-rose-500/20">
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setTimeout(() => handleDeleteProduct(editingId), 300);
                  }}
                  className="flex items-center gap-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Delete this product
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CsvImporter 
        isOpen={showImporter} 
        onClose={() => setShowImporter(false)} 
        onSuccess={load} 
      />
    </div>
  )
}

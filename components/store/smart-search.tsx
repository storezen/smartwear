"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Command, ArrowRight, ArrowUpRight, Clock, Star, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SmartSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  // Fetch products when opened
  useEffect(() => {
    if (isOpen && products.length === 0) {
      setLoading(true)
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          setProducts(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setSelectedIndex(0)
    }
    
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Global hotkey listener is handled in Navbar usually, but we can also bind it here if needed.
  // Actually, let's keep the global hotkey in the Navbar to open it.
  
  // Search logic
  const filteredProducts = query.trim() === '' 
    ? products.filter(p => p.is_featured).slice(0, 5) // Trending/Featured when empty
    : products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category_slug.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % (filteredProducts.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + (filteredProducts.length || 1)) % (filteredProducts.length || 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredProducts[selectedIndex]) {
          router.push(`/products/${filteredProducts[selectedIndex].slug}`)
          onClose()
        } else if (query.trim()) {
          router.push(`/products?search=${encodeURIComponent(query)}`)
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredProducts, selectedIndex, query, router, onClose])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const selectedProduct = filteredProducts[selectedIndex]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0C0F14]/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-3xl bg-[#0C0F14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[70vh] md:h-[500px]"
          >
            {/* Left/Main Column: Search & List */}
            <div className="flex-1 flex flex-col border-r border-white/5 relative">
              {/* Search Header */}
              <div className="flex items-center px-4 py-4 border-b border-white/5 relative z-10">
                <Search className="w-5 h-5 text-white/40 mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for luxury timepieces..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-lg"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 text-white/40 hover:text-white mr-2" aria-label="Clear search">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="hidden md:flex items-center gap-1 text-[10px] text-white/40 font-mono tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10">
                  <span>ESC</span>
                </div>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-white/40 text-sm">
                    <Zap className="w-4 h-4 animate-pulse mr-2 text-[#B8860B]" /> Loading collection...
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="space-y-1">
                    {!query && (
                      <div className="px-3 py-2 text-xs font-semibold tracking-widest text-white/30 uppercase flex items-center gap-2">
                        <Star className="w-3 h-3" /> Trending Now
                      </div>
                    )}
                    {filteredProducts.map((product, idx) => (
                      <div
                        key={product.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => {
                          router.push(`/products/${product.slug}`)
                          onClose()
                        }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group",
                          selectedIndex === idx 
                            ? "bg-white/10" 
                            : "hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0C0F14] border border-white/10 overflow-hidden shrink-0 relative">
                            {product.images && product.images[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-white/5" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              "text-sm font-medium transition-colors",
                              selectedIndex === idx ? "text-[#B8860B]" : "text-white"
                            )}>
                              {product.name}
                            </span>
                            <span className="text-xs text-white/40 capitalize">{product.category_slug.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <ArrowRight className={cn(
                          "w-4 h-4 transition-all",
                          selectedIndex === idx ? "opacity-100 text-[#B8860B] translate-x-0" : "opacity-0 -translate-x-2 text-white/20"
                        )} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/40 p-6 text-center">
                    <Search className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">No results found for "{query}"</p>
                    <p className="text-xs mt-1 opacity-60">Try searching for a different brand or model</p>
                  </div>
                )}
              </div>
              
              {/* Footer Actions */}
              <div className="hidden md:flex items-center gap-4 px-4 py-3 border-t border-white/5 text-[10px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-white/10 border border-white/20">↵</span> to select
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-white/10 border border-white/20">↑</span>
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-white/10 border border-white/20">↓</span> to navigate
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Preview */}
            <div className="hidden md:flex w-[40%] bg-gradient-to-br from-white/[0.02] to-transparent flex-col relative overflow-hidden">
              {selectedProduct ? (
                <div className="p-6 h-full flex flex-col relative z-10">
                  <div className="flex-1">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0C0F14] border border-white/5 mb-6 group">
                      {selectedProduct.images && selectedProduct.images[0] ? (
                        <Image 
                          src={selectedProduct.images[0]} 
                          alt={selectedProduct.name} 
                          fill 
                          sizes="40vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F14] to-transparent opacity-60" />
                      
                      {selectedProduct.stock > 0 ? (
                        <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md border border-emerald-500/20">
                          In Stock
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider backdrop-blur-md border border-red-500/20">
                          Out of Stock
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
                      {selectedProduct.name}
                    </h3>
                    <p className="text-[#D4A017] font-semibold text-lg mb-4">₨ {selectedProduct.price.toLocaleString()}</p>
                    
                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Available Colors</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {selectedProduct.colors.slice(0, 4).map((c: string) => (
                            <span key={c} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-white/70">{c}</span>
                          ))}
                          {selectedProduct.colors.length > 4 && <span className="text-xs text-white/40">+{selectedProduct.colors.length - 4}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => {
                      router.push(`/products/${selectedProduct.slug}`)
                      onClose()
                    }}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold flex items-center justify-center gap-2 transition-colors mt-auto group"
                  >
                    View Details <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-6 md:p-8 text-center">
                  <Search className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm font-medium">Search the Collection</p>
                  <p className="text-xs mt-2 opacity-60">Discover our exclusive range of luxury timepieces.</p>
                </div>
              )}
              
              {/* Subtle background glow */}
              <div className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] bg-[#B8860B] opacity-10 blur-[100px] pointer-events-none rounded-full" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

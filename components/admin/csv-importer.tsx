"use client"

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CsvImporterProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CsvImporter({ isOpen, onClose, onSuccess }: CsvImporterProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [stats, setStats] = useState({ totalRows: 0, productsFound: 0 })
  const [defaultCategory, setDefaultCategory] = useState('Smartwatches')
  const [overwriteExisting, setOverwriteExisting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a valid CSV file')
        return
      }
      setFile(selectedFile)
      parseCsv(selectedFile)
    }
  }

  const parseCsv = (fileToParse: File) => {
    setIsParsing(true)
    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]
        
        // Group by Handle to merge variants and images
        const productMap = new Map<string, any>()
        
        rows.forEach((row) => {
          const handle = row['Handle']
          if (!handle) return

          const priceStr = row['Variant Price'] || '0'
          const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0
          
          const comparePriceStr = row['Variant Compare At Price'] || ''
          const comparePrice = comparePriceStr ? parseFloat(comparePriceStr.replace(/[^0-9.]/g, '')) : null

          const stockStr = row['Variant Inventory Qty'] || '0'
          const stock = parseInt(stockStr, 10) || 0

          const imageUrl = row['Image Src'] || row['Variant Image'] || ''
          
          // Tags
          const rawTags = row['Tags'] || ''
          const parsedTags = rawTags ? rawTags.split(',').map((t: string) => t.trim()).filter(Boolean) : []
          
          // Deep Smart Category Extraction
          const title = (row['Title'] || handle).toLowerCase()
          const type = (row['Product Category'] || row['Type'] || '').toLowerCase()
          const searchStr = `${title} ${type} ${rawTags.toLowerCase()}`
          
          let category = 'smart-watches' // Default
          
          if (/(strap|band|cable|charger|case|cover|protector|airpods|earbud|pod|wisme|adapter)/i.test(searchStr)) {
            category = 'accessories'
          } else if (/(analog|rolex|rolx|patek|richard|citizen|seiko|mechanic|quartz|luxury|automatic|casio|edifice|hublot|versace|vr\s*\d+|vr\d+|chain)/i.test(searchStr)) {
            category = 'analog-watches'
          } else if (/(smart|series|ultra|apple|watch\s*\d+|ws-|hw\d+|t800|t900|samsung|huawei|kieslect|mibro|hk\d+|dt\d+)/i.test(searchStr)) {
            category = 'smart-watches'
          } else if (type.includes('analog') || rawTags.toLowerCase().includes('analog')) {
            category = 'analog-watches'
          } else if (type.includes('accessory') || rawTags.toLowerCase().includes('accessory')) {
            category = 'accessories'
          }

          if (!productMap.has(handle)) {
            // Create base product
            productMap.set(handle, {
              slug: handle,
              name: row['Title'] || handle,
              description: row['Body (HTML)'] || '',
              price: price,
              compare_price: comparePrice,
              stock: stock,
              brand: row['Vendor'] || 'Smartwear',
              category_slug: category,
              images: imageUrl ? [imageUrl] : [],
              tags: parsedTags,
              is_active: true,
              is_featured: false,
              specifications: {},
              rating: 4.8,
              reviews_count: Math.floor(Math.random() * 50) + 5
            })
          } else {
            // Update existing product with variant info
            const existing = productMap.get(handle)
            
            // In Shopify, the primary row has the Title, but subsequent rows might only have Image Src and Handle
            // So if the primary row didn't have price/stock, we might update it here if this row has them.
            if (existing.price === 0 && price > 0) existing.price = price;
            if (existing.compare_price === null && comparePrice) existing.compare_price = comparePrice;

            // Add unique images
            if (imageUrl && !existing.images.includes(imageUrl)) {
              existing.images.push(imageUrl)
            }
            
            // Add unique tags
            parsedTags.forEach((t: string) => {
              if (!existing.tags.includes(t)) existing.tags.push(t)
            })

            // Update stock (aggregate variant stock)
            existing.stock += stock
          }
          
          // Add specifications from all 3 variant options
          const options = [
            { name: row['Option1 Name'], value: row['Option1 Value'] },
            { name: row['Option2 Name'], value: row['Option2 Value'] },
            { name: row['Option3 Name'], value: row['Option3 Value'] }
          ]

          const existing = productMap.get(handle)
          options.forEach(opt => {
            if (opt.name && opt.name !== 'Title' && opt.value && opt.value !== 'Default Title') {
              if (!existing.specifications[opt.name]) {
                 existing.specifications[opt.name] = opt.value
              } else if (!existing.specifications[opt.name].includes(opt.value)) {
                 existing.specifications[opt.name] += `, ${opt.value}`
              }
            }
          })
          
          // Ensure at least one placeholder image if empty
          if (existing.images.length === 0) {
            existing.images.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80')
          }
        })

        const products = Array.from(productMap.values())
        setPreviewData(products)
        setStats({
          totalRows: results.data.length,
          productsFound: products.length
        })
        setIsParsing(false)
      },
      error: (error: any) => {
        toast.error(`Error parsing CSV: ${error.message}`)
        setIsParsing(false)
      }
    })
  }

  const handleUpload = async () => {
    if (previewData.length === 0) return

    setIsUploading(true)
    try {
      const BATCH_SIZE = 200;
      const totalBatches = Math.ceil(previewData.length / BATCH_SIZE);
      let successCount = 0;

      for (let i = 0; i < totalBatches; i++) {
        const batch = previewData.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        
        const response = await fetch('/api/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            products: batch,
            overwrite: overwriteExisting
          }),
        })

        const data = await response.json()

        if (!response.ok) throw new Error(data.error || `Failed on batch ${i + 1}`)
        successCount += batch.length;
        
        // Optional: Show toast for progress if many batches
        if (totalBatches > 1) {
          toast.success(`Imported ${successCount} of ${previewData.length} products...`)
        }
      }

      toast.success('All products imported successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreviewData([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0C0F14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Import Products (CSV)</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-gold/50 bg-white/[0.01] rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/10 group-hover:text-gold transition-colors">
                  <Upload className="w-8 h-8 text-white/40 group-hover:text-gold" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Click to upload CSV</h3>
                <p className="text-sm text-white/40 max-w-sm">
                  Upload a Shopify-formatted CSV file. We will extract Titles, Prices, Images, and Categories automatically.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-sm text-white/40">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-sm text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                </div>

                {isParsing ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
                    <p className="text-white/60">Parsing CSV rows...</p>
                  </div>
                ) : previewData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-sm text-white/40 mb-1">Rows Parsed</p>
                        <p className="text-2xl font-bold text-white">{stats.totalRows}</p>
                      </div>
                      <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <p className="text-sm text-emerald-400/60 mb-1">Unique Products</p>
                        <p className="text-2xl font-bold text-emerald-400">{stats.productsFound}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
                      <p className="text-sm text-white/60 mb-2 font-medium">Preview (First 3 products)</p>
                      <div className="space-y-2">
                        {previewData.slice(0, 3).map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white truncate pr-4">{p.name}</span>
                            <span className="text-emerald-400 shrink-0">Rs. {p.price}</span>
                          </div>
                        ))}
                        {previewData.length > 3 && (
                          <p className="text-xs text-white/40 pt-2 text-center border-t border-white/10 mt-2">
                            + {previewData.length - 3} more products
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category Selector */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <label className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2 block">
                          Default Category
                        </label>
                        <select
                          value={defaultCategory}
                          onChange={(e) => setDefaultCategory(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-gold"
                        >
                          <option value="Smartwatches">Smartwatches</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Straps">Straps</option>
                          <option value="Audio">Audio</option>
                        </select>
                        <p className="text-[10px] text-white/40 mt-2">Applied if CSV category is missing.</p>
                      </div>

                      {/* Overwrite Toggle */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <label className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2 block">
                            Handling Duplicates
                          </label>
                          <p className="text-[10px] text-white/40 mb-3">
                            Should we overwrite products that already exist?
                          </p>
                        </div>
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              checked={overwriteExisting}
                              onChange={() => setOverwriteExisting(!overwriteExisting)}
                            />
                            <div className={`block w-10 h-6 rounded-full transition-colors ${overwriteExisting ? 'bg-gold' : 'bg-white/20'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${overwriteExisting ? 'transform translate-x-4' : ''}`}></div>
                          </div>
                          <div className="ml-3 text-sm font-medium text-white">
                            {overwriteExisting ? 'Overwrite' : 'Skip Existing'}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">No valid products found in the CSV. Ensure headers match Shopify format (Handle, Title, Variant Price, etc).</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || previewData.length === 0}
                    className="px-6 py-2.5 rounded-xl font-medium text-black bg-gradient-to-r from-[#D4A017] to-[#B8860B] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Import {stats.productsFound} Products
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

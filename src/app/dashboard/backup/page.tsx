"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Upload, Database, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { toast } from "sonner"

const STORAGE_KEYS = [
  "smartwear-products",
  "smartwear-categories",
  "smartwear-sections",
  "smartwear-cod-orders",
  "smartwear-cart",
  "smartwear-coupons",
  "smartwear-theme",
  "smartwear-seo",
  "smartwear-store-meta",
  "smartwear-media",
]

export default function BackupPage() {
  const [importing, setImporting] = useState(false)

  function handleExport() {
    const data: Record<string, unknown> = {}
    for (const key of STORAGE_KEYS) {
      try {
        const val = localStorage.getItem(key)
        if (val) data[key] = JSON.parse(val)
      } catch { /* skip */ }
    }
    data["_exportedAt"] = new Date().toISOString()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `smartwear-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Backup downloaded")
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        let count = 0
        for (const key of STORAGE_KEYS) {
          if (data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[key]))
            count++
          }
        }
        toast.success(`Imported ${count} data sets. Refreshing...`)
        setTimeout(() => window.location.reload(), 1500)
      } catch {
        toast.error("Invalid backup file")
        setImporting(false)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Backup & Restore" description="Export your store data or restore from a previous backup." />

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-emerald-50 border border-emerald-100/60">
                  <Download className="size-5 text-emerald-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Export Data</h3>
                  <p className="text-sm font-medium text-neutral-500 mt-0.5">Download products, orders, & settings</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium leading-relaxed text-neutral-500 mb-6">
                Downloads a JSON file with your entire store data. Keep this file safe — use it to restore your store after clearing browser data.
              </p>
              <Button onClick={handleExport} className="w-full gap-2 h-[48px] rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <Download className="size-4" strokeWidth={2} /> Download Backup
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-amber-50 border border-amber-100/60">
                  <Upload className="size-5 text-amber-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Restore Data</h3>
                  <p className="text-sm font-medium text-neutral-500 mt-0.5">Restore from a previous backup file</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium leading-relaxed text-neutral-500 mb-6">
                Choose a backup JSON file to restore. This will overwrite your current data. The page will refresh after import.
              </p>
              <label className="flex w-full cursor-pointer">
                <Button variant="outline" className="w-full gap-2 relative h-[48px] rounded-full font-bold bg-white border-neutral-200/60 text-neutral-700 hover:bg-neutral-50 shadow-sm pointer-events-none" disabled={importing}>
                  {importing ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <Upload className="size-4" strokeWidth={2} />}
                  {importing ? "Restoring..." : "Choose Backup File"}
                </Button>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-blue-50 border border-blue-100/60">
                <Database className="size-5 text-blue-600" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Stored Data Overview</h3>
                <p className="text-sm font-medium text-neutral-500 mt-0.5">Currently stored in your browser</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {STORAGE_KEYS.map((key) => {
                let size = "0 KB"
                let exists = false
                if (typeof window !== "undefined") {
                  try {
                    const val = localStorage.getItem(key)
                    if (val) {
                      size = `${(new Blob([val]).size / 1024).toFixed(1)} KB`
                      exists = true
                    }
                  } catch { /* */ }
                }
                return (
                  <div key={key} className="flex items-center justify-between rounded-[20px] border border-neutral-200/60 bg-white p-4 transition-colors hover:bg-neutral-50">
                    <div className="flex items-center gap-3">
                      {exists ? <CheckCircle2 className="size-5 text-emerald-500" strokeWidth={2} /> : <AlertTriangle className="size-5 text-neutral-400" strokeWidth={2} />}
                      <span className="text-sm font-bold text-neutral-900">{key.replace("smartwear-", "")}</span>
                    </div>
                    {exists ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wide border border-blue-100">{size}</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold text-neutral-500 uppercase tracking-wide">empty</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

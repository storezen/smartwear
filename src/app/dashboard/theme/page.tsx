"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Palette, Check, Save, Sun, Moon, Undo, RotateCcw, Eye, Sparkles, Wand2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getThemeData, saveThemeData, applyThemeMode, applyPreset, getPresets,
  type SavedThemeData, type ThemeConfig, type ThemeColorKey,
} from "@/lib/theme"

const presets = getPresets()

const COLOR_KEYS: { key: ThemeColorKey; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Text" },
  { key: "card", label: "Card" },
  { key: "muted", label: "Muted" },
  { key: "border", label: "Border" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "destructive", label: "Danger" },
]

function ThemePreviewCard({ config, mode }: { config: ThemeConfig; mode: "light" | "dark" }) {
  return (
    <div className={cn(
      "w-full space-y-2 rounded-lg border p-3 transition-shadow",
      mode === "dark" ? "bg-[#161616]" : "bg-white",
    )} style={{ borderColor: config.border }}>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: config.primary, borderColor: config.border }} />
        <div className="h-2 w-16 rounded" style={{ backgroundColor: config.muted }} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-full rounded" style={{ backgroundColor: config.muted }} />
          <div className="h-2 w-3/4 rounded" style={{ backgroundColor: config.muted }} />
        </div>
        <div className="flex gap-1">
          {[config.primary, config.accent, config.success].map((c, i) => (
            <div key={i} className="h-8 w-8 rounded-md" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ThemePage() {
  const [themeData, setThemeData] = useState<SavedThemeData>(getThemeData)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(themeData.presetIndex)
  const [mode, setMode] = useState<"light" | "dark">(themeData.mode)
  const [previewMode, setPreviewMode] = useState<"light" | "dark">(themeData.mode)
  const [savedData, setSavedData] = useState<string>("")
  const [customizing, setCustomizing] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    setSavedData(JSON.stringify(themeData))
  }, [])

  const hasChanges = JSON.stringify(themeData) !== savedData

  const currentConfig = mode === "light" ? themeData.light : themeData.dark

  function applyPresetAndSave(index: number) {
    const updated = applyPreset(index)
    updated.mode = mode
    setThemeData(updated)
    setSelectedPreset(index)
    setCustomizing(false)
    applyThemeMode(updated)
    toast.success(`Applied "${presets[index].name}" theme`)
  }

  function handleSave() {
    const toSave = { ...themeData, mode }
    saveThemeData(toSave)
    applyThemeMode(toSave)
    setSavedData(JSON.stringify(toSave))
    toast.success("Theme saved")
  }

  function handleReset() {
    const fresh = getThemeData()
    fresh.mode = mode
    setThemeData(fresh)
    setSelectedPreset(fresh.presetIndex)
    setCustomizing(false)
    applyThemeMode(fresh)
    toast.success("Reset to default")
  }

  const updateColor = useCallback((key: ThemeColorKey, value: string) => {
    setThemeData((prev) => {
      const config = { ...(mode === "light" ? prev.light : prev.dark), [key]: value }
      const next = mode === "light" ? { ...prev, light: config } : { ...prev, dark: config }
      applyThemeMode({ ...next, mode })
      return next
    })
    setSelectedPreset(null)
  }, [mode])

  async function handleAiGenerate() {
    if (!aiPrompt) return
    setAiLoading(true)
    try {
      const res = await fetch("/api/ai/page-builder/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      })
      const data = await res.json()
      if (data.theme) {
        setThemeData(prev => {
          const next = mode === "light" ? { ...prev, light: data.theme } : { ...prev, dark: data.theme }
          applyThemeMode({ ...next, mode })
          return next
        })
        setSelectedPreset(null)
        setCustomizing(true)
        toast.success("AI generated a unique theme!")
      } else {
        toast.error("Failed to generate theme")
      }
    } catch (e) {
      toast.error("Network error during AI generation")
    } finally {
      setAiLoading(false)
      setAiPrompt("")
    }
  }

  const current = mode === "light" ? themeData.light : themeData.dark

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white border border-neutral-200/60 shadow-sm">
              <Palette className="h-6 w-6 text-neutral-900" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Themes</h1>
              <p className="mt-1 text-sm font-medium text-neutral-500">Choose a preset or customize your store&apos;s look and feel.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} className="gap-2 h-[48px] px-6 rounded-full font-bold bg-white border-neutral-200/60 text-neutral-700 hover:bg-neutral-50 shadow-sm">
            <RotateCcw className="size-4" strokeWidth={2} /> Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges} className="gap-2 h-[48px] px-8 rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed">
            <Save className="size-4" strokeWidth={2} /> {hasChanges ? "Save Theme" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Light/Dark toggle */}
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-200/60 bg-white p-1.5 w-fit shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        {(["light", "dark"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setPreviewMode(m) }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
              mode === m
                ? "bg-neutral-100 text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50",
            )}
          >
            {m === "light" ? <Sun className="size-4" strokeWidth={2} /> : <Moon className="size-4" strokeWidth={2} />}
            {m === "light" ? "Light" : "Dark"}
          </button>
        ))}
      </div>

      {/* Preset cards */}
      <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-neutral-500" strokeWidth={2} />
            <h2 className="text-lg font-bold text-neutral-900">Theme Presets</h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600 uppercase tracking-wider">
            {customizing ? "Custom" : `${presets[selectedPreset ?? 0]?.name || "Custom"} selected`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {presets.map((preset, i) => {
            const isActive = selectedPreset === i && !customizing
            return (
              <motion.button
                key={preset.name}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyPresetAndSave(i)}
                className={cn(
                  "group relative rounded-[20px] border-2 p-4 text-left transition-all",
                  isActive
                    ? "border-neutral-900 bg-neutral-50 shadow-md"
                    : "border-neutral-200/60 bg-white hover:border-neutral-300 hover:shadow-sm",
                )}
              >
                {isActive && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 shadow-sm">
                    <Check className="size-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
                <ThemePreviewCard config={preset.light} mode="light" />
                <ThemePreviewCard config={preset.dark} mode="dark" />
                <p className={cn(
                  "mt-3 text-sm font-bold text-center",
                  isActive ? "text-neutral-900" : "text-neutral-500",
                )}>{preset.name}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* AI Generator Panel */}
      <div className="bg-white border border-fuchsia-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-50/50 to-purple-50/50 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="size-5 text-fuchsia-600" strokeWidth={2} />
            <h2 className="text-lg font-bold text-neutral-900">AI Theme Generator</h2>
          </div>
          <p className="text-sm text-neutral-600 mb-4 max-w-2xl">
            Describe the mood or brand identity you want, and AI will create a perfectly matching 10-color palette instantly.
          </p>
          <div className="flex gap-3 max-w-3xl">
            <Input 
              placeholder="e.g. A vibrant summer theme with orange and yellow accents..." 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
              className="flex-1 rounded-2xl h-12 border-fuchsia-200/60 shadow-sm focus-visible:ring-fuchsia-500"
            />
            <Button 
              onClick={handleAiGenerate}
              disabled={aiLoading || !aiPrompt}
              className="h-12 px-6 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold gap-2 shadow-sm"
            >
              {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate Colors
            </Button>
          </div>
        </div>
      </div>

      {/* Customization panel */}
      <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Palette className="size-5 text-neutral-500" strokeWidth={2} />
                Customize Colors
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">
                Fine-tune your {mode} theme colors. Changes preview instantly.
              </p>
            </div>
            <Button variant="outline" onClick={() => setCustomizing(!customizing)} className="gap-2 h-10 px-5 rounded-full font-bold bg-white border-neutral-200/60 text-neutral-700 hover:bg-neutral-50 shadow-sm">
              <Eye className="size-4" strokeWidth={2} />
              {customizing ? "Show presets" : "Customize"}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {customizing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="p-6">
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                  {COLOR_KEYS.map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">{label}</Label>
                      <div className="flex items-center gap-3">
                        <div className="relative rounded-xl overflow-hidden shadow-sm shrink-0">
                          <input
                            type="color"
                            value={current[key]}
                            onChange={(e) => updateColor(key, e.target.value)}
                            className="absolute inset-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                          />
                          <div className="h-10 w-10 border-2 border-white rounded-xl shadow-inner pointer-events-none" style={{ backgroundColor: current[key] }} />
                        </div>
                        <Input
                          value={current[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          className="h-10 rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono font-medium text-sm text-neutral-900 uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import type { SectionData, SectionStyle } from "@/lib/sections"
import { getSections, saveSections, resetSections } from "@/lib/sections"
import { PageBuilderTopbar } from "./PageBuilderTopbar"
import { SectionSidebar } from "./SectionSidebar"
import { SectionEditorPanel } from "./SectionEditorPanel"
import { LivePreview } from "./LivePreview"

function clone<T>(obj: T): T {
  return structuredClone(obj)
}

const MAX_UNDO = 50

export function PageBuilderShell() {
  const [data, setData] = useState<SectionData>(getSections)
  const [selectedKey, setSelectedKey] = useState<string>("hero")
  const [savedVersion, setSavedVersion] = useState<SectionData | null>(null)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [undoStack, setUndoStack] = useState<SectionData[]>([])
  const initialized = useRef(false)

  useEffect(() => {
    setSavedVersion(clone(data))
    initialized.current = true
  }, [])

  const hasChanges = initialized.current && JSON.stringify(data) !== JSON.stringify(savedVersion)

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      saveSections(data)
      setSavedVersion(clone(data))
      setSaving(false)
      setJustSaved(true)
      toast.success("Changes saved successfully", { duration: 2000 })
      setTimeout(() => setJustSaved(false), 3000)
    }, 400)
  }

  function handleReset() {
    const fresh = resetSections()
    setData(fresh)
    setSavedVersion(clone(fresh))
    setUndoStack([])
    toast.success("Reset to defaults")
  }

  function pushUndo() {
    setUndoStack((prev) => [...prev.slice(-(MAX_UNDO - 1)), clone(data)])
  }

  function handleUndo() {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev
      const restored = prev[prev.length - 1]
      setData(restored)
      return prev.slice(0, -1)
    })
  }

  const update = useCallback((path: string, value: string | boolean) => {
    setData((prev) => {
      const newData = clone(prev)
      const keys = path.split(".")
      let obj: any = newData
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return newData
    })
  }, [])

  function handleToggle(key: string, active: boolean) {
    pushUndo()
    update(`${key}Active`, active)
  }

  function handleSelect(key: string) {
    setSelectedKey(key)
  }

  function handleMoveSection(from: number, to: number) {
    if (from === to) return
    pushUndo()
    setData((prev) => {
      const order = [...prev.sectionOrder]
      const [moved] = order.splice(from, 1)
      order.splice(to, 0, moved)
      return { ...prev, sectionOrder: order }
    })
  }

  function handleToggleAll(val: boolean) {
    pushUndo()
    setData((prev) => {
      const next = { ...prev }
      prev.sectionOrder.forEach((k) => {
        (next as unknown as Record<string, boolean>)[`${k}Active`] = val
      })
      return next
    })
  }

  function handleUpdateStyle(sectionKey: string, style: SectionStyle) {
    pushUndo()
    setData((prev) => ({
      ...prev,
      sectionStyles: { ...prev.sectionStyles, [sectionKey]: style },
    }))
  }

  const activeCount = data.sectionOrder.filter((k) => data[`${k}Active` as keyof SectionData]).length

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (hasChanges) handleSave()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [data, hasChanges])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasChanges])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <PageBuilderTopbar
        hasChanges={hasChanges}
        saving={saving}
        justSaved={justSaved}
        data={data}
        onReset={handleReset}
        onSave={handleSave}
        undoCount={undoStack.length}
        onUndo={handleUndo}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_360px]">
        <div className="rounded-[32px] border border-neutral-200/60 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] h-fit overflow-hidden">
          <SectionSidebar
            data={data}
            selectedKey={selectedKey}
            onSelect={handleSelect}
            onToggle={handleToggle}
            onMove={handleMoveSection}
            onToggleAll={handleToggleAll}
            onUpdate={(path, val) => { pushUndo(); update(path, val); }}
          />
        </div>

        <div className="min-w-0">
          <LivePreview data={data} activeCount={activeCount} totalCount={data.sectionOrder.length} />
        </div>

        <div className="rounded-[32px] border border-neutral-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-fit flex flex-col">
          <SectionEditorPanel
            sectionKey={selectedKey}
            data={data}
            onUpdate={update}
            onPushUndo={pushUndo}
            onSetData={(updater) => {
              pushUndo()
              setData(updater)
            }}
            onUpdateStyle={handleUpdateStyle}
          />
        </div>
      </div>
    </motion.div>
  )
}

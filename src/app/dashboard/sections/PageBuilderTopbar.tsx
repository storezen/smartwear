"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Save, Loader2, Check, Undo, Layout } from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"

interface PageBuilderTopbarProps {
  hasChanges: boolean
  saving: boolean
  justSaved: boolean
  undoCount: number
  onReset: () => void
  onSave: () => void
  onUndo: () => void
}

export function PageBuilderTopbar({ hasChanges, saving, justSaved, undoCount, onReset, onSave, onUndo }: PageBuilderTopbarProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <Layout className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold text-foreground">Page Builder</h1>
              <p className="text-xs text-muted-foreground">Customize your store homepage sections — add, edit, and rearrange content.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 border border-amber-200/50">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Unsaved changes
            </span>
          )}
          {justSaved && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200/50">
              <Check className="size-3" />
              Saved
            </span>
          )}
          <Button variant="outline" size="sm" onClick={onUndo} disabled={undoCount === 0} className="gap-1.5 text-xs h-8" title="Undo (Ctrl+Z)">
            <Undo className="size-3.5" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(true)} className="gap-1.5 text-xs h-8">
            <RotateCcw className="size-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={onSave} disabled={!hasChanges || saving} className="gap-1.5 text-xs h-8 shadow-xs">
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all sections?"
        message="This will restore all homepage sections to their default content and layout. Any custom changes will be lost."
        confirmLabel="Reset"
        variant="warning"
        onConfirm={() => { onReset(); setShowResetConfirm(false) }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const el = dialogRef.current
    if (!el) return
    const prev = el.querySelector("button:not([disabled])") as HTMLButtonElement | null
    prev?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div ref={dialogRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="flex items-start gap-3">
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${variant === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="confirm-dialog-title" className="text-sm font-semibold text-[#0F172A]">{title}</h3>
            <p className="mt-1 text-sm text-[#64748B] leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button size="sm" onClick={onConfirm} className={variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

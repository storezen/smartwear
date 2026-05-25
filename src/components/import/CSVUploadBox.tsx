"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CSVUploadBoxProps {
  onFileSelected: (file: File, text: string) => void
  onClear: () => void
  fileName: string | null
  fileSize: number | null
  error: string | null
}

export function CSVUploadBox({ onFileSelected, onClear, fileName, fileSize, error }: CSVUploadBoxProps) {
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      onFileSelected(file, text)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
          dragging
            ? "border-[#2563EB] bg-blue-50"
            : fileName
              ? "border-emerald-300 bg-emerald-50/50"
              : "border-[#CBD5E1] hover:border-[#2563EB] hover:bg-[#F8FAFC]"
        }`}
      >
        <input ref={fileRef} type="file" accept=".csv" onChange={handleInput} className="hidden" />

        {fileName ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="size-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-[#0F172A]">{fileName}</p>
            {fileSize !== null && (
              <p className="text-xs text-[#64748B]">{(fileSize / 1024).toFixed(1)} KB</p>
            )}
            <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={(e) => { e.stopPropagation(); onClear() }}>
              <X className="size-3.5" /> Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#F1F5F9]">
              <Upload className="size-7 text-[#64748B]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Drop your CSV file here</p>
              <p className="mt-0.5 text-xs text-[#64748B]">or click to browse</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="size-3.5" /> Choose CSV File
            </Button>
            <p className="text-[10px] text-[#94A3B8]">Only .csv files supported</p>
          </div>
        )}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
          <p className="text-xs text-red-700">{error}</p>
        </motion.div>
      )}
    </div>
  )
}

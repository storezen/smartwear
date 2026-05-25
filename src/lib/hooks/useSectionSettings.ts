"use client"

import { useState, useEffect } from "react"
import { getSections, defaultData, type SectionData } from "@/lib/sections"

export function useSectionSettings() {
  const [sections, setSections] = useState<SectionData>(defaultData)

  useEffect(() => {
    setSections(getSections())
    const handleStorage = () => setSections(getSections())
    window.addEventListener("smartwear-sections-changed", handleStorage)
    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("smartwear-sections-changed", handleStorage)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  return sections
}

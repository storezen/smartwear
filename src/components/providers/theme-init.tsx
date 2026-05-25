"use client"

import { useEffect } from "react"
import { STORAGE_KEY, getThemeData, applyThemeMode } from "@/lib/theme"

export function ThemeInit() {
  useEffect(() => {
    const hasSaved = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)
    if (hasSaved) {
      const data = getThemeData()
      applyThemeMode(data)
    }
  }, [])
  return null
}

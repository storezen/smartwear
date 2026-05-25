"use client"

import { useEffect } from "react"
import { initSectionsFromApi } from "@/lib/sections"
import { initThemeFromApi } from "@/lib/theme"
import { initSeoFromApi } from "@/lib/seo"
import { initMetaFromApi } from "@/lib/store-meta"

export function SettingsHydrator() {
  useEffect(() => {
    Promise.all([
      initSectionsFromApi(),
      initThemeFromApi(),
      initSeoFromApi(),
      initMetaFromApi(),
    ]).catch(() => {})
  }, [])
  return null
}

"use client"

import { useEffect, useState } from "react"

export function SEOHeadUpdater() {
  const [seo, setSeo] = useState({ title: "SMARTWEAR", description: "Premium smart watches & accessories" })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("smartwear-site-data")
      if (raw) {
        const data = JSON.parse(raw)
        if (data?.seo) setSeo(data.seo)
      }
    } catch (err) {
      console.error("Failed to load SEO from localStorage:", err)
    }
  }, [])

  useEffect(() => {
    document.title = seo.title
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement("meta")
      meta.setAttribute("name", "description")
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", seo.description)
  }, [seo.title, seo.description])

  return null
}

"use client"

import { useEffect } from "react"

interface PageMetaProps {
  title: string
  description?: string
  ogImage?: string
  canonical?: string
  noindex?: boolean
  keywords?: string
}

export function PageMeta({ title, description, ogImage, canonical, noindex, keywords }: PageMetaProps) {
  useEffect(() => {
    const base = "SMARTWEAR"
    document.title = title ? `${title} — ${base}` : base

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement("meta")
        if (name.startsWith("og:")) el.setAttribute("property", name)
        else el.setAttribute("name", name)
        document.head.appendChild(el)
      }
      el.content = content
    }

    const removeMeta = (name: string) => {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
      if (el) el.remove()
    }

    if (description) {
      setMeta("description", description)
      setMeta("og:description", description)
    }
    setMeta("og:title", title ? `${title} — ${base}` : base)
    setMeta("og:image", ogImage || "/og-default.jpg")
    setMeta("og:type", "website")
    setMeta("og:site_name", base)
    setMeta("og:locale", "en_US")
    setMeta("og:url", canonical || window.location.href)

    setMeta("twitter:card", "summary_large_image")
    setMeta("twitter:title", title ? `${title} — ${base}` : base)
    setMeta("twitter:description", description || "")
    setMeta("twitter:image", ogImage || "/og-default.jpg")

    if (canonical) {
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null
      if (!link) {
        link = document.createElement("link")
        link.rel = "canonical"
        document.head.appendChild(link)
      }
      link.href = canonical
    }

    if (noindex) {
      setMeta("robots", "noindex, nofollow")
    } else {
      removeMeta("robots")
    }

    if (keywords) {
      setMeta("keywords", keywords)
    }
  }, [title, description, ogImage, canonical, noindex, keywords])

  return null
}

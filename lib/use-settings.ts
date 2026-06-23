"use client"

import { useState, useEffect } from "react"

export interface StoreSettings {
  store_name: string
  store_tagline: string
  whatsapp_number: string
  whatsapp_message: string
  support_phone: string
  support_email: string
  legal_email: string
  privacy_email: string
  store_address_line1: string
  store_address_line2: string
  store_city: string
  business_hours: string
  social_instagram: string
  social_facebook: string
  social_twitter: string
  social_youtube: string
  shipping_flat_rate: string
  free_delivery_threshold: number
  shipping_standard_rate: number
  shipping_express_rate: number
  cod_available: boolean
  payment_methods: string
  announcement_line1: string
  announcement_line2: string
  announcement_line3: string
  hero_headline: string
  hero_subtitle: string
  hero_badge_text: string
  seo_title: string
  seo_description: string
  seo_keywords: string
  security_badges: string
  trust_badges: string
}

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/public/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return { settings, loading }
}

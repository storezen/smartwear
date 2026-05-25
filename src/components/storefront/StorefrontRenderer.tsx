"use client"

import { useEffect, useState } from "react"
import type { SectionData } from "@/lib/sections"
import { getSections, subscribe, getSectionStyle } from "@/lib/sections"
import { RenderSection } from "@/components/sections/RenderSection"

export function StorefrontRenderer() {
  const [data, setData] = useState<SectionData | null>(null)

  useEffect(() => {
    // Initial fetch
    setData(getSections())

    // Listen for changes from Live Preview / Builder
    const unsubscribe = subscribe(() => {
      setData(getSections())
    })

    return () => unsubscribe()
  }, [])

  // If client-side data hasn't loaded yet, return null to avoid hydration mismatch
  if (!data) return null

  // Filter sections based on their active status in the Page Builder
  const activeSections = data.sectionOrder.filter((key: string) => {
    const activeKey = `${key}Active` as keyof SectionData
    return data[activeKey] === true
  })

  return (
    <div className="flex flex-col bg-[#FAFAFA] min-h-screen">
      {activeSections.map((key: string) => (
        <RenderSection 
          key={key} 
          sectionKey={key} 
          sections={data} 
          style={getSectionStyle(data, key)} 
        />
      ))}
    </div>
  )
}

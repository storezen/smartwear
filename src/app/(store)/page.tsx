import { prisma } from "@/lib/db/prisma"
import { defaultData, getSectionStyle, type SectionData } from "@/lib/sections"
import { RenderSection } from "@/components/sections/RenderSection"
import { JsonLd } from "@/components/JsonLd"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoSetting = await prisma.storeSetting.findUnique({ where: { key: "seo" } })
    const metaSetting = await prisma.storeSetting.findUnique({ where: { key: "store-meta" } })
    const seo = seoSetting ? JSON.parse(seoSetting.value) : null
    const meta = metaSetting ? JSON.parse(metaSetting.value) : null
    const siteName = meta?.siteName || "SMARTWEAR"

    if (seo) {
      return {
        title: seo.metaTitle ? `${seo.metaTitle}` : `${siteName} — Premium Smart Watches`,
        description: seo.metaDescription || "Premium smart watches and accessories...",
        keywords: seo.keywords || "",
        openGraph: {
          title: seo.metaTitle || `${siteName} — Premium Smart Watches`,
          description: seo.metaDescription || "Premium smart watches and accessories...",
          images: seo.ogImage ? [{ url: seo.ogImage }] : [{ url: "/og-default.jpg" }],
        }
      }
    }
  } catch {}
  return {
    title: "SMARTWEAR — Premium Smart Watches & Accessories",
    description: "Premium smart watches and accessories curated for those who demand more from their tech.",
  }
}

export default async function HomePage() {
  let sections: SectionData = defaultData
  try {
    const sectionsSetting = await prisma.storeSetting.findUnique({ where: { key: "sections" } })
    if (sectionsSetting) {
      sections = JSON.parse(sectionsSetting.value)
    }
  } catch {}

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: sections.siteName || "SMARTWEAR",
    url: "https://smartwear.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://smartwear.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: sections.siteName || "SMARTWEAR",
    url: "https://smartwear.com",
    description: sections.seo?.metaDescription || "Premium smart watches and accessories curated for those who demand more from their tech.",
  }

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={orgJsonLd} />
      <div className="flex flex-col">
        {sections.sectionOrder.map((key) => {
          const activeKey = `${key}Active` as keyof SectionData
          if (!sections[activeKey]) return null
          const style = getSectionStyle(sections, key)
          return <RenderSection key={key} sectionKey={key} sections={sections} style={style} />
        })}
      </div>
    </>
  )
}

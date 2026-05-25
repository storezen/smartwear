"use client"

import { type SectionData } from "@/lib/sections"
import { HeroEditor } from "@/components/section-editors/HeroEditor"
import { PromoBannerEditor } from "@/components/section-editors/PromoBannerEditor"
import { NewsletterEditor } from "@/components/section-editors/NewsletterEditor"
import { TestimonialsEditor } from "@/components/section-editors/TestimonialsEditor"
import { FAQEditor } from "@/components/section-editors/FAQEditor"
import { BrandStoryEditor } from "@/components/section-editors/BrandStoryEditor"
import { InstagramEditor } from "@/components/section-editors/InstagramEditor"
import { FeaturedCollectionEditor } from "@/components/section-editors/FeaturedCollectionEditor"
import { BrandLogosEditor } from "@/components/section-editors/BrandLogosEditor"
import { StatsEditor } from "@/components/section-editors/StatsEditor"
import { LookbookEditor } from "@/components/section-editors/LookbookEditor"
import { ProcessEditor } from "@/components/section-editors/ProcessEditor"
import { PressEditor } from "@/components/section-editors/PressEditor"
import { CategoriesEditor } from "@/components/section-editors/CategoriesEditor"
import { FeaturesEditor } from "@/components/section-editors/FeaturesEditor"
import { NewArrivalsEditor } from "@/components/section-editors/NewArrivalsEditor"
import { BestSellersEditor } from "@/components/section-editors/BestSellersEditor"

interface SectionEditorProps {
  sectionKey: string
  data: SectionData
  onUpdate: (path: string, value: string | boolean) => void
  onPushUndo: () => void
  onSetData: (updater: (prev: SectionData) => SectionData) => void
}

export function SectionEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: SectionEditorProps) {
  const commonProps = { sectionKey, data, onUpdate, onPushUndo, onSetData }

  switch (sectionKey) {
    case "hero": return <HeroEditor {...commonProps} />
    case "categories": return <CategoriesEditor {...commonProps} />
    case "newArrivals": return <NewArrivalsEditor {...commonProps} />
    case "bestSellers": return <BestSellersEditor {...commonProps} />
    case "features": return <FeaturesEditor {...commonProps} />
    case "promoBanner": return <PromoBannerEditor {...commonProps} />
    case "newsletter": return <NewsletterEditor {...commonProps} />
    case "testimonials": return <TestimonialsEditor {...commonProps} />
    case "faq": return <FAQEditor {...commonProps} />
    case "brandStory": return <BrandStoryEditor {...commonProps} />
    case "instagram": return <InstagramEditor {...commonProps} />
    case "featuredCollection": return <FeaturedCollectionEditor {...commonProps} />
    case "brandLogos": return <BrandLogosEditor {...commonProps} />
    case "stats": return <StatsEditor {...commonProps} />
    case "lookbook": return <LookbookEditor {...commonProps} />
    case "process": return <ProcessEditor {...commonProps} />
    case "press": return <PressEditor {...commonProps} />
    default: return <p className="text-sm text-muted-foreground py-6 text-center">No editor available for this section type.</p>
  }
}

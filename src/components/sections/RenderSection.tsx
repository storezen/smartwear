"use client"

import type { ReactNode } from "react"
import type { SectionData, SectionStyle } from "@/lib/sections"
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary"
import { HeroSection } from "./HeroSection"
import { HeroSectionRenderer } from "./HeroSectionRenderer"
import { CategoriesSection } from "./CategoriesSection"
import { NewArrivalsSection, BestSellersSection } from "./ProductSection"
import { TrustBadgesSection } from "./TrustBadgesSection"
import { PromoBannerSection } from "./PromoBannerSection"
import { NewsletterSection } from "./NewsletterSection"
import { TestimonialsSection } from "./TestimonialsSection"
import { FAQSection } from "./FAQSection"
import {
  BrandStorySection,
  InstagramSection,
  FeaturedCollectionSection,
  BrandLogosSection,
  StatsSection,
  LookbookSection,
  ProcessSection,
  PressSection,
} from "./AdvancedSections"

interface RenderSectionProps {
  sectionKey: string
  sections: SectionData
  style: SectionStyle
}

export function RenderSection({ sectionKey, sections, style }: RenderSectionProps) {
  let section: ReactNode
  switch (sectionKey) {
    case "hero":
      section = <HeroSectionRenderer data={sections.hero} style={style} />
      break
    case "categories":
      section = <CategoriesSection data={sections.categories} style={style} />
      break
    case "newArrivals":
      section = <NewArrivalsSection data={sections.newArrivals} style={style} />
      break
    case "bestSellers":
      section = <BestSellersSection data={sections.bestSellers} style={style} />
      break
    case "features":
      section = <TrustBadgesSection data={sections.features} style={style} />
      break
    case "promoBanner":
      section = <PromoBannerSection data={sections.promoBanner} style={style} />
      break
    case "newsletter":
      section = <NewsletterSection data={sections.newsletter} style={style} />
      break
    case "testimonials":
      section = <TestimonialsSection data={sections.testimonials} style={style} />
      break
    case "faq":
      section = <FAQSection data={sections.faq} style={style} />
      break
    case "brandStory":
      section = <BrandStorySection data={sections.brandStory} style={style} />
      break
    case "instagram":
      section = <InstagramSection data={sections.instagram} style={style} />
      break
    case "featuredCollection":
      section = <FeaturedCollectionSection data={sections.featuredCollection} style={style} />
      break
    case "brandLogos":
      section = <BrandLogosSection data={sections.brandLogos} style={style} />
      break
    case "stats":
      section = <StatsSection data={sections.stats} style={style} />
      break
    case "lookbook":
      section = <LookbookSection data={sections.lookbook} style={style} />
      break
    case "process":
      section = <ProcessSection data={sections.process} style={style} />
      break
    case "press":
      section = <PressSection data={sections.press} style={style} />
      break
    default:
      section = null
  }
  return (
    <SectionErrorBoundary sectionKey={sectionKey}>
      {section}
    </SectionErrorBoundary>
  )
}

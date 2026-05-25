"use client"

import type { SectionData, SectionStyle } from "@/lib/sections"
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
  switch (sectionKey) {
    case "hero":
      return <HeroSectionRenderer data={sections.hero} style={style} />
    case "categories":
      return <CategoriesSection data={sections.categories} style={style} />
    case "newArrivals":
      return <NewArrivalsSection data={sections.newArrivals} style={style} />
    case "bestSellers":
      return <BestSellersSection data={sections.bestSellers} style={style} />
    case "features":
      return <TrustBadgesSection data={sections.features} style={style} />
    case "promoBanner":
      return <PromoBannerSection data={sections.promoBanner} style={style} />
    case "newsletter":
      return <NewsletterSection data={sections.newsletter} style={style} />
    case "testimonials":
      return <TestimonialsSection data={sections.testimonials} style={style} />
    case "faq":
      return <FAQSection data={sections.faq} style={style} />
    case "brandStory":
      return <BrandStorySection data={sections.brandStory} style={style} />
    case "instagram":
      return <InstagramSection data={sections.instagram} style={style} />
    case "featuredCollection":
      return <FeaturedCollectionSection data={sections.featuredCollection} style={style} />
    case "brandLogos":
      return <BrandLogosSection data={sections.brandLogos} style={style} />
    case "stats":
      return <StatsSection data={sections.stats} style={style} />
    case "lookbook":
      return <LookbookSection data={sections.lookbook} style={style} />
    case "process":
      return <ProcessSection data={sections.process} style={style} />
    case "press":
      return <PressSection data={sections.press} style={style} />
    default:
      return null
  }
}

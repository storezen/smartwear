"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/AnimatedSection"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import { ArrowRight, Sparkles, Camera, BookOpen, Award, TrendingUp, LayoutGrid, Shuffle, Newspaper, Check, Star, ShoppingBag, Truck, ShieldCheck, HelpCircle } from "lucide-react"
import type { SectionData, SectionStyle } from "@/lib/sections"
import { getBgStyle, paddingVals } from "./section-utils"
import { resolveMediaUrl } from "@/lib/media/utils"
import { ParallaxImage, useParallax } from "@/components/ParallaxSection"

const processIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "shopping-bag": ShoppingBag, truck: Truck, check: Check, star: Star, shield: ShieldCheck,
  banknote: Award, sparkles: Sparkles, award: Award,
}

export function BrandStorySection({ data, style }: { data: SectionData["brandStory"]; style: SectionStyle }) {
  const { ref, y, opacity } = useParallax(0.3, 80)
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div ref={ref} style={{ y, opacity }} className="order-2 lg:order-1">
            <Badge className="inline-flex border-0 bg-primary/5 text-primary text-overline gap-1.5 mb-4">
              <BookOpen className="size-3" /> Our Story
            </Badge>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{data.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{data.description}</p>
            {data.buttonText && (
              <Link href={data.buttonUrl}>
                <Button variant="outline" className="mt-6 h-10 gap-2 rounded-full px-6 text-sm">
                  {data.buttonText} <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
          </motion.div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute -inset-4 rounded-2xl bg-primary/[0.03]" />
            <div className="absolute -bottom-3 -right-3 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            <ParallaxImage
              src={resolveMediaUrl(data.image)}
              alt="Our brand story"
              containerClass="relative"
              className="rounded-xl object-cover shadow-lg w-full aspect-[4/3]"
              speed={0.25}
            />
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

export function InstagramSection({ data, style }: { data: SectionData["instagram"]; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="mb-8 text-center">
          <Badge className="inline-flex border-0 bg-primary/5 text-primary text-overline gap-1.5 mb-3">
            <Camera className="size-3" /> Instagram
          </Badge>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{data.title}</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">{data.description}</p>
        </div>
        <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.images.slice(0, 8).map((img, i) => (
            <StaggerItem key={i}>
              <Link href={data.link} target="_blank" rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-border/30 transition-all hover:ring-primary/30">
                {img && (
                  <img src={resolveMediaUrl(img)} alt="Instagram post" className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110" loading="lazy" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/0 via-black/0 to-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5 text-white drop-shadow-sm" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
        {data.linkText && (
          <div className="mt-6 text-center">
            <Link href={data.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
              <Camera className="size-4" /> {data.linkText} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </AnimatedSection>
  )
}

export function FeaturedCollectionSection({ data, style }: { data: SectionData["featuredCollection"]; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="group relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0">
            {data.image && (
              <ParallaxImage
                src={resolveMediaUrl(data.image)}
                alt="Featured collection"
                containerClass="absolute inset-0"
                className="h-[120%] w-full object-cover"
                speed={0.2}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
          </div>
          <div className="relative z-10 flex flex-col items-start px-8 py-16 sm:px-14 sm:py-20 lg:w-1/2">
            {data.badge && (
              <Badge className="inline-flex border-0 bg-primary/10 text-primary backdrop-blur-sm px-3 py-1 text-overline gap-1.5 mb-4">
                <Sparkles className="size-3 text-amber-accent" /> {data.badge}
              </Badge>
            )}
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{data.title}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{data.description}</p>
            {data.buttonText && (
              <Link href={data.buttonUrl}>
                <Button className="mt-6 h-11 gap-2 rounded-full px-7 bg-amber-accent hover:bg-amber-accent/90 text-background font-bold shadow-[0_0_24px_-8px] shadow-amber-accent/40 transition-all active:scale-[0.97]">
                  {data.buttonText} <ArrowRight className="size-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

export function BrandLogosSection({ data, style }: { data: SectionData["brandLogos"]; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{data.title}</p>
          <div className="mx-auto mt-2 h-px w-12 bg-border" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {data.logos.map((logo, i) => (
            <div key={i} className="flex h-12 w-32 items-center justify-center opacity-40 grayscale transition-all duration-300 hover:opacity-80 hover:grayscale-0">
              {logo ? (
                <img src={resolveMediaUrl(logo)} alt="Brand logo" className="max-h-full max-w-full object-contain" loading="lazy" />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">Logo {i + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

export function StatsSection({ data, style }: { data: SectionData["stats"]; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="mb-10 text-center">
          <Badge className="inline-flex border-0 bg-primary/5 text-primary text-overline gap-1.5 mb-3">
            <TrendingUp className="size-3" /> Stats
          </Badge>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{data.title}</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">{data.description}</p>
        </div>
        <StaggerGrid className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {data.items.slice(0, 4).map((item, i) => (
            <StaggerItem key={i}>
              <div className="group rounded-xl border border-border/40 bg-card p-8 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <p className="font-heading text-3xl font-bold text-foreground sm:text-4xl transition-all group-hover:text-accent">
                  {item.prefix}{item.value}{item.suffix}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </AnimatedSection>
  )
}

export function LookbookSection({ data, style }: { data: SectionData["lookbook"]; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="mb-10 text-center">
          <Badge className="inline-flex border-0 bg-primary/5 text-primary text-overline gap-1.5 mb-3">
            <LayoutGrid className="size-3" /> Lookbook
          </Badge>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{data.title}</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">{data.description}</p>
        </div>
        <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {data.items.slice(0, 8).map((item, i) => (
            <StaggerItem key={i}>
              <Link href="/products" className="group relative overflow-hidden rounded-xl bg-muted ring-1 ring-border/30 transition-all hover:ring-primary/30 hover:shadow-md block">
                <div className="aspect-[3/4]">
                  {item.image && (
                    <ParallaxImage
                      src={resolveMediaUrl(item.image)}
                      alt={item.title}
                      containerClass="h-full w-full"
                      className="h-[115%] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      speed={0.15}
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                {item.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                  </div>
                )}
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </AnimatedSection>
  )
}

export function ProcessSection({ data, style }: { data: SectionData["process"]; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="mb-12 text-center">
          <Badge className="inline-flex border-0 bg-primary/5 text-primary text-overline gap-1.5 mb-3">
            <Shuffle className="size-3" /> How It Works
          </Badge>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{data.title}</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">{data.description}</p>
        </div>
        <StaggerGrid className="grid gap-8 sm:grid-cols-3">
          {data.steps.slice(0, 6).map((step, i) => {
            const StepIcon = processIconMap[step.icon] || Check
            return (
              <StaggerItem key={i}>
                <div className="group relative text-center">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-all group-hover:bg-primary/10 group-hover:scale-105">
                    <StepIcon className="size-6" />
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerGrid>
      </div>
    </AnimatedSection>
  )
}

export function PressSection({ data, style }: { data: SectionData["press"]; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        <div className="mb-10 text-center">
          <Badge className="inline-flex border-0 bg-primary/5 text-primary text-overline gap-1.5 mb-3">
            <Newspaper className="size-3" /> Press
          </Badge>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{data.title}</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">{data.description}</p>
        </div>
        <StaggerGrid className="grid gap-6 sm:grid-cols-2">
          {data.items.slice(0, 4).map((item, i) => (
            <StaggerItem key={i}>
              <div className="group rounded-xl border border-border/40 bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  {item.logo && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2">
                      <img src={resolveMediaUrl(item.logo)} alt={item.source} className="max-h-full max-w-full object-contain" loading="lazy" />
                    </div>
                  )}
                  {item.source && (
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{item.source}</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">&ldquo;{item.quote}&rdquo;</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </AnimatedSection>
  )
}

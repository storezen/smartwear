"use client"

import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/AnimatedSection"
import { HelpCircle, ChevronDown } from "lucide-react"
import type { FAQData, SectionStyle } from "@/lib/sections"
import { getBgStyle, paddingVals } from "./section-utils"

export function FAQSection({ data, style }: { data: FAQData; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <div className="mb-10 text-center">
          <Badge className="inline-flex border-0 bg-primary/5 text-primary text-overline gap-1.5 mb-3">
            <HelpCircle className="size-3" /> FAQ
          </Badge>
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">{data.title}</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm">{data.description}</p>
        </div>
        <div className="space-y-3">
          {data.items.map((item, i) => (
            <details key={i} className="group rounded-xl border border-border/60 bg-white shadow-sm open:shadow-md transition-all">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-primary transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                {item.question || "Question"}
                <ChevronDown className="size-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-4 pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

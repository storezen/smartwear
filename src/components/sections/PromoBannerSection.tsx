"use client"

import Link from "next/link"
import { AnimatedSection } from "@/components/AnimatedSection"
import type { PromoBannerData, SectionStyle } from "@/lib/sections"
import { getBgStyle, paddingVals } from "./section-utils"

export function PromoBannerSection({ data, style }: { data: PromoBannerData; style: SectionStyle }) {
  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <Link href={data.buttonUrl} className="group block">
          <div
            className="relative overflow-hidden rounded-xl px-6 py-5 shadow-sm transition-all group-hover:shadow-md"
            style={{ backgroundColor: data.bgColor, color: data.textColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <p className="text-sm font-semibold sm:text-base">{data.text}</p>
              <span
                className="shrink-0 rounded-lg px-4 py-2 text-xs font-medium shadow-sm transition-transform group-hover:translate-x-0.5"
                style={{ backgroundColor: data.buttonBgColor, color: data.buttonTextColor }}
              >
                {data.buttonText}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </AnimatedSection>
  )
}

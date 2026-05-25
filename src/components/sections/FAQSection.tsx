"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedSection } from "@/components/AnimatedSection"
import { HelpCircle, ChevronDown } from "lucide-react"
import type { FAQData, SectionStyle } from "@/lib/sections"
import { getBgStyle, paddingVals } from "./section-utils"
import { cn } from "@/lib/utils"

function AccordionItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={onClick}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left text-sm font-semibold text-neutral-900 transition-colors hover:text-neutral-700"
      >
        <span>{question || "Question"}</span>
        <ChevronDown
          className={cn(
            "size-4 text-neutral-400 shrink-0 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0">
              <p className="text-sm leading-relaxed text-neutral-500">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection({ data, style }: { data: FAQData; style: SectionStyle }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <AnimatedSection style={{ ...getBgStyle(style), paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }}>
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <div className="mb-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3"
          >
            <HelpCircle className="size-3" /> FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900"
          >
            {data.title}
          </motion.h2>
          {data.description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-3 text-neutral-500 max-w-md mx-auto text-sm"
            >
              {data.description}
            </motion.p>
          )}
        </div>
        <div className="space-y-3">
          {data.items.map((item, i) => (
            <AccordionItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

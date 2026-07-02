"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"

interface PakistanMapProps {
  locations: { city: string; count: number }[]
}

const CITIES: { name: string; x: number; y: number }[] = [
  { name: "Karachi", x: 228, y: 450 },
  { name: "Hyderabad", x: 215, y: 420 },
  { name: "Sukkur", x: 210, y: 370 },
  { name: "Multan", x: 190, y: 310 },
  { name: "Faisalabad", x: 208, y: 280 },
  { name: "Lahore", x: 240, y: 260 },
  { name: "Gujranwala", x: 235, y: 250 },
  { name: "Sialkot", x: 245, y: 240 },
  { name: "Rawalpindi", x: 195, y: 220 },
  { name: "Islamabad", x: 195, y: 210 },
  { name: "Peshawar", x: 160, y: 200 },
  { name: "Quetta", x: 110, y: 320 },
]

function PakistanOutline() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 340 520" fill="none" preserveAspectRatio="xMidYMid meet">
      <path
        d="M170 30 L190 25 L210 28 L225 35 L240 45 L250 55 L260 70 L270 85 L275 100 L280 115 L285 130 L290 145 L295 160 L298 175 L300 190 L295 200 L290 210 L282 220 L275 230 L268 240 L260 248 L252 255 L245 262 L238 268 L230 275 L222 282 L215 290 L208 298 L200 305 L192 312 L185 320 L178 328 L172 336 L168 345 L165 355 L162 365 L160 375 L158 385 L158 395 L160 405 L165 415 L172 425 L180 433 L190 440 L200 446 L210 450 L220 455 L228 458 L235 460 L228 465 L218 468 L205 470 L190 470 L175 468 L160 465 L148 460 L138 455 L130 448 L125 440 L120 430 L115 418 L110 405 L105 390 L100 375 L95 358 L90 340 L85 322 L80 305 L75 288 L70 272 L65 258 L60 245 L58 232 L58 220 L60 210 L65 200 L72 190 L80 180 L90 170 L100 160 L110 150 L120 140 L130 132 L140 125 L150 60 L155 45 L160 35 L170 30Z"
        stroke="rgba(184,134,11,0.5)"
        strokeWidth="1.5"
        fill="rgba(184,134,11,0.02)"
      />
      <path
        d="M170 30 L190 25 L210 28 L225 35 L240 45 L250 55 L260 70 L270 85 L275 100 L280 115 L285 130 L290 145 L295 160 L298 175 L300 190 L295 200 L290 210 L282 220 L275 230 L268 240 L260 248 L252 255 L245 262 L238 268 L230 275 L222 282 L215 290 L208 298 L200 305 L192 312 L185 320 L178 328 L172 336 L168 345 L165 355 L162 365 L160 375 L158 385 L158 395 L160 405 L165 415 L172 425 L180 433 L190 440 L200 446 L210 450 L220 455 L228 458 L235 460 L228 465 L218 468 L205 470 L190 470 L175 468 L160 465 L148 460 L138 455 L130 448 L125 440 L120 430 L115 418 L110 405 L105 390 L100 375 L95 358 L90 340 L85 322 L80 305 L75 288 L70 272 L65 258 L60 245 L58 232 L58 220 L60 210 L65 200 L72 190 L80 180 L90 170 L100 160 L110 150 L120 140 L130 132 L140 125 L150 60 L155 45 L160 35 L170 30Z"
        stroke="rgba(184,134,11,0.15)"
        strokeWidth="3"
        fill="none"
        className="animate-pulse"
      />
    </svg>
  )
}

export function PakistanMap({ locations }: PakistanMapProps) {
  const cityCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const loc of locations) {
      map.set(loc.city, loc.count)
    }
    return map
  }, [locations])

  const maxCount = useMemo(
    () => Math.max(...Array.from(cityCounts.values()), 1),
    [cityCounts]
  )

  if (!locations.length) {
    return (
      <div className="bg-card rounded-xl border border-white/5 p-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <h3 className="text-[13px] font-semibold text-foreground/70">Traffic by City</h3>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-card border border-white/5 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-foreground/&" />
            </div>
            <p className="text-[11px] text-foreground/&">No location data yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-white/5 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
          <h3 className="text-[13px] font-semibold text-foreground/70">Traffic by City</h3>
        </div>
        <span className="text-[9px] text-foreground/&">Last 2 hours</span>
      </div>

      <div className="relative w-full aspect-[340/520] max-h-[300px] overflow-hidden rounded-lg bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_55%,rgba(184,134,11,0.03)_0%,transparent_60%)] pointer-events-none" />
        <PakistanOutline />

        {CITIES.map((city) => {
          const count = cityCounts.get(city.name) || 0
          const size = count > 0 ? Math.max(6, (count / maxCount) * 18 + 4) : 3
          const opacity = count > 0 ? 0.6 + (count / maxCount) * 0.4 : 0.12

          return (
            <div key={city.name} className="absolute" style={{ left: `${(city.x / 340) * 100}%`, top: `${(city.y / 520) * 100}%` }}>
              {count > 0 && (
                <>
                  <div
                    className="absolute rounded-full animate-ping"
                    style={{
                      width: size * 2.5,
                      height: size * 2.5,
                      backgroundColor: "rgba(184,134,11,0.08)",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: size * 4,
                      height: size * 4,
                      background: "radial-gradient(circle, rgba(184,134,11,0.15) 0%, transparent 70%)",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </>
              )}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity }}
                transition={{ duration: 0.5, delay: 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="rounded-full relative"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: count > 0 ? "#B8860B" : "rgba(255,255,255,0.12)",
                  boxShadow: count > 0 ? `0 0 ${size * 1.2}px rgba(184,134,11,${0.3 + (count / maxCount) * 0.5})` : "none",
                  transform: "translate(-50%, -50%)",
                }}
              />

              {count > 0 && (
                <div
                  className="absolute pointer-events-none hidden md:block"
                  style={{
                    left: size / 2 + 6,
                    top: -4,
                    transform: "translateY(-50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <p className="text-[9px] font-semibold text-foreground/& leading-none drop-shadow-lg">
                    {city.name}
                  </p>
                  <p className="text-[8px] text-[#B8860B]/80 leading-none mt-0.5 font-medium">
                    {count} events
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

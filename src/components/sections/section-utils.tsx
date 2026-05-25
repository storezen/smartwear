import type { SectionStyle } from "@/lib/sections"

export function getBgStyle(style: SectionStyle): React.CSSProperties {
  if (style.backgroundType === "color") return { backgroundColor: style.backgroundColor }
  if (style.backgroundType === "gradient") return { background: style.backgroundGradient }
  if (style.backgroundType === "image") return { backgroundImage: `url(${style.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
  return {}
}

export const paddingVals: Record<string, string> = {
  compact: "2rem",
  comfortable: "4rem",
  luxury: "6rem",
}

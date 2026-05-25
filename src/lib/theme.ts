export const STORAGE_KEY = "smartwear-theme"

export interface ThemeConfig {
  primary: string
  "primary-foreground": string
  background: string
  foreground: string
  card: string
  "card-foreground": string
  muted: string
  "muted-foreground": string
  secondary: string
  "secondary-foreground": string
  accent: string
  "accent-foreground": string
  destructive: string
  success: string
  warning: string
  border: string
  input: string
  ring: string
  radius: string
  "sidebar": string
  "sidebar-foreground": string
  "sidebar-primary": string
  "sidebar-primary-foreground": string
  "sidebar-accent": string
  "sidebar-accent-foreground": string
  "sidebar-border": string
  "sidebar-ring": string
}

export type ThemeColorKey = keyof ThemeConfig

export const CSS_VARS: Record<ThemeColorKey, string> = {
  primary: "--color-primary",
  "primary-foreground": "--color-primary-foreground",
  background: "--color-background",
  foreground: "--color-foreground",
  card: "--color-card",
  "card-foreground": "--color-card-foreground",
  muted: "--color-muted",
  "muted-foreground": "--color-muted-foreground",
  secondary: "--color-secondary",
  "secondary-foreground": "--color-secondary-foreground",
  accent: "--color-accent",
  "accent-foreground": "--color-accent-foreground",
  destructive: "--color-destructive",
  success: "--color-success",
  warning: "--color-warning",
  border: "--color-border",
  input: "--color-input",
  ring: "--color-ring",
  radius: "--radius",
  sidebar: "--color-sidebar",
  "sidebar-foreground": "--color-sidebar-foreground",
  "sidebar-primary": "--color-sidebar-primary",
  "sidebar-primary-foreground": "--color-sidebar-primary-foreground",
  "sidebar-accent": "--color-sidebar-accent",
  "sidebar-accent-foreground": "--color-sidebar-accent-foreground",
  "sidebar-border": "--color-sidebar-border",
  "sidebar-ring": "--color-sidebar-ring",
}

export const LIGHT_THEME: ThemeConfig = {
  primary: "#15294A",
  "primary-foreground": "#FFFFFF",
  background: "#F8F9FC",
  foreground: "#0B1121",
  card: "#FFFFFF",
  "card-foreground": "#0B1121",
  muted: "#F0F2F5",
  "muted-foreground": "#6B7280",
  secondary: "#F0F2F6",
  "secondary-foreground": "#1A2332",
  accent: "#2563EB",
  "accent-foreground": "#FFFFFF",
  destructive: "#DC2626",
  success: "#16A34A",
  warning: "#F59E0B",
  border: "#E0E4EA",
  input: "#E0E4EA",
  ring: "#2563EB",
  radius: "0.5rem",
  sidebar: "#FFFFFF",
  "sidebar-foreground": "#0B1121",
  "sidebar-primary": "#15294A",
  "sidebar-primary-foreground": "#FFFFFF",
  "sidebar-accent": "#F0F2F6",
  "sidebar-accent-foreground": "#1A2332",
  "sidebar-border": "#E0E4EA",
  "sidebar-ring": "#2563EB",
}

export const DARK_THEME: ThemeConfig = {
  primary: "#2563EB",
  "primary-foreground": "#FFFFFF",
  background: "#030712",
  foreground: "#FAFAFA",
  card: "#0B0F19",
  "card-foreground": "#FAFAFA",
  muted: "#0F172A",
  "muted-foreground": "#94A3B8",
  secondary: "#1E293B",
  "secondary-foreground": "#E2E8F0",
  accent: "#2563EB",
  "accent-foreground": "#FFFFFF",
  destructive: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  border: "#1E293B",
  input: "#1E293B",
  ring: "#2563EB",
  radius: "0.75rem",
  sidebar: "#030712",
  "sidebar-foreground": "#FAFAFA",
  "sidebar-primary": "#2563EB",
  "sidebar-primary-foreground": "#FFFFFF",
  "sidebar-accent": "#0F172A",
  "sidebar-accent-foreground": "#E2E8F0",
  "sidebar-border": "#1E293B",
  "sidebar-ring": "#2563EB",
}

export interface ThemePreset {
  name: string
  light: ThemeConfig
  dark: ThemeConfig
}

const PRESETS: ThemePreset[] = [
  {
    name: "Urban Gold",
    light: { ...LIGHT_THEME },
    dark: { ...DARK_THEME },
  },
  {
    name: "Jungle",
    light: {
      ...LIGHT_THEME,
      primary: "#065F46",
      accent: "#059669",
      ring: "#059669",
    },
    dark: {
      ...DARK_THEME,
      primary: "#34D399",
      "primary-foreground": "#0A0A0A",
      accent: "#34D399",
      "accent-foreground": "#0A0A0A",
      ring: "#34D399",
    },
  },
  {
    name: "Burgundy",
    light: {
      ...LIGHT_THEME,
      primary: "#991B1B",
      accent: "#DC2626",
      ring: "#DC2626",
    },
    dark: {
      ...DARK_THEME,
      primary: "#F87171",
      "primary-foreground": "#0A0A0A",
      accent: "#F87171",
      "accent-foreground": "#0A0A0A",
      ring: "#F87171",
    },
  },
  {
    name: "Skyline",
    light: {
      ...LIGHT_THEME,
      primary: "#1E40AF",
      accent: "#3B82F6",
      ring: "#3B82F6",
      background: "#EFF6FF",
      muted: "#DBEAFE",
    },
    dark: {
      ...DARK_THEME,
      primary: "#60A5FA",
      "primary-foreground": "#0A0A0A",
      accent: "#60A5FA",
      "accent-foreground": "#0A0A0A",
      ring: "#60A5FA",
    },
  },
  {
    name: "Charcoal",
    light: {
      ...LIGHT_THEME,
      primary: "#1E293B",
      background: "#F8FAFC",
      accent: "#334155",
      ring: "#334155",
      border: "#CBD5E1",
    },
    dark: {
      ...DARK_THEME,
      primary: "#E2E8F0",
      "primary-foreground": "#0A0A0A",
      background: "#020617",
      card: "#0F172A",
      accent: "#94A3B8",
      "accent-foreground": "#0A0A0A",
      ring: "#94A3B8",
      muted: "#1E293B",
      border: "#1E293B",
    },
  },
  {
    name: "Blush",
    light: {
      ...LIGHT_THEME,
      primary: "#9D174D",
      accent: "#DB2777",
      ring: "#DB2777",
      muted: "#FDF2F8",
    },
    dark: {
      ...DARK_THEME,
      primary: "#F472B6",
      "primary-foreground": "#0A0A0A",
      accent: "#F472B6",
      "accent-foreground": "#0A0A0A",
      ring: "#F472B6",
    },
  },
]

export interface SavedThemeData {
  light: ThemeConfig
  dark: ThemeConfig
  mode: "light" | "dark"
  presetIndex: number | null
}

function defaultData(): SavedThemeData {
  return { light: { ...LIGHT_THEME }, dark: { ...DARK_THEME }, mode: "dark", presetIndex: 0 }
}

export function getThemeData(): SavedThemeData {
  if (typeof window === "undefined") return defaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const data = JSON.parse(raw) as SavedThemeData
    if (!data.light || !data.dark) return defaultData()
    return data
  } catch {
    return defaultData()
  }
}

const THEME_SETTINGS_KEY = "theme"

export function saveThemeData(data: SavedThemeData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  fetch(`/api/settings/${THEME_SETTINGS_KEY}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(data) }),
  }).catch(() => {})
}

export async function initThemeFromApi(): Promise<void> {
  try {
    const res = await fetch(`/api/settings/${THEME_SETTINGS_KEY}`)
    if (!res.ok) return
    const { value } = await res.json()
    if (!value) return
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, value)
      loadAndApplyTheme()
    }
  } catch (err) {
    console.error("Failed to init theme from API:", err)
  }
}

export function applyThemeMode(data: SavedThemeData): void {
  const config = data.mode === "light" ? data.light : data.dark
  const root = document.documentElement
  for (const [key, cssVar] of Object.entries(CSS_VARS)) {
    root.style.setProperty(cssVar, config[key as ThemeColorKey])
  }
}

export function loadAndApplyTheme(): void {
  const data = getThemeData()
  applyThemeMode(data)
}

export function getPresets(): ThemePreset[] {
  return PRESETS
}

export function applyPreset(index: number): SavedThemeData {
  if (index < 0 || index >= PRESETS.length) return getThemeData()
  const preset = PRESETS[index]
  const data = getThemeData()
  data.light = { ...preset.light }
  data.dark = { ...preset.dark }
  data.presetIndex = index
  return data
}

export function resetAllThemes(): SavedThemeData {
  return defaultData()
}

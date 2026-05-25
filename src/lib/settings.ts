export async function getSetting(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null
  try {
    const res = await fetch(`/api/settings/${encodeURIComponent(key)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.value) return data.value
    }
  } catch (err) {
    console.error(`Failed to fetch setting "${key}" from API:`, err)
  }
  try {
    return localStorage.getItem(key)
  } catch (err) {
    console.error(`Failed to read setting "${key}" from localStorage:`, err)
    return null
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value)
    } catch (err) {
      console.error(`Failed to save setting "${key}" to localStorage:`, err)
    }
  }
  try {
    await fetch(`/api/settings/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    })
  } catch (err) {
    console.error(`Failed to save setting "${key}" to API:`, err)
  }
}

export async function getSettingJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await getSetting(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch (err) {
    console.error(`Failed to parse setting "${key}" JSON:`, err)
    return fallback
  }
}

export async function setSettingJSON(key: string, value: unknown): Promise<void> {
  await setSetting(key, JSON.stringify(value))
}

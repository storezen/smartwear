const STALE_MS = 35_000
const CLEANUP_INTERVAL_MS = 15_000

const globalAny: any = global

function getStore(): Map<string, number> {
  if (!globalAny.__presenceStore) {
    globalAny.__presenceStore = new Map<string, number>()
  }
  return globalAny.__presenceStore
}

if (!globalAny.__presenceCleanupTimer) {
  globalAny.__presenceCleanupTimer = setInterval(() => {
    cleanupStale()
  }, CLEANUP_INTERVAL_MS)
}

export function recordHeartbeat(sessionId: string): number {
  const store = getStore()
  store.set(sessionId, Date.now())
  return getActiveCount()
}

export function getActiveCount(): number {
  const store = getStore()
  const now = Date.now()
  let active = 0
  for (const [, ts] of store) {
    if (now - ts < STALE_MS) active++
  }
  return active
}

function cleanupStale(): void {
  const store = getStore()
  const now = Date.now()
  for (const [id, ts] of store) {
    if (now - ts >= STALE_MS) store.delete(id)
  }
}

export function getActiveSessions(): string[] {
  const store = getStore()
  const now = Date.now()
  const result: string[] = []
  for (const [id, ts] of store) {
    if (now - ts < STALE_MS) result.push(id)
  }
  return result
}

export function clearAllPresence(): void {
  const store = getStore()
  store.clear()
}

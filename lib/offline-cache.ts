export function cacheLastResult(result: unknown, address: string) {
  try {
    localStorage.setItem("park_last_result", JSON.stringify({ result, address, cachedAt: Date.now() }))
  } catch { /* quota exceeded or private browsing */ }
}

export function getLastResult(): { result: unknown; address: string; ageMinutes: number } | null {
  try {
    const raw = localStorage.getItem("park_last_result")
    if (!raw) return null
    const data = JSON.parse(raw)
    return { ...data, ageMinutes: Math.round((Date.now() - data.cachedAt) / 60000) }
  } catch {
    return null
  }
}

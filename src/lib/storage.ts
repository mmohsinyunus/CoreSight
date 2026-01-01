// src/lib/storage.ts
export const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined"

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (err) {
    console.warn("Failed to read storage", err)
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (!isBrowser) return
  try {
    if (value === undefined || (value as unknown) === null) {
      window.localStorage.removeItem(key)
      return
    }
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn("Failed to write storage", err)
  }
}

export function generateId(prefix: string) {
  const core =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return `${prefix}_${core}`
}

export function nowIso() {
  return new Date().toISOString()
}

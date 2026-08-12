import type { AppSettings, SavedToken, SimulationHistory } from "./types"

export const STORAGE_KEYS = {
  saved: "memecap.saved.v1",
  history: "memecap.history.v1",
  settings: "memecap.settings.v1",
} as const

export const DEFAULT_SETTINGS: AppSettings = {
  refreshSeconds: 30,
  liquidityWarningRatio: 0.25,
  compactNumbers: true,
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function getSavedTokens() {
  return readJson<SavedToken[]>(STORAGE_KEYS.saved, [])
}

export function setSavedTokens(tokens: SavedToken[]) {
  window.localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(tokens))
  window.dispatchEvent(new Event("memecap-storage"))
}

export function getHistory() {
  return readJson<SimulationHistory[]>(STORAGE_KEYS.history, [])
}

export function pushHistory(entry: SimulationHistory) {
  const next = [entry, ...getHistory().filter((item) => item.id !== entry.id)].slice(0, 30)
  window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next))
  window.dispatchEvent(new Event("memecap-storage"))
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<AppSettings>>(STORAGE_KEYS.settings, {}) }
}

export function setSettings(settings: AppSettings) {
  window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
  window.dispatchEvent(new Event("memecap-storage"))
}

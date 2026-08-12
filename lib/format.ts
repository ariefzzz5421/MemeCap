export function formatUsd(value: number | null | undefined, compact = true) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  const abs = Math.abs(value)

  if (compact && abs >= 1_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: abs >= 1_000_000 ? 1 : 1,
    }).format(value)
  }

  if (abs > 0 && abs < 0.01) {
    return `$${value.toLocaleString("en-US", { maximumSignificantDigits: 5 })}`
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatToken(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("en-US", {
    notation: Math.abs(value) >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 4,
  }).format(value)
}

export function formatPercent(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toLocaleString("en-US", { maximumFractionDigits: digits })}%`
}

export function formatMultiple(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  return `${value.toLocaleString("en-US", { maximumFractionDigits: value >= 100 ? 0 : 2 })}x`
}

export function truncateAddress(address: string) {
  if (address.length < 14) return address
  return `${address.slice(0, 6)}…${address.slice(-6)}`
}

export function formatAge(timestamp?: number | null) {
  if (!timestamp) return "Unknown"
  const days = Math.max(0, (Date.now() - timestamp) / 86_400_000)
  if (days < 1) return `${Math.max(1, Math.floor(days * 24))}h`
  if (days < 30) return `${Math.floor(days)}d`
  if (days < 365) return `${Math.floor(days / 30)}mo`
  return `${(days / 365).toFixed(1)}y`
}

export function parseNumericInput(value: string) {
  const normalized = value.replace(/[$,\s]/g, "").toLowerCase()
  const match = normalized.match(/^([0-9]*\.?[0-9]+)([kmbt])?$/)
  if (!match) return Number.NaN
  const multipliers: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }
  return Number(match[1]) * (match[2] ? multipliers[match[2]] : 1)
}

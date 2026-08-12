import type { DexPair, SimulationBasis, SimulationRow, SupplyKind } from "./types"

export const DEFAULT_TARGETS = [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000, 100_000_000, 1_000_000_000]

export function resolveSimulationBasis(
  pair: DexPair,
  supplyInput: number,
  supplyKind: SupplyKind,
): SimulationBasis | null {
  const price = Number(pair.priceUsd)
  const hasPrice = Number.isFinite(price) && price > 0
  const userSupply = Number.isFinite(supplyInput) && supplyInput > 0

  if (userSupply && supplyKind === "circulating") {
    return {
      supply: supplyInput,
      kind: "marketCap",
      source: "user",
      currentValuation: pair.marketCap ?? (hasPrice ? supplyInput * price : null),
      label: "Market Cap Simulation",
      supplyLabel: "Circulating Supply",
    }
  }

  if (userSupply && supplyKind === "total") {
    return {
      supply: supplyInput,
      kind: "fdv",
      source: "user",
      currentValuation: pair.fdv ?? (hasPrice ? supplyInput * price : null),
      label: "FDV Simulation",
      supplyLabel: "Total Supply",
    }
  }

  if (hasPrice && pair.marketCap && pair.marketCap > 0) {
    return {
      supply: pair.marketCap / price,
      kind: "marketCap",
      source: "estimated",
      currentValuation: pair.marketCap,
      label: "Market Cap Simulation",
      supplyLabel: "Estimated Supply",
    }
  }

  if (hasPrice && pair.fdv && pair.fdv > 0) {
    return {
      supply: pair.fdv / price,
      kind: "fdv",
      source: "estimated",
      currentValuation: pair.fdv,
      label: "FDV Simulation",
      supplyLabel: "Estimated Supply",
    }
  }

  return null
}

function nearlyEqual(a: number, b: number) {
  return Math.abs(a - b) / Math.max(a, b, 1) < 0.001
}

export function buildSimulationRows({
  basis,
  tokenAmount,
  currentValue,
  costBasis,
  customTarget,
}: {
  basis: SimulationBasis
  tokenAmount: number
  currentValue: number
  costBasis: number
  customTarget?: number
}): SimulationRow[] {
  const ownership = tokenAmount / basis.supply
  const baseline = costBasis > 0 ? costBasis : currentValue
  const targets: Array<{ value: number; tag?: string }> = DEFAULT_TARGETS.map((value) => ({ value }))

  if (customTarget && customTarget > 0) targets.push({ value: customTarget, tag: "Custom" })
  if (basis.currentValuation && basis.currentValuation > 0) {
    targets.push({ value: basis.currentValuation, tag: "Current" })
  }

  if (ownership > 0 && baseline > 0) {
    if (costBasis > 0) targets.push({ value: costBasis / ownership, tag: "Break-even" })
    for (const multiple of [2, 5, 10, 100]) {
      targets.push({ value: (baseline * multiple) / ownership, tag: `${multiple}x` })
    }
  }

  const merged: Array<{ value: number; tags: string[] }> = []
  for (const target of targets.filter((item) => Number.isFinite(item.value) && item.value > 0)) {
    const existing = merged.find((item) => nearlyEqual(item.value, target.value))
    if (existing) {
      if (target.tag && !existing.tags.includes(target.tag)) existing.tags.push(target.tag)
    } else {
      merged.push({ value: target.value, tags: target.tag ? [target.tag] : [] })
    }
  }

  return merged
    .sort((a, b) => a.value - b.value)
    .map(({ value, tags }) => {
      const targetPrice = value / basis.supply
      const holdingsValue = tokenAmount * targetPrice
      return {
        target: value,
        targetPrice,
        holdingsValue,
        multiple: baseline > 0 ? holdingsValue / baseline : null,
        profit: baseline > 0 ? holdingsValue - baseline : null,
        tags,
      }
    })
}

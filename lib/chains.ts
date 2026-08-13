export type ChainOption = {
  id: string
  label: string
  shortLabel: string
  logo?: string
}

export const CHAIN_OPTIONS: ChainOption[] = [
  { id: "all", label: "All Chains (Auto Detect)", shortLabel: "All" },
  { id: "solana", label: "Solana", shortLabel: "SOL", logo: "/crypto-logos/SOL.png" },
  { id: "ethereum", label: "Ethereum", shortLabel: "ETH", logo: "/crypto-logos/ETH.png" },
  { id: "base", label: "Base", shortLabel: "Base", logo: "/crypto-logos/Base.png" },
  { id: "bsc", label: "BNB Chain", shortLabel: "BNB", logo: "/crypto-logos/BNB.png" },
  { id: "arbitrum", label: "Arbitrum", shortLabel: "ARB", logo: "/crypto-logos/Arbitrum.png" },
  { id: "polygon", label: "Polygon", shortLabel: "POL", logo: "/crypto-logos/MATIC.png" },
  { id: "avalanche", label: "Avalanche", shortLabel: "AVAX", logo: "/crypto-logos/AVAX.png" },
  { id: "optimism", label: "Optimism", shortLabel: "OP", logo: "/crypto-logos/OP.png" },
  { id: "sui", label: "Sui", shortLabel: "SUI", logo: "/crypto-logos/SUI.png" },
  { id: "pulsechain", label: "PulseChain", shortLabel: "PLS", logo: "/crypto-logos/PulseChain.png" },
  { id: "robinhood", label: "Robinhood Chain", shortLabel: "ROBIN", logo: "/crypto-logos/RobinHood.png" },
]

const CHAIN_BY_ID = new Map(CHAIN_OPTIONS.map((chain) => [chain.id, chain]))

export function getChainOption(chainId: string) {
  return CHAIN_BY_ID.get(chainId.toLowerCase()) ?? {
    id: chainId,
    label: chainId,
    shortLabel: chainId.slice(0, 5).toUpperCase(),
  }
}

export function parseTokenInput(value: string) {
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) return { address: trimmed, chain: null as string | null }

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split("/").filter(Boolean)
    if (!url.hostname.endsWith("dexscreener.com") || parts.length < 2) {
      return { address: trimmed, chain: null as string | null }
    }
    return { address: parts[1], chain: parts[0].toLowerCase() }
  } catch {
    return { address: trimmed, chain: null as string | null }
  }
}

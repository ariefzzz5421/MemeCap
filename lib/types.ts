export type DexPair = {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  labels?: string[]
  baseToken: { address: string; name: string; symbol: string }
  quoteToken: { address: string; name: string; symbol: string }
  priceNative?: string
  priceUsd?: string | null
  txns?: Record<string, { buys: number; sells: number }>
  volume?: Record<string, number>
  priceChange?: Record<string, number>
  liquidity?: { usd?: number; base?: number; quote?: number } | null
  fdv?: number | null
  marketCap?: number | null
  pairCreatedAt?: number | null
  info?: {
    imageUrl?: string
    websites?: Array<{ label?: string; url: string }>
    socials?: Array<{ type?: string; platform?: string; url?: string; handle?: string }>
  }
  boosts?: { active?: number }
}

export type BoostInfo = {
  active: number
  amount: number | null
  totalAmount: number | null
  rank: number | null
  status: "BOOSTED" | "NO_ACTIVE_BOOST"
}

export type TokenOrder = {
  type?: "tokenProfile" | "communityTakeover" | "tokenAd" | "trendingBarAd"
  status?: "processing" | "cancelled" | "on-hold" | "approved" | "rejected"
  paymentTimestamp?: number
}

export type DexService = {
  name: string
  priceLabel: string
  description: string
  officialUrl: string
  lastChecked: string
  note?: string
}

export type TokenApiResponse = {
  pair: DexPair
  pairCount: number
  selectedBy: "highest-liquidity"
  boost: BoostInfo
  orders: TokenOrder[]
  services: DexService[]
  fetchedAt: string
}

export type SupplyKind = "auto" | "circulating" | "total"

export type SimulationBasis = {
  supply: number
  kind: "marketCap" | "fdv"
  source: "user" | "estimated"
  currentValuation: number | null
  label: "Market Cap Simulation" | "FDV Simulation"
  supplyLabel: "Circulating Supply" | "Total Supply" | "Estimated Supply"
}

export type SimulationRow = {
  target: number
  targetPrice: number
  holdingsValue: number
  multiple: number | null
  profit: number | null
  tags: string[]
}

export type SavedToken = {
  chainId: string
  address: string
  symbol: string
  name?: string
  tokenAmount: number
  costBasis?: number
  label?: string
  favorite?: boolean
  createdAt: string
}

export type SimulationHistory = SavedToken & {
  id: string
  targetMarketCap: number
  targetValue: number
  currentPrice: number
  simulatedAt: string
}

export type AppSettings = {
  refreshSeconds: 30 | 60 | 120
  liquidityWarningRatio: 0.1 | 0.25 | 0.5
  compactNumbers: boolean
}

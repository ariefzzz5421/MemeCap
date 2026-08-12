import { DEX_SERVICES } from "@/lib/dex-services"
import type { DexPair, TokenApiResponse, TokenOrder } from "@/lib/types"

export const runtime = "nodejs"

const SUPPORTED_CHAINS = new Set([
  "all",
  "solana",
  "ethereum",
  "base",
  "bsc",
  "arbitrum",
  "polygon",
  "avalanche",
  "optimism",
  "sui",
  "pulsechain",
])

type CachedResponse = { expiresAt: number; data?: TokenApiResponse; promise?: Promise<TokenApiResponse> }
const globalCache = globalThis as typeof globalThis & { __memecapCache?: Map<string, CachedResponse> }
const cache = globalCache.__memecapCache ?? new Map<string, CachedResponse>()
globalCache.__memecapCache = cache

function writeCache(key: string, value: CachedResponse) {
  if (cache.size >= 200 && !cache.has(key)) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.delete(key)
  cache.set(key, value)
}

function isValidAddress(chain: string, address: string) {
  if (chain === "all") return /^[a-zA-Z0-9:_-]{20,100}$/.test(address)
  if (["ethereum", "base", "bsc", "arbitrum", "polygon", "avalanche", "optimism", "pulsechain"].includes(chain)) {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
  if (chain === "solana") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
  return /^[a-zA-Z0-9:_-]{20,80}$/.test(address)
}

async function dexFetch<T>(path: string, revalidate: number): Promise<T> {
  const response = await fetch(`https://api.dexscreener.com${path}`, {
    headers: { Accept: "application/json", "User-Agent": "MemeCap-Simulator/1.0" },
    next: { revalidate },
    signal: AbortSignal.timeout(10_000),
  })

  if (response.status === 429) throw new Error("DEX Screener rate limit reached. Wait a moment and refresh.")
  if (!response.ok) throw new Error(`DEX Screener returned ${response.status}. Try refreshing market data.`)
  return response.json() as Promise<T>
}

async function findPairs(chain: string, address: string) {
  if (chain !== "all") {
    return dexFetch<DexPair[]>(`/token-pairs/v1/${encodeURIComponent(chain)}/${encodeURIComponent(address)}`, 20)
  }

  const result = await dexFetch<{ pairs?: DexPair[] }>(`/latest/dex/search?q=${encodeURIComponent(address)}`, 20)
  const needle = address.toLowerCase()
  return (result.pairs ?? []).filter((pair) =>
    pair.baseToken.address.toLowerCase() === needle || pair.pairAddress.toLowerCase() === needle,
  )
}

async function loadToken(chain: string, address: string): Promise<TokenApiResponse> {
  const pairs = await findPairs(chain, address)

  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error(chain === "all"
      ? "Token not found across DEX Screener chains, or it has no indexed liquidity pool."
      : "Token not found on this chain, or it has no indexed liquidity pool.")
  }

  const sorted = [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))
  const pair = sorted[0]
  const detectedChain = pair.chainId.toLowerCase()
  const tokenAddress = pair.baseToken.address

  const [latestBoosts, topBoosts, orders] = await Promise.all([
    dexFetch<Array<{ chainId?: string; tokenAddress?: string; amount?: number; totalAmount?: number }>>(
      "/token-boosts/latest/v1",
      60,
    ).catch(() => []),
    dexFetch<Array<{ chainId?: string; tokenAddress?: string; amount?: number; totalAmount?: number }>>(
      "/token-boosts/top/v1",
      60,
    ).catch(() => []),
    dexFetch<TokenOrder[] | { orders?: TokenOrder[] }>(`/orders/v1/${encodeURIComponent(detectedChain)}/${encodeURIComponent(tokenAddress)}`, 300).catch(() => []),
  ])
  const matches = (item: { chainId?: string; tokenAddress?: string }) =>
    item.chainId?.toLowerCase() === detectedChain && item.tokenAddress?.toLowerCase() === tokenAddress.toLowerCase()
  const latest = latestBoosts.find(matches)
  const topIndex = topBoosts.findIndex(matches)
  const top = topIndex >= 0 ? topBoosts[topIndex] : undefined
  const active = pair.boosts?.active ?? latest?.amount ?? top?.amount ?? 0

  return {
    pair,
    pairCount: pairs.length,
    selectedBy: "highest-liquidity",
    boost: {
      active,
      amount: latest?.amount ?? top?.amount ?? null,
      totalAmount: latest?.totalAmount ?? top?.totalAmount ?? null,
      rank: topIndex >= 0 ? topIndex + 1 : null,
      status: active > 0 ? "BOOSTED" : "NO_ACTIVE_BOOST",
    },
    orders: Array.isArray(orders) ? orders : Array.isArray(orders.orders) ? orders.orders : [],
    services: DEX_SERVICES,
    fetchedAt: new Date().toISOString(),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chain = (searchParams.get("chain") ?? "").toLowerCase().trim()
  const address = (searchParams.get("address") ?? "").trim()

  if (!SUPPORTED_CHAINS.has(chain)) {
    return Response.json({ error: "Unsupported chain. Use All Chains or choose one of the listed networks." }, { status: 400 })
  }
  if (!isValidAddress(chain, address)) {
    return Response.json({ error: "Invalid contract address for the selected chain." }, { status: 400 })
  }

  const key = `${chain}:${address.toLowerCase()}`
  const now = Date.now()
  const existing = cache.get(key)
  if (existing?.data && existing.expiresAt > now) {
    return Response.json(existing.data, {
      headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60", "X-MemeCap-Cache": "HIT" },
    })
  }

  try {
    const promise = existing?.promise ?? loadToken(chain, address)
    writeCache(key, { expiresAt: now + 20_000, promise })
    const data = await promise
    writeCache(key, { expiresAt: now + 20_000, data })
    return Response.json(data, {
      headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60", "X-MemeCap-Cache": "MISS" },
    })
  } catch (error) {
    cache.delete(key)
    const message = error instanceof Error ? error.message : "DEX Screener is temporarily unavailable."
    const status = message.includes("not found") ? 404 : message.includes("rate limit") ? 429 : 502
    return Response.json({ error: message }, { status })
  }
}

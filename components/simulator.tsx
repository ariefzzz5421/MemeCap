"use client"

import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { AlertTriangle, ArrowUpRight, Bookmark, BookmarkCheck, Check, Copy, ExternalLink, Info, RefreshCw, Rocket, Search } from "lucide-react"
import { ClipboardEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { buildSimulationRows, resolveSimulationBasis } from "@/lib/calculations"
import { getChainOption, parseTokenInput } from "@/lib/chains"
import { formatAge, formatMultiple, formatPercent, formatToken, formatUsd, parseNumericInput, truncateAddress } from "@/lib/format"
import { getSavedTokens, getSettings, pushHistory, setSavedTokens } from "@/lib/storage"
import type { SavedToken, SupplyKind, TokenApiResponse } from "@/lib/types"
import { ChainIcon } from "./chain-icon"
import { ChainSelect } from "./chain-select"
import { ShareDialog } from "./share-dialog"

type Props = { initialChain?: string; initialAddress?: string }

export function Simulator({ initialChain = "all", initialAddress = "" }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [chain, setChain] = useState(initialChain)
  const [address, setAddress] = useState(initialAddress)
  const [data, setData] = useState<TokenApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [tokenAmount, setTokenAmount] = useState("")
  const [costBasis, setCostBasis] = useState("")
  const [supply, setSupply] = useState("")
  const [supplyKind, setSupplyKind] = useState<SupplyKind>("auto")
  const [customTarget, setCustomTarget] = useState("25000000")
  const [selectedTarget, setSelectedTarget] = useState(10_000_000)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const requestRef = useRef<AbortController | null>(null)
  const settings = useMemo(() => getSettings(), [])

  const fetchToken = useCallback(async (nextChain: string, nextAddress: string, updateRoute = true, preserveExistingData = false) => {
    const parsedInput = parseTokenInput(nextAddress)
    if (!parsedInput.address) return
    const requestedChain = parsedInput.chain ?? nextChain
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/dex/token?chain=${encodeURIComponent(requestedChain)}&address=${encodeURIComponent(parsedInput.address)}`, { signal: controller.signal })
      const payload = await response.json() as TokenApiResponse & { error?: string }
      if (!response.ok) throw new Error(payload.error ?? "Could not load this token. Check the address and chain.")
      if (controller.signal.aborted || requestRef.current !== controller) return
      setData(payload)
      setChain(payload.pair.chainId)
      setAddress(payload.pair.baseToken.address)
      setSecondsAgo(0)
      const existing = getSavedTokens().some((item) => item.chainId === payload.pair.chainId && item.address.toLowerCase() === payload.pair.baseToken.address.toLowerCase())
      setSaved(existing)
      const tokenPath = `/token/${payload.pair.chainId}/${payload.pair.baseToken.address}`
      if (updateRoute && pathname !== tokenPath) router.push(tokenPath)
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return
      if (requestRef.current !== controller) return
      if (!preserveExistingData) {
        setData(null)
        setError(reason instanceof Error ? reason.message : "DEX Screener is unavailable. Try again shortly.")
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null
        setLoading(false)
      }
    }
  }, [pathname, router])

  useEffect(() => {
    const timer = window.setTimeout(() => { if (initialAddress) void fetchToken(initialChain, initialAddress, false) }, 0)
    return () => { window.clearTimeout(timer); requestRef.current?.abort() }
  }, [fetchToken, initialAddress, initialChain])

  useEffect(() => {
    if (!data) return
    const tick = window.setInterval(() => setSecondsAgo((value) => value + 1), 1000)
    const refresh = window.setInterval(() => void fetchToken(data.pair.chainId, data.pair.baseToken.address, false, true), settings.refreshSeconds * 1000)
    return () => { window.clearInterval(tick); window.clearInterval(refresh) }
  }, [data, fetchToken, settings.refreshSeconds])

  function submit(event: FormEvent) {
    event.preventDefault()
    void fetchToken(chain, address)
  }

  function analyzePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text").trim()
    if (!pasted) return
    event.preventDefault()
    const parsed = parseTokenInput(pasted)
    const requestedChain = parsed.chain ?? "all"
    setAddress(pasted)
    setChain(requestedChain)
    void fetchToken(requestedChain, pasted)
  }

  const pair = data?.pair ?? null
  const amount = parseNumericInput(tokenAmount)
  const cost = parseNumericInput(costBasis)
  const supplyValue = parseNumericInput(supply)
  const customValue = parseNumericInput(customTarget)
  const price = Number(pair?.priceUsd)
  const currentValue = Number.isFinite(amount) && Number.isFinite(price) ? amount * price : 0
  const basis = pair ? resolveSimulationBasis(pair, supplyValue, supplyKind) : null
  const ownership = basis && Number.isFinite(amount) ? amount / basis.supply : 0
  const rows = useMemo(() => basis && Number.isFinite(amount) && amount > 0 ? buildSimulationRows({ basis, tokenAmount: amount, currentValue, costBasis: Number.isFinite(cost) ? cost : 0, customTarget: Number.isFinite(customValue) ? customValue : undefined }) : [], [amount, basis, cost, currentValue, customValue])
  const selectedRow = rows.reduce((closest, row) => Math.abs(row.target - selectedTarget) < Math.abs(closest.target - selectedTarget) ? row : closest, rows[0])
  const roi = selectedRow && Number.isFinite(cost) && cost > 0 ? ((selectedRow.holdingsValue - cost) / cost) * 100 : null
  const liquidity = pair?.liquidity?.usd ?? 0
  const liquidityWarning = selectedRow && liquidity > 0 && selectedRow.holdingsValue > liquidity * settings.liquidityWarningRatio

  function toggleSave() {
    if (!pair || !Number.isFinite(amount)) return
    const tokens = getSavedTokens()
    const keyMatch = (item: SavedToken) => item.chainId === pair.chainId && item.address.toLowerCase() === pair.baseToken.address.toLowerCase()
    if (saved) {
      setSavedTokens(tokens.filter((item) => !keyMatch(item)))
      setSaved(false)
    } else {
      setSavedTokens([{ chainId: pair.chainId, address: pair.baseToken.address, symbol: pair.baseToken.symbol, name: pair.baseToken.name, tokenAmount: amount, costBasis: Number.isFinite(cost) && cost > 0 ? cost : undefined, favorite: false, createdAt: new Date().toISOString() }, ...tokens.filter((item) => !keyMatch(item))])
      setSaved(true)
    }
  }

  function recordHistory() {
    if (!pair || !selectedRow || !Number.isFinite(amount)) return
    pushHistory({ id: `${pair.chainId}:${pair.baseToken.address}:${selectedRow.target}`, chainId: pair.chainId, address: pair.baseToken.address, symbol: pair.baseToken.symbol, name: pair.baseToken.name, tokenAmount: amount, costBasis: Number.isFinite(cost) ? cost : undefined, createdAt: new Date().toISOString(), targetMarketCap: selectedRow.target, targetValue: selectedRow.holdingsValue, currentPrice: price, simulatedAt: new Date().toISOString() })
  }

  async function copyAddress() {
    if (!pair) return
    await navigator.clipboard.writeText(pair.baseToken.address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <div className="page-intro">
        <h1>Model the cap. Size the position.</h1>
        <p>Paste a token address, enter the tokens you own, and inspect each target with market-cap and FDV assumptions kept separate.</p>
      </div>

      <section className="terminal-panel search-panel" aria-labelledby="search-title">
        <div className="panel-head"><h2 className="panel-title" id="search-title">Token Search</h2></div>
        <div className="panel-body">
          <form className="search-form" onSubmit={submit}>
            <div className="field"><label htmlFor="chain">Chain</label><ChainSelect disabled={loading} onChange={setChain} value={chain} /></div>
            <div className="field"><label htmlFor="address">Contract Address or DEX Screener URL</label><input className="input" id="address" value={address} onChange={(event) => { setAddress(event.target.value); if (error) setError("") }} onPaste={analyzePaste} placeholder="Paste a contract address" aria-invalid={Boolean(error)} aria-describedby="address-help" required /><span className="field-help" id="address-help">{loading && chain === "all" ? "Detecting the network and primary liquidity pair\u2026" : pair ? `Detected ${getChainOption(pair.chainId).label} \u00b7 highest-liquidity pair selected.` : "Paste a CA to auto-detect its chain. EVM addresses are verified through live DEX Screener pairs."}</span></div>
            <button className="btn btn-primary search-submit" data-state={loading ? "loading" : "idle"} disabled={loading || !address.trim()} type="submit">{loading ? <RefreshCw size={17} /> : <Search size={17} />} {loading ? "Analyzing" : "Analyze"}</button>
          </form>
          {error && <div className="error-box" role="alert"><AlertTriangle aria-hidden="true" size={18} /><span>{error}</span></div>}
        </div>
        {loading && !data && <LoadingToken />}
        {pair && data && (
          <>
            <div className="token-header">
              <div className="token-identity">
                <div className="token-logo">{pair.info?.imageUrl ? <Image src={pair.info.imageUrl} alt={`${pair.baseToken.name} logo`} width={48} height={48} unoptimized /> : pair.baseToken.symbol.slice(0, 2)}</div>
                <div><div className="token-name">{pair.baseToken.name} / ${pair.baseToken.symbol}</div><div className="token-meta"><span className="detected-chain"><ChainIcon chainId={pair.chainId} size={20} /> {getChainOption(pair.chainId).label} · {pair.dexId}</span><button className="btn btn-quiet" onClick={copyAddress} type="button">{copied ? <Check size={14} /> : <Copy size={14} />} {truncateAddress(pair.baseToken.address)}</button></div></div>
              </div>
              <div className="token-actions"><button className="btn" onClick={toggleSave} type="button">{saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} {saved ? "Saved" : "Save Token"}</button><a className="btn" href={pair.url} target="_blank" rel="noreferrer">View on DEX Screener <ArrowUpRight size={16} /></a></div>
            </div>
            <div className="market-strip tnum">
              <MarketStat label="Price" value={formatUsd(price, false)} />
              <MarketStat label="Market Cap" value={formatUsd(pair.marketCap)} />
              <MarketStat label="FDV" value={formatUsd(pair.fdv)} />
              <MarketStat label="Liquidity" value={formatUsd(liquidity)} />
              <MarketStat label="24H Volume" value={formatUsd(pair.volume?.h24)} />
              <MarketStat label="24H Change" value={formatPercent(pair.priceChange?.h24)} tone={(pair.priceChange?.h24 ?? 0) >= 0 ? "positive" : "negative"} />
              <MarketStat label="Pair Age" value={formatAge(pair.pairCreatedAt)} />
            </div>
          </>
        )}
      </section>

      {!pair && !loading && !error && <div className="empty-state"><Search size={28} aria-hidden="true" /><div><h2>Start with a contract address.</h2><p>DEX Screener market data appears here. No demo token is substituted for live data.</p></div></div>}

      {pair && data && (
        <>
          <div className="workspace-grid">
            <section className="panel position-panel" aria-labelledby="position-title">
              <div className="panel-head"><h2 className="panel-title" id="position-title">My Position</h2><button className="btn icon-btn btn-quiet" onClick={() => void fetchToken(pair.chainId, pair.baseToken.address, false)} aria-label="Refresh market data"><RefreshCw size={16} /></button></div>
              <div className="panel-body position-form">
                <div className="field"><label htmlFor="tokens">Tokens Owned</label><input className="input tnum" id="tokens" inputMode="decimal" value={tokenAmount} onChange={(event) => setTokenAmount(event.target.value)} /></div>
                <div className="field"><label htmlFor="cost">Initial Cost / Cost Basis (USD)</label><input className="input tnum" id="cost" inputMode="decimal" value={costBasis} onChange={(event) => setCostBasis(event.target.value)} /></div>
                <div className="field"><label htmlFor="supply-kind">Supply Basis</label><select className="select" id="supply-kind" value={supplyKind} onChange={(event) => setSupplyKind(event.target.value as SupplyKind)}><option value="auto">Auto from DEX data</option><option value="circulating">Circulating supply</option><option value="total">Total supply</option></select></div>
                {supplyKind !== "auto" && <div className="field"><label htmlFor="supply">{supplyKind === "circulating" ? "Circulating" : "Total"} Supply</label><input className="input tnum" id="supply" inputMode="decimal" value={supply} onChange={(event) => setSupply(event.target.value)} placeholder="e.g. 1B" /></div>}
                {basis ? <div className="basis-banner"><Info size={18} aria-hidden="true" /><div><strong>{basis.label}</strong><p>{basis.supplyLabel}: {formatToken(basis.supply)}{basis.source === "estimated" ? " · derived from current valuation ÷ price; not official supply" : " · user supplied"}</p></div></div> : <div className="warning-box"><AlertTriangle size={18} /><div><strong>Supply unavailable</strong><p>Enter circulating or total supply to enable a transparent simulation.</p></div></div>}
              </div>
              <div className="position-metrics tnum">
                <Metric label="Tokens Owned" value={formatToken(amount)} />
                <Metric label="Supply Ownership" value={basis ? `${(ownership * 100).toLocaleString("en-US", { maximumFractionDigits: 6 })}%` : "—"} />
                <Metric label="Current Price" value={formatUsd(price, false)} />
                <Metric label="Current Value" value={formatUsd(currentValue, false)} />
                <Metric label="Current PnL" value={Number.isFinite(cost) && cost > 0 ? formatUsd(currentValue - cost, false) : "—"} tone={currentValue - cost >= 0 ? "positive" : "negative"} />
                <Metric label="Current MC" value={formatUsd(pair.marketCap)} />
                <Metric label="FDV" value={formatUsd(pair.fdv)} />
                <Metric label="Liquidity" value={formatUsd(liquidity)} />
              </div>
            </section>

            <section className="terminal-panel" aria-labelledby="simulation-title">
              <div className="panel-head"><h2 className="panel-title" id="simulation-title">Market Cap Simulator</h2><span className="muted tnum">Updated {secondsAgo}s ago</span></div>
              <div className="panel-body">
                <div className="field"><label htmlFor="custom-target">Custom Market Cap</label><input className="input tnum" id="custom-target" inputMode="decimal" value={customTarget} onChange={(event) => setCustomTarget(event.target.value)} placeholder="2.5M, 25M, 500M" /></div>
              </div>
              {basis && rows.length > 0 ? <div className="table-wrap"><table className="sim-table"><thead><tr><th>Target {basis.kind === "marketCap" ? "MC" : "FDV"}</th><th>Target Price</th><th>Holdings Value</th><th>Multiple</th><th>Profit</th></tr></thead><tbody>{rows.map((row) => <tr data-highlight={row.tags.length > 0} data-selected={row.target === selectedTarget} key={row.target}><td><div className="table-target"><button className="btn btn-quiet" onClick={() => setSelectedTarget(row.target)} type="button">{formatUsd(row.target)}</button>{row.tags.length > 0 && <span className="tags">{row.tags.map((tag) => <span className={`tag ${tag === "Current" || tag === "Custom" ? "tag-accent" : ""}`} key={tag}>{tag}</span>)}</span>}</div></td><td>{formatUsd(row.targetPrice, false)}</td><td>{formatUsd(row.holdingsValue, false)}</td><td>{formatMultiple(row.multiple)}</td><td className={(row.profit ?? 0) >= 0 ? "positive" : "negative"}>{formatUsd(row.profit, false)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Info size={24} /><p>A valid supply basis and token amount are required for target calculations.</p></div>}
              {selectedRow && <div className="panel-body token-actions"><button className="btn" onClick={recordHistory} type="button"><Check size={16} /> Save to History</button><ShareDialog symbol={pair.baseToken.symbol} tokenAmount={amount} currentMarketCap={basis?.currentValuation ?? null} targetMarketCap={selectedRow.target} currentValue={currentValue} targetValue={selectedRow.holdingsValue} multiple={selectedRow.multiple} roi={roi} /></div>}
            </section>
          </div>

          {basis && Number.isFinite(amount) && amount > 0 && <section className="section-stack" aria-labelledby="scenarios-title"><div className="section-heading"><div><h2 id="scenarios-title">Position scenarios</h2><p>Calculated from the same supply basis above—not from preset dollar outcomes.</p></div></div><div className="scenario-grid">{[
            ["Conservative", 500_000], ["Bull", 5_000_000], ["Moon", 100_000_000], ["Insane", 1_000_000_000],
          ].map(([name, target]) => { const value = ownership * Number(target); return <button className="scenario" onClick={() => setSelectedTarget(Number(target))} key={String(name)} type="button"><span className="scenario-name">{name}</span><span className="scenario-target">{formatUsd(Number(target))}</span><span className="scenario-value">{formatUsd(value)}</span><span className="scenario-multiple">{Number.isFinite(cost) && cost > 0 ? formatMultiple(value / cost) : "multiple unavailable"}</span></button> })}</div></section>}

          {liquidityWarning && <div className="warning-box" role="note"><AlertTriangle size={20} aria-hidden="true" /><div><strong>Liquidity is very low relative to simulated position value.</strong><p>Portfolio value on paper does not mean the full position can be sold at that value. Slippage and price impact may be severe.</p></div></div>}

          <section className="section-stack" aria-labelledby="market-title"><div className="section-heading"><div><h2 id="market-title">Live market</h2><p>Official pair data and direct chart access. No fragile chart-page scraping.</p></div></div><div className="data-grid">
            <div className="terminal-panel chart-placeholder"><div><h3>{pair.baseToken.symbol}/{pair.quoteToken.symbol}</h3><p>Open the full live chart on DEX Screener for candles, pair-level trades, and liquidity context.</p></div><a className="btn btn-primary" href={pair.url} target="_blank" rel="noreferrer">Open DEX Screener Chart <ExternalLink size={16} /></a></div>
            <div className="terminal-panel"><div className="panel-head"><h3 className="panel-title">DEX Screener Boost</h3><span className={data.boost.status === "BOOSTED" ? "positive" : "muted"}>{data.boost.status === "BOOSTED" ? "BOOSTED" : "NO ACTIVE BOOST"}</span></div><div className="panel-body"><div className="boost-score tnum">{formatToken(data.boost.active)} <small>active boosts</small></div><div className="position-metrics"><Metric label="Boost Amount" value={formatToken(data.boost.amount)} /><Metric label="Total Boost" value={formatToken(data.boost.totalAmount)} /><Metric label="Top Rank" value={data.boost.rank ? `#${data.boost.rank}` : "Not ranked"} /><Metric label="Golden Ticker" value={data.boost.active >= 500 ? "Unlocked" : "No"} /></div><a className="btn" href={pair.url} target="_blank" rel="noreferrer"><Rocket size={16} /> View / Boost</a></div></div>
          </div></section>

          <div className="warning-box"><AlertTriangle size={20} aria-hidden="true" /><div><strong>Financial disclaimer</strong><p>Estimated position value assumes the token can trade at the selected market cap. Actual realizable value may be substantially lower due to liquidity, slippage, taxes, price impact, circulating supply, and market conditions.</p></div></div>
        </>
      )}
    </>
  )
}

function MarketStat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) { return <div className="market-stat"><span>{label}</span><strong className={tone}>{value}</strong></div> }
function Metric({ label, value, tone = "" }: { label: string; value: string; tone?: string }) { return <div className="metric"><span className="metric-label">{label}</span><span className={`metric-value ${tone}`}>{value}</span></div> }
function LoadingToken() { return <div className="token-header" aria-label="Loading token data"><div className="token-identity"><div className="token-logo skeleton">--</div><div><div className="skeleton">Loading token market data</div><div className="muted">Selecting the highest-liquidity pair…</div></div></div></div> }

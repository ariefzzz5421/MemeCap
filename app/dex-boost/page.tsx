import type { Metadata } from "next"
import { ArrowUpRight, Clock3, Crown, Eye, Rocket, ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: "DEX Screener Boost",
  description: "Official DEX Screener Boost mechanics, pricing availability, and risk context.",
}

const LAST_CHECKED = "August 13, 2026"

const BOOST_FACTS = [
  { label: "Primary effect", value: "Higher Trending Score", detail: "A purchased pack temporarily increases the token's score and can improve visibility on DEX Screener.", icon: Rocket },
  { label: "Pack duration", value: "12–24 hours", detail: "Official documentation states the duration depends on the selected pack.", icon: Clock3 },
  { label: "Visible signal", value: "Active boost count", detail: "The number of active Boosts is displayed next to the token across the platform.", icon: Eye },
  { label: "Golden Ticker", value: "500+ active Boosts", detail: "The token symbol turns gold while at least 500 Boosts remain active.", icon: Crown },
]

export default function DexBoostPage() {
  return (
    <div className="list-page">
      <div className="page-intro boost-intro">
        <h1>Visibility, not valuation.</h1>
        <p>DEX Screener Boost is paid exposure inside DEX Screener. It can raise Trending Score and visibility, but it does not create liquidity or guarantee buyers, volume, price appreciation, or rank.</p>
      </div>

      <section className="boost-ledger" aria-label="Boost mechanics">
        {BOOST_FACTS.map(({ label, value, detail, icon: Icon }) => (
          <article className="boost-fact" key={label}>
            <Icon aria-hidden="true" size={19} />
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="terminal-panel" aria-labelledby="boost-price-title">
        <div className="panel-head"><h2 className="panel-title" id="boost-price-title">Current Boost Pricing</h2><span className="muted tnum">CHECKED · {LAST_CHECKED}</span></div>
        <div className="boost-price-grid">
          <div className="boost-price-status">
            <span>Official public price feed</span>
            <strong>Not available</strong>
          </div>
          <div className="boost-price-copy">
            <p>DEX Screener’s public API exposes active amount and total amount, but it does not expose Boost pack prices. Because checkout pricing can change, MemeCap does not hardcode an unverified dollar figure.</p>
            <p>To see the exact current price, open a token page in a web browser and use the yellow <strong>Boost</strong> button. Boost purchasing is not available in the mobile app.</p>
          </div>
          <a className="btn btn-primary" href="https://dexscreener.com/boosting" target="_blank" rel="noreferrer">Check Current Official Price <ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section className="terminal-panel" aria-labelledby="boost-data-title">
        <div className="panel-head"><h2 className="panel-title" id="boost-data-title">What the Live Data Means</h2><span className="muted tnum">OFFICIAL API FIELDS</span></div>
        <div className="table-wrap">
          <table className="sim-table boost-data-table">
            <thead><tr><th>Field</th><th>Meaning</th><th>What it does not prove</th></tr></thead>
            <tbody>
              <tr><td><strong>Active Boosts</strong></td><td>Boosts currently contributing to token visibility.</td><td>Organic demand or sustainable volume.</td></tr>
              <tr><td><strong>Amount</strong></td><td>Boost amount shown by the latest/top official endpoint.</td><td>USD spent; the API does not return pack price.</td></tr>
              <tr><td><strong>Total Amount</strong></td><td>Cumulative boost amount reported for the token.</td><td>Current active amount or remaining duration.</td></tr>
              <tr><td><strong>Top Rank</strong></td><td>Position within the API’s current top-boosted response when present.</td><td>A guaranteed Trending page rank.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="warning-box" role="note">
        <ShieldAlert aria-hidden="true" size={20} />
        <div><strong>Boost is promotion—not due diligence</strong><p>A boosted token can still have weak liquidity, concentrated holders, high taxes, malicious contracts, or no real product. Verify the contract and size positions independently.</p></div>
      </div>

      <div className="official-links">
        <a className="btn" href="https://docs.dexscreener.com/boosting" target="_blank" rel="noreferrer">Official Boost Documentation <ArrowUpRight size={15} /></a>
        <a className="btn" href="https://docs.dexscreener.com/api/reference" target="_blank" rel="noreferrer">Official API Reference <ArrowUpRight size={15} /></a>
      </div>
    </div>
  )
}

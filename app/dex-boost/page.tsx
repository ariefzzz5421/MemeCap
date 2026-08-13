import type { Metadata } from "next"
import Image from "next/image"
import { ArrowUpRight, Check, Clock3, Crown, Eye, FileCheck2, Rocket, SearchCheck, ShieldAlert, TrendingUp } from "lucide-react"
import { DEX_SERVICES, DEX_SERVICES_LAST_CHECKED } from "@/lib/dex-services"

export const metadata: Metadata = {
  title: "DEX Screener Boost",
  description: "Official DEX Screener Boost mechanics, pricing availability, and risk context.",
}

const LAST_CHECKED = "August 13, 2026"

const BOOST_PACKS = [
  { boosts: 10, duration: "12 hours", price: 99, featured: false },
  { boosts: 30, duration: "12 hours", price: 249, featured: false },
  { boosts: 50, duration: "12 hours", price: 399, featured: true },
  { boosts: 100, duration: "24 hours", price: 899, featured: false },
  { boosts: 500, duration: "24 hours", price: 3999, featured: false },
] as const

const BOOST_FACTS = [
  { label: "Primary effect", value: "Higher Trending Score", detail: "A purchased pack temporarily increases the token's score and can improve visibility on DEX Screener.", icon: Rocket },
  { label: "Pack duration", value: "12–24 hours", detail: "Official documentation states the duration depends on the selected pack.", icon: Clock3 },
  { label: "Visible signal", value: "Active boost count", detail: "The number of active Boosts is displayed next to the token across the platform.", icon: Eye },
  { label: "Golden Ticker", value: "500+ active Boosts", detail: "The token symbol turns gold while at least 500 Boosts remain active.", icon: Crown },
]

const PROFILE_CHECKLIST = ["Logo", "Website", "X / Twitter", "Telegram", "Description"]

const UPDATE_WORKFLOW = [
  { label: "Prepare", title: "Complete the token profile", detail: "Use a clear logo, official links, concise description, and matching social handles before buying attention.", icon: FileCheck2 },
  { label: "Verify", title: "Check the live token page", detail: "Confirm the correct contract, chain, pair, and highest-liquidity market. A polished profile on the wrong pair still misleads users.", icon: SearchCheck },
  { label: "Promote", title: "Boost only with a baseline", detail: "Record liquidity, volume, transactions, and active Boosts first so the campaign can be reviewed without guessing.", icon: TrendingUp },
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
        <div className="boost-pricing-intro">
          <Image alt="MemeCap lightning boost emblem" className="boost-bolt-art" height={112} priority src="/boost/boost-bolt.png" width={112} />
          <div><strong>Official checkout snapshot</strong><p>Verified directly in DEX Screener’s token-page Boost checkout. Prices are not returned by the public API and can change, so always recheck before paying.</p></div>
        </div>
        <div className="boost-pack-grid">
          {BOOST_PACKS.map((pack) => (
            <article className="boost-pack" data-featured={pack.featured || undefined} key={pack.boosts}>
              <div className="boost-pack-mark"><Image alt="" aria-hidden="true" height={34} src="/boost/boost-bolt.png" width={34} /><span>{pack.boosts}×</span></div>
              <strong>${pack.price.toLocaleString("en-US")}</strong>
              <span>{pack.duration}</span>
              <small>${(pack.price / pack.boosts).toFixed(2)} per Boost</small>
            </article>
          ))}
        </div>
        <figure className="boost-reference-figure">
          <Image
            alt="Official DEX Screener Boost checkout showing 10, 30, 50, 100, and 500 Boost packs with prices and durations"
            height={834}
            sizes="(min-width: 960px) 72rem, 100vw"
            src="/references/dex-screener-boost-pricing-2026-08-13.png"
            width={1518}
          />
          <figcaption><strong>Official checkout evidence</strong><span>Captured August 13, 2026. Checkout prices can change; confirm the live total before payment.</span></figcaption>
        </figure>
        <div className="boost-price-copy panel-body">
          <p>Boosts temporarily raise a token’s <strong>Trending Score</strong> and visible active-Boost count. The official checkout says the Golden Ticker unlocks at 500 active Boosts.</p>
          <p>Boosting does not add liquidity, guarantee Trending rank, create buyers, or guarantee price appreciation.</p>
          <a className="btn btn-primary" href="https://dexscreener.com/" target="_blank" rel="noreferrer">Open DEX Screener <ArrowUpRight size={16} /></a>
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

      <section className="section-stack" aria-labelledby="services-guide-title">
        <div className="section-heading">
          <div><h2 id="services-guide-title">DEX Screener services guide</h2><p>Choose a service by the problem it solves. Recheck any payable amount on the official checkout before purchase.</p></div>
          <a className="btn" href="https://marketplace.dexscreener.com/" target="_blank" rel="noreferrer">Open Marketplace <ArrowUpRight size={16} /></a>
        </div>
        <div className="terminal-panel">
          <div className="panel-head"><h3 className="panel-title">Service map</h3><span className="muted tnum">CHECKED · {DEX_SERVICES_LAST_CHECKED}</span></div>
          <div className="panel-body service-list">
            {DEX_SERVICES.map((service) => (
              <div className="service-row" key={service.name}>
                <div><strong>{service.name}</strong><div className="service-price">{service.name === "Token Boost" ? "See verified pack snapshot above" : service.priceLabel}</div></div>
                <p>{service.description}<br />Last price check: {service.lastChecked}</p>
                <a className="btn" href={service.officialUrl} target="_blank" rel="noreferrer">Official Link <ArrowUpRight size={15} /></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-stack" aria-labelledby="update-guide-title">
        <div className="section-heading"><div><h2 id="update-guide-title">How token updates and Boost work together</h2><p>Token information builds trust and context. Boost buys temporary visibility. They solve different problems and work best in that order.</p></div></div>
        <div className="workflow-grid">
          {UPDATE_WORKFLOW.map(({ label, title, detail, icon: Icon }, index) => (
            <article className="workflow-step" key={label}>
              <div className="workflow-step-label"><span className="tnum">0{index + 1}</span><Icon aria-hidden="true" size={18} /></div>
              <div className="workflow-step-title"><span>{label}</span><h3>{title}</h3></div>
              <p>{detail}</p>
            </article>
          ))}
        </div>
        <div className="terminal-panel profile-guide">
          <div className="panel-head"><h3 className="panel-title">Update token information</h3><span className="muted">PROFILE CHECKLIST</span></div>
          <div className="profile-guide-body">
            <div className="profile-checklist">
              {PROFILE_CHECKLIST.map((item) => <div key={item}><Check aria-hidden="true" size={16} /><span>{item}</span></div>)}
            </div>
            <div className="profile-guide-copy">
              <strong>Submit through the official marketplace</strong>
              <p>MemeCap can show information returned with a selected pair, but it cannot edit DEX Screener records. Open the official service, submit the correct contract, then verify the public token page after approval.</p>
              <div className="official-links"><a className="btn btn-primary" href="https://marketplace.dexscreener.com/" target="_blank" rel="noreferrer">Update Token Info <ArrowUpRight size={16} /></a><a className="btn" href="https://marketplace.dexscreener.com/" target="_blank" rel="noreferrer">Check Current Pricing</a></div>
            </div>
          </div>
        </div>
      </section>

      <section className="terminal-panel study-case" aria-labelledby="study-case-title">
        <div className="panel-head"><h2 className="panel-title" id="study-case-title">Study Case · 50 Boost launch</h2><span className="muted">ILLUSTRATIVE WORKFLOW</span></div>
        <div className="study-case-summary">
          <div><span>Official snapshot</span><strong>50 Boosts</strong></div>
          <div><span>Checkout price</span><strong>$399</strong></div>
          <div><span>Duration</span><strong>12 hours</strong></div>
        </div>
        <div className="study-case-flow">
          <article><span>Before</span><h3>Capture the baseline</h3><p>Save liquidity, 24h volume, transactions, price, and active Boost count. Finish the profile checklist first.</p></article>
          <article><span>During</span><h3>Observe visibility</h3><p>Watch the active-Boost signal and Trending exposure. Treat volume or price changes as correlation, not proof that Boost caused them.</p></article>
          <article><span>After</span><h3>Review the outcome</h3><p>Compare equivalent time windows and the cost per useful visit or trade if you have analytics. A higher token price is never guaranteed.</p></article>
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

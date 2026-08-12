import type { Metadata } from "next"
import { Calculator } from "lucide-react"
import { formatToken, formatUsd } from "@/lib/format"

export const metadata: Metadata = {
  title: "1B Supply Calculator",
  description: "Fixed 1 billion supply market-cap value reference table.",
}

const SUPPLY = 1_000_000_000
const TOKEN_AMOUNTS = [100_000, 500_000, 1_000_000, 10_000_000]
const MARKET_CAPS = [10_000, 50_000, 100_000, 300_000, 500_000, 1_000_000, 3_000_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000]

export default function CalculatorPage() {
  return (
    <div className="list-page">
      <div className="page-intro compact-intro">
        <h1>1B supply value table.</h1>
        <p>Static reference for four token holdings across eleven market-cap levels. Every value uses a fixed 1,000,000,000 supply.</p>
      </div>

      <section className="terminal-panel" aria-labelledby="calculator-title">
        <div className="panel-head">
          <h2 className="panel-title" id="calculator-title"><Calculator aria-hidden="true" size={17} /> Holdings Value Matrix</h2>
          <span className="muted tnum">SUPPLY · {formatToken(SUPPLY)}</span>
        </div>
        <div className="table-wrap">
          <table className="sim-table calculator-table">
            <thead>
              <tr>
                <th>Market Cap</th>
                <th>Token Price</th>
                {TOKEN_AMOUNTS.map((amount) => <th key={amount}>{formatToken(amount)} tokens</th>)}
              </tr>
            </thead>
            <tbody>
              {MARKET_CAPS.map((marketCap) => {
                const tokenPrice = marketCap / SUPPLY
                return (
                  <tr key={marketCap}>
                    <td><strong>{formatUsd(marketCap)}</strong></td>
                    <td>{formatUsd(tokenPrice, false)}</td>
                    {TOKEN_AMOUNTS.map((amount) => <td key={amount}>{formatUsd(amount * tokenPrice, false)}</td>)}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="panel-body table-formula">
          <span>Token Price = Market Cap ÷ 1B</span>
          <span>Holdings Value = Tokens Owned × Token Price</span>
        </div>
      </section>

      <div className="warning-box" role="note">
        <div><strong>Fixed-supply reference only</strong><p>This table assumes exactly 1B circulating supply. It does not account for liquidity, slippage, taxes, locked supply, burns, or price impact.</p></div>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
export const metadata: Metadata = { title: "How It Works" }
export default function Page() { return <><div className="page-intro"><h1>How the math works</h1><p>Every output is a multiplication of ownership and target valuation. The hard part is choosing the correct supply basis.</p></div><article className="guide-prose">
  <section><h2>1. Choose the valuation basis</h2><p>If circulating supply is known, the simulator uses Market Cap. If only total supply is known, it uses FDV. When DEX Screener returns market cap and price but no supply field, estimated supply is derived and labelled—not presented as official.</p></section>
  <section><h2>2. Calculate ownership</h2><pre className="formula">Ownership % = Tokens Owned ÷ Supply × 100</pre><p>Ten million tokens out of one billion supply equals 1% ownership.</p></section>
  <section><h2>3. Apply a target</h2><pre className="formula">Target Price = Target Valuation ÷ Supply{`\n`}Target Position Value = Tokens Owned × Target Price{`\n`}Equivalent = Ownership % × Target Valuation</pre><p>At 1% ownership and a $1M target valuation, the estimated position is $10,000.</p></section>
  <section><h2>4. Measure ROI</h2><pre className="formula">Profit = Target Value − Cost Basis{`\n`}ROI = Profit ÷ Cost Basis × 100{`\n`}Multiple = Target Value ÷ Cost Basis</pre><p>Cost basis is optional. Without it, the simulator can show value but cannot honestly calculate profit or ROI.</p></section>
  <section><h2>What the estimate does not prove</h2><p>A market-cap target is not a promise that your full position can be sold at that value. Pool liquidity, price impact, transfer taxes, slippage, locked supply, and fast market movement may materially reduce realized proceeds.</p></section>
</article></> }

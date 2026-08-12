# MemeCap Simulator

MemeCap Simulator is a Next.js application that estimates a memecoin position at different market-cap or FDV targets. Live pair data comes from the official DEX Screener API through a cached server-side proxy.

## Product behavior

- Search by contract address or DEX Screener URL with optional all-chain auto-detection.
- Select the pair with the highest reported USD liquidity.
- Keep market-cap simulations separate from FDV simulations.
- Derive and label estimated supply only when DEX Screener supplies a valuation and USD price.
- Calculate ownership, target price, position value, profit, ROI, and multiple.
- Show default targets from $100K to $1B plus a custom target.
- Detect DEX Screener boosts and paid token orders through official endpoints.
- Save tokens, holdings, cost basis, labels, favorites, settings, and simulation history in LocalStorage.
- Generate a downloadable/shareable PNG simulation card in the browser.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

No API key or secret is required for the public DEX Screener API. Do not add private credentials to client-side environment variables.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## Routes

- `/` — simulator and token search
- `/token/[chain]/[address]` — shareable token dashboard
- `/calculator` — fixed 1B-supply holdings-value matrix
- `/dex-boost` — official Boost mechanics, pricing availability, and risk guide
- `/watchlist` — saved tokens
- `/history` — saved simulations
- `/guide` — calculation and risk guide
- `/settings` — local preferences
- `/api/dex/token?chain=...&address=...` — cached DEX Screener proxy

## Data semantics

DEX Screener exposes pair market data but not a direct official supply field in the pair response. The simulator follows these rules:

1. User-supplied circulating supply produces a **Market Cap Simulation**.
2. User-supplied total supply produces an **FDV Simulation**.
3. If no supply is supplied and market cap plus price are present, it derives **Estimated Supply = Market Cap ÷ Price**.
4. If market cap is absent but FDV plus price are present, it derives **Estimated Supply = FDV ÷ Price** and labels the result as FDV-based.
5. If neither path is possible, simulation stays unavailable until the user provides a supply.

Displayed position values are mathematical estimates, not guaranteed sale proceeds. Liquidity, slippage, taxes, price impact, circulating supply, and market conditions can materially reduce realizable value.

## DEX Screener integration

The application uses official endpoints documented at [DEX Screener API Reference](https://docs.dexscreener.com/api/reference):

- `GET /token-pairs/v1/{chainId}/{tokenAddress}` — token pools, 300 requests/minute
- `GET /latest/dex/search?q={address}` — all-chain address and pair lookup, 300 requests/minute
- `GET /token-boosts/latest/v1` — latest boosts, 60 requests/minute
- `GET /token-boosts/top/v1` — top active boosts, 60 requests/minute
- `GET /orders/v1/{chainId}/{tokenAddress}` — paid-order status, 60 requests/minute (current responses wrap records in an `orders` field; the proxy also tolerates the older array shape)

Server memory caching, Next.js fetch revalidation, request deduplication, abortable client requests, and configurable refresh intervals reduce API usage.

## DEX Screener service pricing

DEX Screener does not expose Boost pack prices through its public API. The `/dex-boost` page therefore presents a dated checkout snapshot verified directly in the official token-page Boost modal on August 13, 2026: 10 Boosts for $99 (12 hours), 30 for $249 (12 hours), 50 for $399 (12 hours), 100 for $899 (24 hours), and 500 for $3,999 (24 hours). The Golden Ticker requires at least 500 active Boosts. Re-check the official checkout before purchasing because pricing can change.

## Supplied crypto logos

All 35 user-provided crypto logo files are preserved under `public/crypto-logos/`. Simulator chain controls use the relevant Solana, Ethereum, Base, BNB Chain, Polygon, Avalanche, Optimism, and Sui assets. Arbitrum and PulseChain use local copies of DEX Screener's official public chain assets. Remaining token and ecosystem logos stay available in the repository for future features.

## Deployment to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Keep the framework preset as Next.js.
4. Use `npm run build` as the build command.
5. Deploy. No environment variables are required for the MVP.

For a custom domain, attach it from the Vercel project settings after the first successful production deployment.

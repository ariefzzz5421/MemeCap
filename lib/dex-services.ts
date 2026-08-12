import type { DexService } from "./types"

export const DEX_SERVICES_LAST_CHECKED = "2026-08-13"

export const DEX_SERVICES: DexService[] = [
  {
    name: "Token Boost",
    priceLabel: "Check Current Price",
    description: "Temporarily increases a token’s Trending Score. Price is not exposed by a public pricing API.",
    officialUrl: "https://dexscreener.com/boosting",
    lastChecked: DEX_SERVICES_LAST_CHECKED,
  },
  {
    name: "Enhanced Token Info",
    priceLabel: "Check Current Price",
    description: "Update the token page with project information, logo, website, and socials.",
    officialUrl: "https://marketplace.dexscreener.com/",
    lastChecked: DEX_SERVICES_LAST_CHECKED,
  },
  {
    name: "Token Advertising",
    priceLabel: "Minimum $100K direct deal",
    description: "Official direct-deal advertising. Marketplace campaign pricing may differ.",
    officialUrl: "https://docs.dexscreener.com/contact-us/advertise",
    lastChecked: DEX_SERVICES_LAST_CHECKED,
    note: "Official page checked on the date above; re-check before purchase.",
  },
  {
    name: "Community Takeover",
    priceLabel: "Check Current Price",
    description: "Official service status can be verified through DEX Screener’s marketplace and paid-order endpoint.",
    officialUrl: "https://marketplace.dexscreener.com/",
    lastChecked: DEX_SERVICES_LAST_CHECKED,
  },
]

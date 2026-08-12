import type { Metadata } from "next"
import { WatchlistPage } from "@/components/local-data-pages"
export const metadata: Metadata = { title: "Watchlist" }
export default function Page() { return <WatchlistPage /> }

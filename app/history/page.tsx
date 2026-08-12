import type { Metadata } from "next"
import { HistoryPage } from "@/components/local-data-pages"
export const metadata: Metadata = { title: "History" }
export default function Page() { return <HistoryPage /> }

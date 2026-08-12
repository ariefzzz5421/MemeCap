import type { Metadata } from "next"
import { SettingsForm } from "@/components/settings-form"
export const metadata: Metadata = { title: "Settings" }
export default function Page() { return <><div className="page-intro"><h1>Preferences</h1><p>Control refresh cadence, warning sensitivity, and number formatting on this browser.</p></div><SettingsForm /></> }

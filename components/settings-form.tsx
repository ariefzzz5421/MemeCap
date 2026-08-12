"use client"

import { useEffect, useState } from "react"
import { DEFAULT_SETTINGS, getSettings, setSettings } from "@/lib/storage"
import type { AppSettings } from "@/lib/types"

export function SettingsForm() {
  const [settings, update] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  useEffect(() => { const timer = window.setTimeout(() => update(getSettings()), 0); return () => window.clearTimeout(timer) }, [])

  function commit(next: AppSettings) {
    update(next)
    setSettings(next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return <div className="settings-grid terminal-panel panel-body">
    <div className="settings-row"><label htmlFor="refresh"><strong>Automatic refresh interval</strong><p className="muted">Market data refreshes only after this delay, never on every render.</p></label><select className="select" id="refresh" value={settings.refreshSeconds} onChange={(event) => commit({ ...settings, refreshSeconds: Number(event.target.value) as AppSettings["refreshSeconds"] })}><option value={30}>30 seconds</option><option value={60}>60 seconds</option><option value={120}>2 minutes</option></select></div>
    <div className="settings-row"><label htmlFor="liquidity"><strong>Liquidity warning threshold</strong><p className="muted">Warn when simulated value exceeds this share of pool liquidity.</p></label><select className="select" id="liquidity" value={settings.liquidityWarningRatio} onChange={(event) => commit({ ...settings, liquidityWarningRatio: Number(event.target.value) as AppSettings["liquidityWarningRatio"] })}><option value={0.1}>10% of liquidity</option><option value={0.25}>25% of liquidity</option><option value={0.5}>50% of liquidity</option></select></div>
    <label className="switch-row" htmlFor="compact"><span><strong>Compact number formatting</strong><p className="muted">Display $2.4M instead of $2,400,000.</p></span><input id="compact" type="checkbox" checked={settings.compactNumbers} onChange={(event) => commit({ ...settings, compactNumbers: event.target.checked })} /></label>
    <p className={saved ? "positive" : "muted"} aria-live="polite">{saved ? "Preferences saved on this device." : "Changes are stored locally."}</p>
  </div>
}

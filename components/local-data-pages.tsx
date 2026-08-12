"use client"

import Link from "next/link"
import { Bookmark, ExternalLink, Heart, Pencil, RotateCcw, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { formatToken, formatUsd, truncateAddress } from "@/lib/format"
import { getHistory, getSavedTokens, setSavedTokens } from "@/lib/storage"
import type { SavedToken, SimulationHistory } from "@/lib/types"

export function WatchlistPage() {
  const [items, setItems] = useState<SavedToken[]>([])
  useEffect(() => { const timer = window.setTimeout(() => setItems(getSavedTokens()), 0); return () => window.clearTimeout(timer) }, [])

  function commit(next: SavedToken[]) { setItems(next); setSavedTokens(next) }
  function matches(item: SavedToken, target: SavedToken) { return item.chainId === target.chainId && item.address === target.address }
  function remove(target: SavedToken) { commit(items.filter((item) => !matches(item, target))) }
  function favorite(target: SavedToken) { commit(items.map((item) => matches(item, target) ? { ...item, favorite: !item.favorite } : item)) }
  function edit(target: SavedToken) {
    const current = target
    const label = window.prompt("Edit saved-token label", current.label ?? current.symbol)
    if (label === null) return
    commit(items.map((item) => matches(item, target) ? { ...item, label: label.trim() || undefined } : item))
  }

  return <div className="list-page"><PageIntro title="Saved tokens" copy="Holdings, cost basis, labels, and favorites stored only in this browser." />{items.length === 0 ? <Empty icon={<Bookmark size={26} />} title="No saved tokens yet." copy="Find a token in the simulator and choose Save Token." action="Open Simulator" href="/" /> : <div className="terminal-panel">{[...items].sort((a, b) => Number(b.favorite) - Number(a.favorite)).map((item) => <div className="list-row" key={`${item.chainId}:${item.address}`}><div className="list-row-main"><button className="btn icon-btn btn-quiet" onClick={() => favorite(item)} aria-label={item.favorite ? "Remove favorite" : "Favorite token"}><Heart size={17} fill={item.favorite ? "currentColor" : "none"} /></button><div><strong>{item.label ?? item.name ?? item.symbol} / ${item.symbol}</strong><p className="muted tnum">{item.chainId} · {truncateAddress(item.address)} · {formatToken(item.tokenAmount)} tokens · cost {formatUsd(item.costBasis, false)}</p></div></div><div className="list-row-actions"><button className="btn" onClick={() => edit(item)}><Pencil size={15} /> Edit Label</button><Link className="btn" href={`/token/${item.chainId}/${item.address}`}>Open <ExternalLink size={15} /></Link><button className="btn btn-danger" onClick={() => remove(item)}><Trash2 size={15} /> Remove</button></div></div>)}</div>}</div>
}

export function HistoryPage() {
  const [items, setItems] = useState<SimulationHistory[]>([])
  useEffect(() => { const timer = window.setTimeout(() => setItems(getHistory()), 0); return () => window.clearTimeout(timer) }, [])
  function clear() { window.localStorage.removeItem("memecap.history.v1"); setItems([]) }
  return <div className="list-page"><PageIntro title="Simulation history" copy="The most recent 30 saved target scenarios on this device." />{items.length > 0 && <button className="btn btn-danger" onClick={clear}><Trash2 size={15} /> Clear History</button>}{items.length === 0 ? <Empty icon={<RotateCcw size={26} />} title="No simulations saved." copy="Choose a target row and save it to history." action="Open Simulator" href="/" /> : <div className="terminal-panel">{items.map((item) => <div className="list-row" key={item.id}><div><strong>${item.symbol} · Target {formatUsd(item.targetMarketCap)}</strong><p className="muted tnum">Target value {formatUsd(item.targetValue, false)} · {new Date(item.simulatedAt).toLocaleString("en-ID")}</p></div><Link className="btn" href={`/token/${item.chainId}/${item.address}`}>Run Again <ExternalLink size={15} /></Link></div>)}</div>}</div>
}

function PageIntro({ title, copy }: { title: string; copy: string }) { return <div className="page-intro"><h1>{title}</h1><p>{copy}</p></div> }
function Empty({ icon, title, copy, action, href }: { icon: React.ReactNode; title: string; copy: string; action: string; href: string }) { return <div className="empty-state">{icon}<div><h2>{title}</h2><p>{copy}</p></div><Link className="btn btn-primary" href={href}>{action}</Link></div> }

"use client"

import { useRef, useState } from "react"
import { Check, Copy, Download, Flame, Share2, TrendingUp, X } from "lucide-react"
import type { TradeOutcome } from "@/lib/calculations"
import { formatMultiple, formatUsd } from "@/lib/format"

export type ShareCardVariant = "simulation" | "profit" | "missed"

type Props = {
  symbol: string
  tokenAmount: number
  currentMarketCap: number | null
  targetMarketCap: number
  currentValue: number
  targetValue: number
  multiple: number | null
  roi: number | null
  costBasis: number
  currentPrice: number
  tradeOutcome: TradeOutcome
  initialVariant?: ShareCardVariant
  triggerLabel?: string
}

type CardRow = { label: string; value: string; tone?: "positive" | "negative" | "warning" }

type CardData = {
  eyebrow: string
  headline: string
  heroLabel: string
  heroValue: string
  tone: "accent" | "positive" | "negative" | "warning"
  rows: CardRow[]
  footnote: string
}

function signedPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  return `${value > 0 ? "+" : ""}${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`
}

function getCardData(props: Props, variant: ShareCardVariant): CardData {
  const outcome = props.tradeOutcome

  if (variant === "profit") {
    const exited = outcome.status === "exited"
    const profit = outcome.profit ?? 0
    return {
      eyebrow: exited ? "TRADE RECEIPT" : "LIVE POSITION",
      headline: exited ? "PROFIT LOCKED." : profit >= 0 ? "STILL HOLDING." : "POSITION CHECK.",
      heroLabel: exited ? "REALIZED PROFIT" : "UNREALIZED PNL",
      heroValue: outcome.profit === null ? "—" : formatUsd(outcome.profit, false),
      tone: profit >= 0 ? "positive" : "negative",
      rows: [
        { label: "COST BASIS", value: formatUsd(props.costBasis, false) },
        { label: exited ? "EXIT PROCEEDS" : "CURRENT VALUE", value: formatUsd(exited ? outcome.exitProceeds : outcome.currentValue, false) },
        { label: "ROI", value: signedPercent(outcome.roi), tone: profit >= 0 ? "positive" : "negative" },
        { label: exited ? "EXIT PRICE" : "CURRENT PRICE", value: formatUsd(exited ? outcome.exitPrice : props.currentPrice, false) },
      ],
      footnote: exited ? "Realized result based on the exit proceeds entered." : "Live paper result; profit is not realized until sold.",
    }
  }

  if (variant === "missed") {
    const missed = outcome.missedGain ?? 0
    const exitAdvantage = Math.max((outcome.exitProceeds ?? 0) - outcome.currentValue, 0)
    const ahead = exitAdvantage > 0
    return {
      eyebrow: "POST-TRADE CHECK",
      headline: missed > 0 ? "SOLD. THEN IT RAN." : ahead ? "EXIT AGED WELL." : "NO MISSED GAIN.",
      heroLabel: missed > 0 ? "MISSED GAIN" : ahead ? "EXIT ADVANTAGE" : "MISSED GAIN",
      heroValue: formatUsd(missed > 0 ? missed : exitAdvantage, false),
      tone: missed > 0 ? "warning" : "positive",
      rows: [
        { label: "EXIT PROCEEDS", value: formatUsd(outcome.exitProceeds, false) },
        { label: "WORTH TODAY", value: formatUsd(outcome.currentValue, false) },
        { label: "MOVE AFTER EXIT", value: signedPercent(outcome.missedGainPercent), tone: missed > 0 ? "warning" : "positive" },
        { label: "EXIT PRICE", value: formatUsd(outcome.exitPrice, false) },
      ],
      footnote: "Paper comparison at the current price; liquidity, taxes and slippage are not included.",
    }
  }

  return {
    eyebrow: "MARKET CAP SIMULATION",
    headline: "SIZE THE UPSIDE.",
    heroLabel: "TARGET POSITION",
    heroValue: formatUsd(props.targetValue, false),
    tone: "accent",
    rows: [
      { label: "CURRENT MC", value: formatUsd(props.currentMarketCap) },
      { label: "TARGET MC", value: formatUsd(props.targetMarketCap) },
      { label: "CURRENT VALUE", value: formatUsd(props.currentValue, false) },
      { label: "POTENTIAL", value: formatMultiple(props.multiple), tone: "positive" },
    ],
    footnote: `Target ROI ${props.roi === null ? "—" : signedPercent(props.roi)}; simulation only, not financial advice.`,
  }
}

export function ShareDialog(props: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [variant, setVariant] = useState<ShareCardVariant>(props.initialVariant ?? "simulation")
  const [action, setAction] = useState<"idle" | "working" | "copied" | "error">("idle")
  const canShowProfit = props.tradeOutcome.profit !== null
  const canShowMissed = props.tradeOutcome.status === "exited" && props.tradeOutcome.exitProceeds !== null
  const card = getCardData(props, variant)

  function openDialog() {
    const requested = props.initialVariant ?? "simulation"
    setVariant(requested === "missed" && !canShowMissed ? canShowProfit ? "profit" : "simulation" : requested)
    setAction("idle")
    dialogRef.current?.showModal()
  }

  async function buildCanvas() {
    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas is unavailable")

    const styles = getComputedStyle(document.documentElement)
    const color = (token: string) => styles.getPropertyValue(token).trim()
    const toneColor = card.tone === "warning" ? color("--color-warning") : card.tone === "negative" ? color("--color-negative") : card.tone === "positive" ? color("--color-positive") : color("--color-accent")

    ctx.fillStyle = color("--color-paper")
    ctx.fillRect(0, 0, 1200, 630)
    ctx.fillStyle = color("--color-paper-2")
    ctx.fillRect(44, 44, 1112, 542)
    ctx.fillStyle = toneColor
    ctx.fillRect(44, 44, 1112, 8)
    ctx.strokeStyle = color("--color-rule-strong")
    ctx.lineWidth = 2
    ctx.strokeRect(44, 44, 1112, 542)

    if (variant === "missed") {
      ctx.save()
      ctx.globalAlpha = 0.07
      ctx.fillStyle = toneColor
      ctx.font = "900 210px sans-serif"
      ctx.fillText("FOMO", 610, 280)
      ctx.restore()
    }

    ctx.fillStyle = toneColor
    ctx.font = "700 22px monospace"
    ctx.fillText(card.eyebrow, 82, 104)
    ctx.fillStyle = color("--color-muted")
    ctx.textAlign = "right"
    ctx.fillText(`$${props.symbol}`, 1118, 104)
    ctx.textAlign = "left"

    ctx.fillStyle = color("--color-ink")
    ctx.font = "800 50px sans-serif"
    ctx.fillText(card.headline, 82, 174)
    ctx.fillStyle = color("--color-neutral")
    ctx.font = "18px monospace"
    ctx.fillText(card.heroLabel, 82, 222)
    ctx.fillStyle = toneColor
    ctx.font = "800 76px monospace"
    ctx.fillText(card.heroValue, 82, 300)

    card.rows.forEach((row, index) => {
      const col = index % 4
      const x = 82 + col * 260
      ctx.fillStyle = color("--color-neutral")
      ctx.font = "16px monospace"
      ctx.fillText(row.label, x, 392)
      ctx.fillStyle = row.tone === "warning" ? color("--color-warning") : row.tone === "negative" ? color("--color-negative") : row.tone === "positive" ? color("--color-positive") : color("--color-ink")
      ctx.font = "700 27px monospace"
      ctx.fillText(row.value, x, 434)
    })

    ctx.fillStyle = color("--color-muted")
    ctx.font = "16px sans-serif"
    ctx.fillText(card.footnote, 82, 520)
    ctx.font = "14px sans-serif"
    ctx.fillText("Simulation and live comparison only — not financial advice.", 82, 550)
    ctx.fillStyle = toneColor
    ctx.textAlign = "right"
    ctx.font = "700 18px monospace"
    ctx.fillText("MEMECAP", 1118, 550)
    return canvas
  }

  async function withAction(task: () => Promise<void>, success: "idle" | "copied" = "idle") {
    setAction("working")
    try {
      await task()
      setAction(success)
      if (success !== "idle") window.setTimeout(() => setAction("idle"), 2500)
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") {
        setAction("idle")
        return
      }
      setAction("error")
    }
  }

  async function downloadCanvas() {
    const canvas = await buildCanvas()
    const link = document.createElement("a")
    link.download = `${props.symbol.toLowerCase()}-memecap-${variant}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  async function copyImage() {
    await withAction(async () => {
      const canvas = await buildCanvas()
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob || !navigator.clipboard || typeof ClipboardItem === "undefined") {
        await downloadCanvas()
        return
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
    }, "copied")
  }

  async function share() {
    await withAction(async () => {
      const canvas = await buildCanvas()
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (!blob) throw new Error("Could not create the image")
      const file = new File([blob], `${props.symbol}-memecap-${variant}.png`, { type: "image/png" })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `$${props.symbol} ${card.headline}`, files: [file] })
      } else {
        await downloadCanvas()
      }
    })
  }

  return (
    <>
      <button className={`btn ${props.initialVariant ? "btn-primary" : ""}`} onClick={openDialog} type="button"><Share2 size={16} /> {props.triggerLabel ?? "Share Simulation"}</button>
      <dialog className="dialog share-dialog" ref={dialogRef} onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}>
        <div className="dialog-head"><div><strong>Share Card</strong><span className="muted">Choose the story, then export it.</span></div><button className="btn icon-btn btn-quiet" onClick={() => dialogRef.current?.close()} aria-label="Close share dialog"><X size={18} /></button></div>
        <div className="dialog-body">
          <div className="share-filter" role="group" aria-label="Filter share card type">
            <button aria-pressed={variant === "simulation"} className="share-filter-button" data-active={variant === "simulation"} onClick={() => setVariant("simulation")} type="button"><TrendingUp size={15} /> Simulation</button>
            <button aria-pressed={variant === "profit"} className="share-filter-button" data-active={variant === "profit"} disabled={!canShowProfit} onClick={() => setVariant("profit")} type="button"><Check size={15} /> Profit</button>
            <button aria-pressed={variant === "missed"} className="share-filter-button" data-active={variant === "missed"} disabled={!canShowMissed} onClick={() => setVariant("missed")} type="button"><Flame size={15} /> Missed</button>
          </div>

          <div className="share-preview" data-card={variant} data-tone={card.tone}>
            <div className="share-card-top"><div><span className="share-card-eyebrow">{card.eyebrow}</span><strong>{card.headline}</strong></div><span className="share-card-symbol">${props.symbol}</span></div>
            <div className="share-card-hero tnum"><span>{card.heroLabel}</span><strong>{card.heroValue}</strong></div>
            <div className="share-grid tnum">{card.rows.map((row) => <div key={row.label}><span className="metric-label">{row.label}</span><span className={`metric-value ${row.tone ?? ""}`}>{row.value}</span></div>)}</div>
            <div className="share-card-foot"><p>{card.footnote}</p><span>MEMECAP</span></div>
          </div>

          <p className="share-status muted" aria-live="polite">{action === "working" ? "Preparing image…" : action === "copied" ? "Image copied to clipboard." : action === "error" ? "Could not export this image. Try Download PNG." : "Simulation and live comparison only — not financial advice."}</p>
          <div className="share-actions">
            <button className="btn btn-primary" data-state={action} disabled={action === "working"} onClick={() => void withAction(downloadCanvas)} type="button"><Download size={16} /> Download PNG</button>
            <button className="btn" data-state={action} disabled={action === "working"} onClick={() => void copyImage()} type="button">{action === "copied" ? <Check size={16} /> : <Copy size={16} />} {action === "copied" ? "Copied" : "Copy Image"}</button>
            <button className="btn" data-state={action} disabled={action === "working"} onClick={() => void share()} type="button"><Share2 size={16} /> Share</button>
          </div>
        </div>
      </dialog>
    </>
  )
}

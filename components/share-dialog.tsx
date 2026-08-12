"use client"

import { useRef, useState } from "react"
import { Check, Copy, Download, Share2, X } from "lucide-react"
import { formatMultiple, formatToken, formatUsd } from "@/lib/format"

type Props = {
  symbol: string
  tokenAmount: number
  currentMarketCap: number | null
  targetMarketCap: number
  currentValue: number
  targetValue: number
  multiple: number | null
  roi: number | null
}

export function ShareDialog(props: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [state, setState] = useState<"idle" | "copied">("idle")

  async function buildCanvas() {
    const canvas = document.createElement("canvas")
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas is unavailable")

    const styles = getComputedStyle(document.documentElement)
    const color = (token: string) => styles.getPropertyValue(token).trim()

    ctx.fillStyle = color("--color-paper")
    ctx.fillRect(0, 0, 1200, 630)
    ctx.strokeStyle = color("--color-rule-strong")
    ctx.lineWidth = 2
    ctx.strokeRect(44, 44, 1112, 542)
    ctx.fillStyle = color("--color-accent")
    ctx.font = "700 38px monospace"
    ctx.fillText(`$${props.symbol}`, 82, 112)
    ctx.fillStyle = color("--color-ink")
    ctx.font = "700 62px sans-serif"
    ctx.fillText("MY POSITION", 82, 200)

    const rows = [
      ["TOKENS OWNED", formatToken(props.tokenAmount)],
      ["CURRENT MC", formatUsd(props.currentMarketCap)],
      ["TARGET MC", formatUsd(props.targetMarketCap)],
      ["CURRENT VALUE", formatUsd(props.currentValue)],
      ["TARGET VALUE", formatUsd(props.targetValue)],
      ["POTENTIAL", formatMultiple(props.multiple)],
    ]
    rows.forEach(([label, value], index) => {
      const col = index % 3
      const row = Math.floor(index / 3)
      const x = 82 + col * 350
      const y = 292 + row * 130
      ctx.fillStyle = color("--color-muted")
      ctx.font = "18px monospace"
      ctx.fillText(label, x, y)
      ctx.fillStyle = color("--color-ink")
      ctx.font = "700 32px monospace"
      ctx.fillText(value, x, y + 48)
    })
    ctx.fillStyle = color("--color-muted")
    ctx.font = "16px sans-serif"
    ctx.fillText("Simulation only — not financial advice.", 82, 552)
    ctx.fillStyle = color("--color-accent")
    ctx.font = "700 18px monospace"
    ctx.fillText("MEMECAP", 1010, 552)
    return canvas
  }

  async function download() {
    const canvas = await buildCanvas()
    const link = document.createElement("a")
    link.download = `${props.symbol.toLowerCase()}-memecap-simulation.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  async function copyImage() {
    const canvas = await buildCanvas()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
    if (!blob || !navigator.clipboard || typeof ClipboardItem === "undefined") return download()
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
    setState("copied")
    window.setTimeout(() => setState("idle"), 2500)
  }

  async function share() {
    const canvas = await buildCanvas()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
    if (!blob) return
    const file = new File([blob], `${props.symbol}-memecap.png`, { type: "image/png" })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: `$${props.symbol} MemeCap Simulation`, files: [file] })
    } else {
      await download()
    }
  }

  return (
    <>
      <button className="btn" onClick={() => dialogRef.current?.showModal()} type="button"><Share2 size={16} /> Share Simulation</button>
      <dialog className="dialog" ref={dialogRef} onClick={(event) => event.target === dialogRef.current && dialogRef.current?.close()}>
        <div className="dialog-head"><strong>Share Simulation</strong><button className="btn icon-btn btn-quiet" onClick={() => dialogRef.current?.close()} aria-label="Close share dialog"><X size={18} /></button></div>
        <div className="dialog-body">
          <div className="share-preview">
            <div><strong>${props.symbol}</strong><p className="muted">My position · {formatToken(props.tokenAmount)} tokens</p></div>
            <div className="share-grid tnum">
              <div><span className="metric-label">Current MC</span><span className="metric-value">{formatUsd(props.currentMarketCap)}</span></div>
              <div><span className="metric-label">Target MC</span><span className="metric-value">{formatUsd(props.targetMarketCap)}</span></div>
              <div><span className="metric-label">Current value</span><span className="metric-value">{formatUsd(props.currentValue)}</span></div>
              <div><span className="metric-label">Target value</span><span className="metric-value positive">{formatUsd(props.targetValue)}</span></div>
            </div>
            <p className="muted">Potential {formatMultiple(props.multiple)} · ROI {props.roi === null ? "—" : `${props.roi.toLocaleString("en-US", { maximumFractionDigits: 0 })}%`} · Simulation only — not financial advice.</p>
          </div>
          <div className="share-actions">
            <button className="btn btn-primary" onClick={download} type="button"><Download size={16} /> Download PNG</button>
            <button className="btn" onClick={copyImage} type="button">{state === "copied" ? <Check size={16} /> : <Copy size={16} />} {state === "copied" ? "Copied" : "Copy Image"}</button>
            <button className="btn" onClick={share} type="button"><Share2 size={16} /> Share</button>
          </div>
        </div>
      </dialog>
    </>
  )
}

"use client"

import { Check, ChevronDown } from "lucide-react"
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react"
import { CHAIN_OPTIONS, getChainOption } from "@/lib/chains"
import { ChainIcon } from "./chain-icon"

type Props = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ChainSelect({ value, onChange, disabled = false }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listboxId = useId()
  const selected = getChainOption(value)

  useEffect(() => {
    if (!open) return
    const selectedIndex = Math.max(0, CHAIN_OPTIONS.findIndex((option) => option.id === value))
    optionRefs.current[selectedIndex]?.focus()

    function dismiss(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("mousedown", dismiss)
    return () => document.removeEventListener("mousedown", dismiss)
  }, [open, value])

  function select(nextValue: string) {
    onChange(nextValue)
    setOpen(false)
    rootRef.current?.querySelector<HTMLButtonElement>(".chain-select-trigger")?.focus()
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      rootRef.current?.querySelector<HTMLButtonElement>(".chain-select-trigger")?.focus()
      return
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault()
      const last = CHAIN_OPTIONS.length - 1
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? last : event.key === "ArrowDown" ? (index + 1) % CHAIN_OPTIONS.length : (index - 1 + CHAIN_OPTIONS.length) % CHAIN_OPTIONS.length
      optionRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="chain-picker" ref={rootRef}>
      <button aria-controls={listboxId} aria-expanded={open} aria-haspopup="listbox" className="chain-select-trigger" disabled={disabled} id="chain" onClick={() => setOpen((current) => !current)} onKeyDown={handleTriggerKeyDown} type="button">
        <ChainIcon chainId={selected.id} size={27} />
        <span className="chain-select-copy"><strong>{selected.id === "all" ? "All Chains" : selected.label}</strong><small>{selected.id === "all" ? "Auto-detect network" : selected.shortLabel}</small></span>
        <ChevronDown aria-hidden="true" className="chain-select-chevron" size={17} />
      </button>

      {open && (
        <div aria-label="Choose a chain" className="chain-select-menu" id={listboxId} role="listbox">
          {CHAIN_OPTIONS.map((option, index) => (
            <button aria-selected={option.id === value} className="chain-select-option" key={option.id} onClick={() => select(option.id)} onKeyDown={(event) => handleOptionKeyDown(event, index)} ref={(node) => { optionRefs.current[index] = node }} role="option" tabIndex={option.id === value ? 0 : -1} type="button">
              <ChainIcon chainId={option.id} size={25} />
              <span><strong>{option.id === "all" ? "All Chains" : option.label}</strong><small>{option.id === "all" ? "Automatic detection" : option.shortLabel}</small></span>
              {option.id === value && <Check aria-hidden="true" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

import Image from "next/image"
import { Layers3 } from "lucide-react"
import { getChainOption } from "@/lib/chains"

export function ChainIcon({ chainId, size = 24 }: { chainId: string; size?: number }) {
  const chain = getChainOption(chainId)
  return (
    <span className="chain-icon" style={{ width: size, height: size }} title={chain.label}>
      {chain.logo ? (
        <Image alt={`${chain.label} logo`} height={size} src={chain.logo} width={size} />
      ) : chain.id === "all" ? (
        <Layers3 aria-label="All chains" size={Math.max(14, size - 6)} />
      ) : (
        <span aria-label={`${chain.label} fallback icon`}>{chain.shortLabel.slice(0, 2)}</span>
      )}
    </span>
  )
}

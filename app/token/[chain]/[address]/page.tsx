import type { Metadata } from "next"
import { Simulator } from "@/components/simulator"

type Props = { params: Promise<{ chain: string; address: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chain, address } = await params
  return { title: `Token ${address.slice(0, 6)}… on ${chain}` }
}

export default async function TokenPage({ params }: Props) {
  const { chain, address } = await params
  return <Simulator initialChain={chain} initialAddress={address} />
}

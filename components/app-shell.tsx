"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, Calculator, Clock3, Gauge, HelpCircle, Rocket, Settings } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Simulator", shortLabel: "Sim", icon: Gauge },
  { href: "/calculator", label: "Calculator", shortLabel: "Calc", icon: Calculator },
  { href: "/dex-boost", label: "DEX Boost", shortLabel: "Boost", icon: Rocket },
  { href: "/watchlist", label: "Watchlist", shortLabel: "Saved", icon: Bookmark },
  { href: "/history", label: "History", shortLabel: "History", icon: Clock3 },
  { href: "/guide", label: "Guide", shortLabel: "Guide", icon: HelpCircle },
  { href: "/settings", label: "Settings", shortLabel: "Prefs", icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const active = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/token/") : pathname.startsWith(href))

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <Link className="brand" href="/" aria-label="MemeCap home">
          <span className="brand-mark"><Image alt="" aria-hidden="true" className="brand-logo" height={36} priority src="/brand/memecap-logo.png" width={36} /></span>
          <span>MemeCap<small>position simulator</small></span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link className="nav-link" data-active={active(href)} href={href} key={href}>
              <Icon aria-hidden="true" size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="rail-foot">
          <p>DEX Screener data</p>
          <p>Simulation only · NFA</p>
        </div>
      </aside>

      <main className="page-shell">
        <header className="topbar">
          <Link className="brand" href="/" aria-label="MemeCap home">
            <span className="brand-mark"><Image alt="" aria-hidden="true" className="brand-logo" height={36} priority src="/brand/memecap-logo.png" width={36} /></span>
            <span className="desktop-only">MemeCap</span>
          </Link>
          <div className="topbar-status"><span className="status-dot" aria-hidden="true" /> DEX DATA READY</div>
        </header>
        {children}
        <footer className="footer-line">MemeCap Simulator · Estimated values are not guaranteed realizable profit · Data by DEX Screener</footer>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ href, label, shortLabel, icon: Icon }) => (
          <Link className="bottom-link" data-active={active(href)} href={href} key={href}>
            <Icon aria-hidden="true" size={17} /><span>{shortLabel}</span><span className="sr-only">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

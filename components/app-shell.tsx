"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, Calculator, Clock3, HelpCircle, Settings } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Simulator", icon: Calculator },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/guide", label: "Guide", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const active = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/token/") : pathname.startsWith(href))

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <Link className="brand" href="/" aria-label="MemeCap home">
          <span className="brand-mark">M</span>
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
            <span className="brand-mark">M</span>
            <span className="desktop-only">MemeCap</span>
          </Link>
          <div className="topbar-status"><span className="status-dot" aria-hidden="true" /> DEX DATA READY</div>
        </header>
        {children}
        <footer className="footer-line">MemeCap Simulator · Estimated values are not guaranteed realizable profit · Data by DEX Screener</footer>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link className="bottom-link" data-active={active(href)} href={href} key={href}>
            <Icon aria-hidden="true" size={18} /><span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLayoutEffect } from "react"
import { Bookmark, Calculator, Clock3, Gauge, HelpCircle, Moon, Rocket, Settings, Sun } from "lucide-react"

const NAV_ITEMS = [
  { href: "/", label: "Simulator", shortLabel: "Sim", icon: Gauge },
  { href: "/calculator", label: "Calculator", shortLabel: "Calc", icon: Calculator },
  { href: "/dex-boost", label: "DEX Boost", shortLabel: "Boost", icon: Rocket },
  { href: "/watchlist", label: "Watchlist", shortLabel: "Saved", icon: Bookmark },
  { href: "/history", label: "History", shortLabel: "History", icon: Clock3 },
  { href: "/guide", label: "Guide", shortLabel: "Guide", icon: HelpCircle },
  { href: "/settings", label: "Settings", shortLabel: "Prefs", icon: Settings },
]

const THEME_STORAGE_KEY = "memecap-theme"

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  useLayoutEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    document.documentElement.dataset.theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : preferredTheme
  }, [])

  function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light"
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  return (
    <button
      aria-label="Switch between light and dark mode"
      className={`theme-toggle${compact ? " theme-toggle-compact" : ""}`}
      onClick={toggleTheme}
      title="Switch color mode"
      type="button"
    >
      <Sun aria-hidden="true" className="theme-to-light" size={18} />
      <Moon aria-hidden="true" className="theme-to-dark" size={18} />
      <span className="theme-label theme-to-light">Light mode</span>
      <span className="theme-label theme-to-dark">Dark mode</span>
    </button>
  )
}

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
        <div className="rail-foot"><ThemeToggle /></div>
      </aside>

      <main className="page-shell">
        <header className="topbar">
          <Link className="brand" href="/" aria-label="MemeCap home">
            <span className="brand-mark"><Image alt="" aria-hidden="true" className="brand-logo" height={36} priority src="/brand/memecap-logo.png" width={36} /></span>
            <span className="desktop-only">MemeCap</span>
          </Link>
          <div className="topbar-controls">
            <div className="topbar-status"><span className="status-dot" aria-hidden="true" /> <span>DEX DATA READY</span></div>
            <div className="mobile-theme-toggle"><ThemeToggle compact /></div>
          </div>
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

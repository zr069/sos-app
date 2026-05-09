'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isMap = pathname === '/map'

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 ${isMap ? '' : 'border-b border-white/[0.06]'}`}>
        <div className="backdrop-blur-xl bg-[var(--bg-primary)]/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex h-14 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent-teal)] flex items-center justify-center">
                  <span className="text-[var(--bg-primary)] text-xs font-black">H</span>
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">HantaMap</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {[
                  { href: '/map', label: 'Live Map' },
                  { href: '/updates', label: 'Updates' },
                  { href: '/preparedness', label: 'Readiness' },
                  { href: '/about', label: 'About' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-medium px-3 py-1.5 rounded-[var(--radius-pill)] transition-colors ${
                      pathname === link.href
                        ? 'bg-white/10 text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-medium px-3 py-1.5 rounded-[var(--radius-pill)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors hidden sm:block"
                >
                  Sign in
                </Link>
                {pathname !== '/' && pathname !== '/map' && (
                  <Link
                    href="/map"
                    className="text-xs font-semibold px-4 py-2 rounded-full bg-[var(--accent-teal)] text-[var(--bg-primary)] hover:brightness-110 transition-all hidden sm:block"
                  >
                    Open Map
                  </Link>
                )}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 text-[var(--text-secondary)]"
                  aria-label="Menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {menuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <nav className="absolute top-14 left-0 right-0 bg-[var(--bg-panel)] border-b border-white/[0.06] p-4 flex flex-col gap-1">
            {[
              { href: '/map', label: 'Live Map' },
              { href: '/updates', label: 'Updates' },
              { href: '/preparedness', label: 'Readiness' },
              { href: '/about', label: 'About' },
              { href: '/login', label: 'Sign in' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2 px-3 rounded-[var(--radius-sm)] hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

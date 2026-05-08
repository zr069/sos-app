'use client'
import { useState } from 'react'
import Link from 'next/link'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/map', label: 'Map' },
    { href: '/updates', label: 'Updates' },
    { href: '/preparedness', label: 'Preparedness' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-900 tracking-tight">
            HantaMap.ai
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium text-slate-900 border border-slate-300 px-4 py-1.5 rounded hover:bg-slate-50 transition-colors"
            >
              Login
            </Link>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-slate-100 pt-4 flex flex-col gap-3">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-600 hover:text-slate-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm font-medium text-slate-900 border border-slate-300 px-4 py-1.5 rounded text-center hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

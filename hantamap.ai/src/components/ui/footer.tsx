import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded bg-[var(--accent-teal)] flex items-center justify-center">
                <span className="text-[var(--bg-primary)] text-[8px] font-black">H</span>
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">HantaMap.ai</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-md leading-relaxed">
              Real-time Hantavirus signal tracking with verified sources. HantaMap does not provide medical diagnosis or emergency medical advice.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { href: '/about', label: 'About' },
              { href: '/about#privacy', label: 'Privacy' },
              { href: 'mailto:corrections@hantamap.ai', label: 'Corrections' },
              { href: 'mailto:press@hantamap.ai', label: 'Press' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/app', label: 'Dashboard', exact: true },
  { href: '/app/regions', label: 'Regions' },
  { href: '/app/travel', label: 'Travel' },
  { href: '/app/preparedness', label: 'Checklist' },
  { href: '/app/advisor', label: 'Advisor' },
  { href: '/app/alerts', label: 'Alerts' },
  { href: '/app/profile', label: 'Profile' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/app" className="text-lg font-bold text-slate-900 tracking-tight">
              HantaMap.ai
            </Link>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-700">
              Public site
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        <nav className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-medium px-3 py-2 rounded whitespace-nowrap transition-colors ${
                isActive(item)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}

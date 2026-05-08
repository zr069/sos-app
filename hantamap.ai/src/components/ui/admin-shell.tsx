'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/outbreaks', label: 'Outbreaks' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/updates', label: 'Updates' },
  { href: '/admin/sources', label: 'Sources' },
  { href: '/admin/locations', label: 'Locations' },
  { href: '/admin/products', label: 'Products' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-lg font-bold text-white tracking-tight">
                HantaMap.ai
              </Link>
              <span className="text-xs text-slate-400 border border-slate-600 px-2 py-0.5 rounded">Admin</span>
            </div>
            <Link href="/app" className="text-xs text-slate-400 hover:text-white">
              Back to app
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

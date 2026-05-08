import { AppShell } from '@/components/ui/app-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

import { AdminShell } from '@/components/ui/admin-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}

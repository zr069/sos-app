import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/ui/metric-card'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [outbreaks, reports, updates, sources] = await Promise.all([
    supabase.from('outbreaks').select('id', { count: 'exact' }),
    supabase.from('reports').select('id', { count: 'exact' }),
    supabase.from('updates').select('id', { count: 'exact' }),
    supabase.from('sources').select('id', { count: 'exact' }),
  ])

  const publishedOutbreaks = await supabase
    .from('outbreaks')
    .select('id', { count: 'exact' })
    .eq('published', true)

  const unpublishedReports = await supabase
    .from('reports')
    .select('id', { count: 'exact' })
    .eq('published', false)

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Admin dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Outbreaks" value={outbreaks.count || 0} subtitle={`${publishedOutbreaks.count || 0} published`} />
        <MetricCard label="Reports" value={reports.count || 0} subtitle={`${unpublishedReports.count || 0} unpublished`} />
        <MetricCard label="Updates" value={updates.count || 0} />
        <MetricCard label="Sources" value={sources.count || 0} />
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/admin/outbreaks" className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
          <p className="text-sm font-medium text-slate-900">Manage outbreaks</p>
          <p className="text-xs text-slate-500 mt-1">Create, edit and publish outbreak records</p>
        </Link>
        <Link href="/admin/reports" className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
          <p className="text-sm font-medium text-slate-900">Manage reports</p>
          <p className="text-xs text-slate-500 mt-1">Add location reports with sources</p>
        </Link>
        <Link href="/admin/updates" className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
          <p className="text-sm font-medium text-slate-900">Manage updates</p>
          <p className="text-xs text-slate-500 mt-1">Publish verified outbreak updates</p>
        </Link>
      </div>
    </div>
  )
}

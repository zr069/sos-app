import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { VerificationBadge } from '@/components/ui/verification-badge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Reports' }

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: reports } = await supabase
    .from('reports')
    .select('*, outbreak:outbreaks(name), location:locations(country, region, city)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <Link href="/admin/reports/new" className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800">
          Create report
        </Link>
      </div>

      {reports && reports.length > 0 ? (
        <div className="border border-slate-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Outbreak</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirmed</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Published</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">
                      {[r.location?.city, r.location?.region, r.location?.country].filter(Boolean).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.outbreak?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-slate-700 tabular-nums">{r.confirmed_cases !== null ? r.confirmed_cases : 'Unknown'}</td>
                    <td className="px-4 py-3"><VerificationBadge status={r.verification_status} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${r.published ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {r.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <Link href={`/admin/reports/${r.id}`} className="text-xs text-slate-500 hover:text-slate-900">Edit</Link>
                      <Link href={`/admin/reports/${r.id}/preview`} className="text-xs text-slate-400 hover:text-slate-700">Preview</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded p-8 text-center">
          <p className="text-sm text-slate-500">No reports created yet.</p>
        </div>
      )}
    </div>
  )
}

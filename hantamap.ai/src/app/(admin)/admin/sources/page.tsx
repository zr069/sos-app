import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Sources' }

export default async function AdminSourcesPage() {
  const supabase = await createClient()
  const { data: sources } = await supabase
    .from('sources')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Sources</h1>
        <Link href="/admin/sources/new" className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800">
          Add source
        </Link>
      </div>

      {sources && sources.length > 0 ? (
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Publisher</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.title}</td>
                  <td className="px-4 py-3 text-slate-500">{s.publisher}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs uppercase">{s.source_type}</td>
                  <td className="px-4 py-3">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-700 underline truncate block max-w-xs">
                      {s.url}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded p-8 text-center">
          <p className="text-sm text-slate-500">No sources added yet.</p>
        </div>
      )}
    </div>
  )
}

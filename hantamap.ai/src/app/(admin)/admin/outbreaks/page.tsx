import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Outbreaks' }

export default async function AdminOutbreaksPage() {
  const supabase = await createClient()
  const { data: outbreaks } = await supabase
    .from('outbreaks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Outbreaks</h1>
        <Link
          href="/admin/outbreaks/new"
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800"
        >
          Create outbreak
        </Link>
      </div>

      {outbreaks && outbreaks.length > 0 ? (
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Published</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outbreaks.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{o.name}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{o.slug}</td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{o.status}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${o.published ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {o.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/outbreaks/${o.id}`} className="text-xs text-slate-500 hover:text-slate-900">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded p-8 text-center">
          <p className="text-sm text-slate-500">No outbreaks created yet.</p>
        </div>
      )}
    </div>
  )
}

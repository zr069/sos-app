'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ReportFormProps {
  report?: any
  outbreaks: { id: string; name: string }[]
  locations: { id: string; country: string; region: string | null; city: string | null }[]
  sources: { id: string; title: string; publisher: string }[]
  linkedSourceIds?: string[]
}

export function ReportForm({ report, outbreaks, locations, sources, linkedSourceIds = [] }: ReportFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>(linkedSourceIds)
  const router = useRouter()
  const isEdit = !!report

  function toggleSource(id: string) {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const published = form.get('published') === 'on'

    // Require at least one source for publishing
    if (published && selectedSources.length === 0) {
      setError('At least one source is required to publish a report.')
      setSaving(false)
      return
    }

    const supabase = createClient()

    const data: any = {
      outbreak_id: form.get('outbreak_id') as string,
      location_id: form.get('location_id') as string,
      status: form.get('status') as string,
      confirmed_cases: form.get('confirmed_cases') ? parseInt(form.get('confirmed_cases') as string) : null,
      probable_cases: form.get('probable_cases') ? parseInt(form.get('probable_cases') as string) : null,
      suspected_cases: form.get('suspected_cases') ? parseInt(form.get('suspected_cases') as string) : null,
      deaths: form.get('deaths') ? parseInt(form.get('deaths') as string) : null,
      recovered: form.get('recovered') ? parseInt(form.get('recovered') as string) : null,
      report_date: form.get('report_date') || null,
      verification_status: form.get('verification_status') as string,
      editor_note: form.get('editor_note') as string || null,
      published,
      updated_at: new Date().toISOString(),
    }

    let reportId = report?.id

    if (isEdit) {
      const result = await supabase.from('reports').update(data).eq('id', report.id)
      if (result.error) { setError(result.error.message); setSaving(false); return }
    } else {
      const result = await supabase.from('reports').insert(data).select('id').single()
      if (result.error) { setError(result.error.message); setSaving(false); return }
      reportId = result.data.id
    }

    // Update source links
    if (reportId) {
      await supabase.from('report_sources').delete().eq('report_id', reportId)
      if (selectedSources.length > 0) {
        await supabase.from('report_sources').insert(
          selectedSources.map(sid => ({ report_id: reportId, source_id: sid }))
        )
      }
    }

    router.push('/admin/reports')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Outbreak</label>
          <select name="outbreak_id" required defaultValue={report?.outbreak_id || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
            <option value="">Select outbreak</option>
            {outbreaks.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
          <select name="location_id" required defaultValue={report?.location_id || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
            <option value="">Select location</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{[l.city, l.region, l.country].filter(Boolean).join(', ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
          <select name="status" defaultValue={report?.status || 'suspected'} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
            <option value="confirmed">Confirmed</option>
            <option value="probable">Probable</option>
            <option value="suspected">Suspected</option>
            <option value="disputed">Disputed</option>
            <option value="retracted">Retracted</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Verification status</label>
          <select name="verification_status" defaultValue={report?.verification_status || 'suspected'} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
            <option value="verified">Verified</option>
            <option value="probable">Probable</option>
            <option value="suspected">Suspected</option>
            <option value="disputed">Disputed</option>
            <option value="retracted">Retracted</option>
            <option value="awaiting_source">Awaiting source</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Confirmed</label>
          <input name="confirmed_cases" type="number" min="0" defaultValue={report?.confirmed_cases ?? ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="Unknown" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Probable</label>
          <input name="probable_cases" type="number" min="0" defaultValue={report?.probable_cases ?? ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="Unknown" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Suspected</label>
          <input name="suspected_cases" type="number" min="0" defaultValue={report?.suspected_cases ?? ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="Unknown" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Deaths</label>
          <input name="deaths" type="number" min="0" defaultValue={report?.deaths ?? ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="Unknown" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Recovered</label>
          <input name="recovered" type="number" min="0" defaultValue={report?.recovered ?? ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="Unknown" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Report date</label>
        <input name="report_date" type="datetime-local" defaultValue={report?.report_date ? report.report_date.slice(0, 16) : ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Editor note</label>
        <textarea name="editor_note" rows={2} defaultValue={report?.editor_note || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="Internal note about this report" />
      </div>

      {/* Sources */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">Sources</label>
        {sources.length > 0 ? (
          <div className="border border-slate-200 rounded p-3 space-y-1 max-h-40 overflow-y-auto">
            {sources.map(s => (
              <label key={s.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(s.id)}
                  onChange={() => toggleSource(s.id)}
                  className="rounded border-slate-300"
                />
                <span className="text-xs text-slate-700">{s.title}</span>
                <span className="text-xs text-slate-400">({s.publisher})</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No sources available. Create sources first.</p>
        )}
      </div>

      <label className="flex items-center gap-2">
        <input name="published" type="checkbox" defaultChecked={report?.published || false} className="rounded border-slate-300" />
        <span className="text-sm text-slate-700">Published</span>
        <span className="text-xs text-slate-400">(requires at least one source)</span>
      </label>

      {error && (
        <div className="border border-red-200 rounded p-3 bg-red-50">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update report' : 'Create report'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-slate-500 px-4 py-2">Cancel</button>
      </div>
    </form>
  )
}

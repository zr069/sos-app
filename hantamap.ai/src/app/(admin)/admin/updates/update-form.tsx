'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UpdateFormProps {
  update?: any
  outbreaks: { id: string; name: string }[]
  locations: { id: string; country: string; region: string | null; city: string | null }[]
  sources: { id: string; title: string; publisher: string }[]
  linkedSourceIds?: string[]
}

export function UpdateForm({ update, outbreaks, locations, sources, linkedSourceIds = [] }: UpdateFormProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>(linkedSourceIds)
  const router = useRouter()
  const isEdit = !!update

  function toggleSource(id: string) {
    setSelectedSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const published = form.get('published') === 'on'

    if (published && selectedSources.length === 0) {
      setError('At least one source is required to publish an update.')
      setSaving(false)
      return
    }

    const supabase = createClient()

    const data: any = {
      title: form.get('title') as string,
      summary: form.get('summary') as string || null,
      body: form.get('body') as string || null,
      outbreak_id: form.get('outbreak_id') as string || null,
      location_id: form.get('location_id') as string || null,
      verification_status: form.get('verification_status') as string,
      published,
      published_at: published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    let updateId = update?.id

    if (isEdit) {
      const result = await supabase.from('updates').update(data).eq('id', update.id)
      if (result.error) { setError(result.error.message); setSaving(false); return }
    } else {
      const result = await supabase.from('updates').insert(data).select('id').single()
      if (result.error) { setError(result.error.message); setSaving(false); return }
      updateId = result.data.id
    }

    if (updateId) {
      await supabase.from('update_sources').delete().eq('update_id', updateId)
      if (selectedSources.length > 0) {
        await supabase.from('update_sources').insert(
          selectedSources.map(sid => ({ update_id: updateId, source_id: sid }))
        )
      }
    }

    router.push('/admin/updates')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
        <input name="title" required defaultValue={update?.title || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Summary</label>
        <textarea name="summary" rows={2} defaultValue={update?.summary || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Body</label>
        <textarea name="body" rows={6} defaultValue={update?.body || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Outbreak</label>
          <select name="outbreak_id" defaultValue={update?.outbreak_id || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
            <option value="">None</option>
            {outbreaks.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
          <select name="location_id" defaultValue={update?.location_id || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
            <option value="">None</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{[l.city, l.region, l.country].filter(Boolean).join(', ')}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Verification status</label>
        <select name="verification_status" defaultValue={update?.verification_status || 'suspected'} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
          <option value="verified">Verified</option>
          <option value="probable">Probable</option>
          <option value="suspected">Suspected</option>
          <option value="disputed">Disputed</option>
          <option value="retracted">Retracted</option>
          <option value="awaiting_source">Awaiting source</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">Sources</label>
        {sources.length > 0 ? (
          <div className="border border-slate-200 rounded p-3 space-y-1 max-h-40 overflow-y-auto">
            {sources.map(s => (
              <label key={s.id} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedSources.includes(s.id)} onChange={() => toggleSource(s.id)} className="rounded border-slate-300" />
                <span className="text-xs text-slate-700">{s.title}</span>
                <span className="text-xs text-slate-400">({s.publisher})</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No sources available.</p>
        )}
      </div>

      <label className="flex items-center gap-2">
        <input name="published" type="checkbox" defaultChecked={update?.published || false} className="rounded border-slate-300" />
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
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Create update'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-slate-500 px-4 py-2">Cancel</button>
      </div>
    </form>
  )
}

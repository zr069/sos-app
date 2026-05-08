'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SourceForm() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: err } = await supabase.from('sources').insert({
      title: form.get('title') as string,
      publisher: form.get('publisher') as string,
      url: form.get('url') as string,
      published_at: form.get('published_at') || null,
      source_type: form.get('source_type') as string,
      reliability_level: parseInt(form.get('reliability_level') as string) || 3,
    })

    if (err) { setError(err.message); setSaving(false); return }
    router.push('/admin/sources')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Title</label>
        <input name="title" required className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="e.g. WHO Disease Outbreak News" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Publisher</label>
        <input name="publisher" required className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="e.g. World Health Organization" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">URL</label>
        <input name="url" type="url" required className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="https://..." />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
          <select name="source_type" defaultValue="other" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
            <option value="who">WHO</option>
            <option value="ecdc">ECDC</option>
            <option value="cdc">CDC</option>
            <option value="national_ministry">National ministry</option>
            <option value="regional_authority">Regional authority</option>
            <option value="scientific">Scientific</option>
            <option value="media">Media</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Reliability (1-5)</label>
          <input name="reliability_level" type="number" min="1" max="5" defaultValue="3" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Published at</label>
          <input name="published_at" type="datetime-local" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
        </div>
      </div>

      {error && (
        <div className="border border-red-200 rounded p-3 bg-red-50">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
          {saving ? 'Saving...' : 'Add source'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-slate-500 px-4 py-2">Cancel</button>
      </div>
    </form>
  )
}

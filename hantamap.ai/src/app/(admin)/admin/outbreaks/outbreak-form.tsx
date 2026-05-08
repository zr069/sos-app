'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function OutbreakForm({ outbreak }: { outbreak?: any }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isEdit = !!outbreak

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const data = {
      name: form.get('name') as string,
      slug: form.get('slug') as string,
      pathogen_name: form.get('pathogen_name') as string || null,
      summary: form.get('summary') as string || null,
      status: form.get('status') as string,
      transmission_notes: form.get('transmission_notes') as string || null,
      what_is_known: form.get('what_is_known') as string || null,
      what_is_not_known: form.get('what_is_not_known') as string || null,
      what_to_do: form.get('what_to_do') as string || null,
      published: form.get('published') === 'on',
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let result
    if (isEdit) {
      result = await supabase.from('outbreaks').update(data).eq('id', outbreak.id)
    } else {
      result = await supabase.from('outbreaks').insert({ ...data, first_reported_at: new Date().toISOString() })
    }

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    router.push('/admin/outbreaks')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
          <input name="name" required defaultValue={outbreak?.name || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Slug</label>
          <input name="slug" required defaultValue={outbreak?.slug || ''} placeholder="e.g. hantavirus-2025" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 font-mono text-xs focus:outline-none focus:border-slate-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Pathogen name</label>
        <input name="pathogen_name" defaultValue={outbreak?.pathogen_name || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Summary</label>
        <textarea name="summary" rows={3} defaultValue={outbreak?.summary || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
        <select name="status" defaultValue={outbreak?.status || 'monitoring'} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-slate-400">
          <option value="monitoring">Monitoring</option>
          <option value="active">Active</option>
          <option value="escalating">Escalating</option>
          <option value="declining">Declining</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Transmission notes</label>
        <textarea name="transmission_notes" rows={2} defaultValue={outbreak?.transmission_notes || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">What is known</label>
        <textarea name="what_is_known" rows={2} defaultValue={outbreak?.what_is_known || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">What is not yet known</label>
        <textarea name="what_is_not_known" rows={2} defaultValue={outbreak?.what_is_not_known || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">What to do</label>
        <textarea name="what_to_do" rows={2} defaultValue={outbreak?.what_to_do || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <label className="flex items-center gap-2">
        <input name="published" type="checkbox" defaultChecked={outbreak?.published || false} className="rounded border-slate-300" />
        <span className="text-sm text-slate-700">Published</span>
      </label>

      {error && (
        <div className="border border-red-200 rounded p-3 bg-red-50">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
          {saving ? 'Saving...' : isEdit ? 'Update outbreak' : 'Create outbreak'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-slate-500 px-4 py-2">
          Cancel
        </button>
      </div>
    </form>
  )
}

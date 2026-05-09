'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LocationForm() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: err } = await supabase.from('locations').insert({
      country: form.get('country') as string,
      region: form.get('region') as string || null,
      city: form.get('city') as string || null,
      latitude: form.get('latitude') ? parseFloat(form.get('latitude') as string) : null,
      longitude: form.get('longitude') ? parseFloat(form.get('longitude') as string) : null,
      precision: form.get('precision') as string,
    })

    if (err) { setError(err.message); setSaving(false); return }
    e.currentTarget.reset()
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
        <input name="country" required className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Region</label>
          <input name="region" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
          <input name="city" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Latitude</label>
          <input name="latitude" type="number" step="any" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="e.g. 48.8566" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Longitude</label>
          <input name="longitude" type="number" step="any" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" placeholder="e.g. 2.3522" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Precision</label>
        <select name="precision" defaultValue="unknown" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400 bg-white">
          <option value="exact">Exact</option>
          <option value="approximate">Approximate</option>
          <option value="country_level">Country level</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button type="submit" disabled={saving} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
        {saving ? 'Adding...' : 'Add location'}
      </button>
    </form>
  )
}

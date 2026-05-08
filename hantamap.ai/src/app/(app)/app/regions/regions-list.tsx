'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Region {
  id: string
  label: string
  country: string | null
  region: string | null
  city: string | null
  alert_enabled: boolean
}

export function RegionsList({ regions, userId }: { regions: Region[]; userId: string }) {
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    await supabase.from('saved_regions').insert({
      user_id: userId,
      label: form.get('label') as string,
      country: form.get('country') as string || null,
      region: form.get('region') as string || null,
      city: form.get('city') as string || null,
      alert_enabled: true,
    })

    setSaving(false)
    setAdding(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('saved_regions').delete().eq('id', id)
    router.refresh()
  }

  async function toggleAlert(id: string, enabled: boolean) {
    const supabase = createClient()
    await supabase.from('saved_regions').update({ alert_enabled: !enabled }).eq('id', id)
    router.refresh()
  }

  return (
    <div>
      {regions.length > 0 ? (
        <div className="space-y-3 mb-6">
          {regions.map(r => (
            <div key={r.id} className="border border-slate-200 rounded p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{r.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[r.city, r.region, r.country].filter(Boolean).join(', ') || 'No location details'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(r.id, r.alert_enabled)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    r.alert_enabled
                      ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  {r.alert_enabled ? 'Alerts on' : 'Alerts off'}
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-xs text-slate-400 hover:text-red-600 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded p-6 text-center mb-6">
          <p className="text-sm text-slate-500">No saved regions yet.</p>
          <p className="text-xs text-slate-400 mt-1">Add a region to start monitoring outbreak updates.</p>
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="border border-slate-200 rounded p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Label</label>
            <input name="label" required placeholder="e.g. Home, Office, Family" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
              <input name="country" placeholder="Country" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Region</label>
              <input name="region" placeholder="Region" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
              <input name="city" placeholder="City" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save region'}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-slate-500 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="border border-slate-300 text-sm font-medium text-slate-700 px-4 py-2 rounded hover:bg-slate-50 transition-colors"
        >
          Add region
        </button>
      )}
    </div>
  )
}

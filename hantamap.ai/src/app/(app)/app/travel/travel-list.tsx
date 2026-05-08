'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface TravelPlan {
  id: string
  destination_country: string
  destination_region: string | null
  destination_city: string | null
  departure_date: string | null
  return_date: string | null
  notes: string | null
}

export function TravelList({ plans, userId }: { plans: TravelPlan[]; userId: string }) {
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    await supabase.from('travel_plans').insert({
      user_id: userId,
      destination_country: form.get('destination_country') as string,
      destination_region: form.get('destination_region') as string || null,
      destination_city: form.get('destination_city') as string || null,
      departure_date: form.get('departure_date') as string || null,
      return_date: form.get('return_date') as string || null,
      notes: form.get('notes') as string || null,
    })

    setSaving(false)
    setAdding(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('travel_plans').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div>
      {plans.length > 0 ? (
        <div className="space-y-3 mb-6">
          {plans.map(p => (
            <div key={p.id} className="border border-slate-200 rounded p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {[p.destination_city, p.destination_region, p.destination_country].filter(Boolean).join(', ')}
                  </p>
                  <div className="flex gap-3 mt-1">
                    {p.departure_date && (
                      <span className="text-xs text-slate-500">
                        Departure: {new Date(p.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {p.return_date && (
                      <span className="text-xs text-slate-500">
                        Return: {new Date(p.return_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {p.notes && <p className="text-xs text-slate-400 mt-1">{p.notes}</p>}
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
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
          <p className="text-sm text-slate-500">No travel plans yet.</p>
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="border border-slate-200 rounded p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
              <input name="destination_country" required className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Region</label>
              <input name="destination_region" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
              <input name="destination_city" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Departure date</label>
              <input name="departure_date" type="date" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Return date</label>
              <input name="return_date" type="date" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save plan'}
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
          Add travel plan
        </button>
      )}
    </div>
  )
}

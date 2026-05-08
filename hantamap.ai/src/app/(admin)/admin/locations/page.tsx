import { createClient } from '@/lib/supabase/server'
import { LocationForm } from './location-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Locations' }

export default async function AdminLocationsPage() {
  const supabase = await createClient()
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('country')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Locations</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Add location</h2>
          <LocationForm />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Existing locations</h2>
          {locations && locations.length > 0 ? (
            <div className="space-y-1">
              {locations.map((l: any) => (
                <div key={l.id} className="border border-slate-200 rounded px-3 py-2 text-sm text-slate-700">
                  {[l.city, l.region, l.country].filter(Boolean).join(', ')}
                  {l.latitude && l.longitude && (
                    <span className="text-xs text-slate-400 ml-2">
                      ({l.latitude.toFixed(2)}, {l.longitude.toFixed(2)})
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No locations added yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { MapFilters } from './map-filters'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'

export const metadata: Metadata = {
  title: 'Live Map',
  description: 'Interactive map showing verified outbreak locations worldwide with source-backed data.',
}

export const revalidate = 300

export default async function MapPage() {
  let reports: any[] = []
  let outbreaks: any[] = []
  let countries: string[] = []

  try {
    const supabase = await createClient()

    const [reportsRes, outbreaksRes] = await Promise.all([
      supabase
        .from('reports')
        .select('*, outbreak:outbreaks(id, name, slug), location:locations(country, region, city, latitude, longitude)')
        .eq('published', true),
      supabase
        .from('outbreaks')
        .select('id, name, slug')
        .eq('published', true)
        .order('name'),
    ])

    reports = reportsRes.data || []
    outbreaks = outbreaksRes.data || []

    const countrySet = new Set<string>()
    reports.forEach((r: any) => {
      if (r.location?.country) countrySet.add(r.location.country)
    })
    countries = Array.from(countrySet).sort()
  } catch {
    // Supabase not configured
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-900">Live outbreak map</h1>
          <p className="text-xs text-slate-400">
            {reports.length > 0
              ? `${reports.length} published report${reports.length !== 1 ? 's' : ''}`
              : 'No verified data available yet'}
          </p>
        </div>
      </div>
      <MapFilters outbreaks={outbreaks} countries={countries} />
      <div className="flex-1">
        <MapView reports={reports} height="100%" interactive={true} />
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { ReportForm } from '../report-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: New Report' }

export default async function NewReportPage() {
  const supabase = await createClient()
  const [outbreaksRes, locationsRes, sourcesRes] = await Promise.all([
    supabase.from('outbreaks').select('id, name').order('name'),
    supabase.from('locations').select('id, country, region, city').order('country'),
    supabase.from('sources').select('id, title, publisher').order('title'),
  ])

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Create report</h1>
      <ReportForm
        outbreaks={outbreaksRes.data || []}
        locations={locationsRes.data || []}
        sources={sourcesRes.data || []}
      />
    </div>
  )
}

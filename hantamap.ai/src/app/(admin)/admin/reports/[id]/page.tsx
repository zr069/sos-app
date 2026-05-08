import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ReportForm } from '../report-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Edit Report' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditReportPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [reportRes, outbreaksRes, locationsRes, sourcesRes, linkedSourcesRes] = await Promise.all([
    supabase.from('reports').select('*').eq('id', id).single(),
    supabase.from('outbreaks').select('id, name').order('name'),
    supabase.from('locations').select('id, country, region, city').order('country'),
    supabase.from('sources').select('id, title, publisher').order('title'),
    supabase.from('report_sources').select('source_id').eq('report_id', id),
  ])

  if (!reportRes.data) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit report</h1>
      <ReportForm
        report={reportRes.data}
        outbreaks={outbreaksRes.data || []}
        locations={locationsRes.data || []}
        sources={sourcesRes.data || []}
        linkedSourceIds={(linkedSourcesRes.data || []).map((s: any) => s.source_id)}
      />
    </div>
  )
}

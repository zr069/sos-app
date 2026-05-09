import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { VerificationBadge } from '@/components/ui/verification-badge'
import { SourceBadge } from '@/components/ui/source-badge'
import type { Metadata } from 'next'
import type { Report, Outbreak, Location, Source } from '@/lib/types'

export const metadata: Metadata = { title: 'Admin: Report Preview' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReportPreviewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [reportRes, linkedSourcesRes] = await Promise.all([
    supabase
      .from('reports')
      .select('*, outbreak:outbreaks(*), location:locations(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('report_sources')
      .select('source_id, source:sources(*)')
      .eq('report_id', id),
  ])

  if (!reportRes.data) notFound()

  const report = reportRes.data as Report & { outbreak: Outbreak; location: Location }
  const sources = (linkedSourcesRes.data || []).map((rs: any) => rs.source as Source)

  const locationParts = [report.location?.city, report.location?.region, report.location?.country].filter(Boolean)

  return (
    <div className="max-w-2xl">
      <div className={`rounded border px-4 py-3 text-sm font-medium mb-6 ${report.published ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
        This is a preview. The report is {report.published ? 'published' : 'unpublished'}.
      </div>

      <Link href={`/admin/reports/${id}`} className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
        &larr; Back to edit
      </Link>

      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            {report.outbreak?.name || 'Unknown outbreak'}
          </h1>
          <p className="text-sm text-slate-500">{locationParts.join(', ') || 'No location'}</p>
        </div>

        <div>
          <VerificationBadge status={report.verification_status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Confirmed cases</span>
            <p className="font-semibold text-slate-900">
              {report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Deaths</span>
            <p className="font-semibold text-slate-900">
              {report.deaths !== null ? report.deaths : 'Unknown'}
            </p>
          </div>
          {report.probable_cases !== null && (
            <div>
              <span className="text-slate-500">Probable cases</span>
              <p className="font-semibold text-slate-900">{report.probable_cases}</p>
            </div>
          )}
          {report.suspected_cases !== null && (
            <div>
              <span className="text-slate-500">Suspected cases</span>
              <p className="font-semibold text-slate-900">{report.suspected_cases}</p>
            </div>
          )}
          {report.recovered !== null && (
            <div>
              <span className="text-slate-500">Recovered</span>
              <p className="font-semibold text-slate-900">{report.recovered}</p>
            </div>
          )}
        </div>

        {report.editor_note && (
          <div className="border-l-2 border-slate-200 pl-4">
            <p className="text-xs font-medium text-slate-400 mb-1">Editor note</p>
            <p className="text-sm text-slate-600 italic">{report.editor_note}</p>
          </div>
        )}

        {report.location?.precision === 'approximate' && (
          <p className="text-xs text-amber-600">Location is approximate</p>
        )}

        {sources.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Sources ({sources.length})</p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source) => (
                <SourceBadge key={source.id} source={source} />
              ))}
            </div>
          </div>
        )}

        {report.report_date && (
          <p className="text-xs text-slate-400">
            Report date: {new Date(report.report_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  )
}

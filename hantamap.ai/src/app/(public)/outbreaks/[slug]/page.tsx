import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VerificationBadge } from '@/components/ui/verification-badge'
import { SourceBadge } from '@/components/ui/source-badge'
import { OutbreakTimeline } from '@/components/ui/outbreak-timeline'
import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import { EmptyState } from '@/components/ui/empty-state'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: outbreak } = await supabase
      .from('outbreaks')
      .select('name, summary')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (!outbreak) return { title: 'Outbreak Not Found' }

    return {
      title: outbreak.name,
      description: outbreak.summary || `Verified outbreak information for ${outbreak.name}.`,
    }
  } catch {
    return { title: 'Outbreak' }
  }
}

export default async function OutbreakDetailPage({ params }: Props) {
  const { slug } = await params
  let outbreak: any = null
  let reports: any[] = []
  let updates: any[] = []
  let sources: any[] = []

  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('outbreaks')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (!data) notFound()
    outbreak = data

    const [reportsRes, updatesRes] = await Promise.all([
      supabase
        .from('reports')
        .select('*, location:locations(country, region, city), report_sources(source:sources(*))')
        .eq('outbreak_id', outbreak.id)
        .eq('published', true)
        .order('report_date', { ascending: false }),
      supabase
        .from('updates')
        .select('*, update_sources(source:sources(*))')
        .eq('outbreak_id', outbreak.id)
        .eq('published', true)
        .order('published_at', { ascending: false }),
    ])

    reports = reportsRes.data || []
    updates = updatesRes.data || []

    // Collect all unique sources
    const sourceMap = new Map()
    reports.forEach((r: any) => {
      r.report_sources?.forEach((rs: any) => {
        if (rs.source) sourceMap.set(rs.source.id, rs.source)
      })
    })
    updates.forEach((u: any) => {
      u.update_sources?.forEach((us: any) => {
        if (us.source) sourceMap.set(us.source.id, us.source)
      })
    })
    sources = Array.from(sourceMap.values())
  } catch {
    notFound()
  }

  if (!outbreak) notFound()

  const totalConfirmed = reports.reduce((sum: number, r: any) => sum + (r.confirmed_cases || 0), 0)
  const totalDeaths = reports.reduce((sum: number, r: any) => sum + (r.deaths || 0), 0)
  const hasConfirmedData = reports.some((r: any) => r.confirmed_cases !== null)
  const hasDeathData = reports.some((r: any) => r.deaths !== null)

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium capitalize">{outbreak.status}</span>
          {outbreak.last_reviewed_at && (
            <span className="text-xs text-slate-400">
              Last reviewed: {new Date(outbreak.last_reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{outbreak.name}</h1>
        {outbreak.pathogen_name && (
          <p className="text-sm text-slate-500 mt-1">Pathogen: {outbreak.pathogen_name}</p>
        )}
      </div>

      {/* Summary */}
      {outbreak.summary && (
        <div className="mb-8">
          <p className="text-base text-slate-700 leading-relaxed">{outbreak.summary}</p>
        </div>
      )}

      {/* Case Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Confirmed cases</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{hasConfirmedData ? totalConfirmed : 'Unknown'}</p>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Deaths</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{hasDeathData ? totalDeaths : 'Unknown'}</p>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Reports</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{reports.length}</p>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Sources</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{sources.length}</p>
        </div>
      </div>

      {/* Affected Regions */}
      {reports.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Affected regions</h2>
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirmed</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deaths</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report: any) => (
                  <tr key={report.id}>
                    <td className="px-4 py-2 text-slate-700">
                      {[report.location?.city, report.location?.region, report.location?.country].filter(Boolean).join(', ')}
                    </td>
                    <td className="px-4 py-2 text-slate-700 tabular-nums">
                      {report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'}
                    </td>
                    <td className="px-4 py-2 text-slate-700 tabular-nums">
                      {report.deaths !== null ? report.deaths : 'Unknown'}
                    </td>
                    <td className="px-4 py-2">
                      <VerificationBadge status={report.verification_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Transmission Notes */}
      {outbreak.transmission_notes && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Transmission</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{outbreak.transmission_notes}</p>
        </section>
      )}

      {/* What is Known / Not Known / What to Do */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-200 rounded p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">What is known</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {outbreak.what_is_known || 'No verified information available yet.'}
          </p>
        </div>
        <div className="border border-slate-200 rounded p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">What is not yet known</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {outbreak.what_is_not_known || 'Awaiting verified source.'}
          </p>
        </div>
        <div className="border border-slate-200 rounded p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">What to do</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {outbreak.what_to_do || 'Follow guidance from your local health authority.'}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Timeline</h2>
        <OutbreakTimeline updates={updates} />
      </section>

      {/* Sources */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Sources</h2>
        {sources.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sources.map((source: any) => (
              <SourceBadge key={source.id} source={source} />
            ))}
          </div>
        ) : (
          <EmptyState title="No sources linked yet" description="Awaiting verified source." />
        )}
      </section>

      {/* Disclaimer */}
      <DisclaimerBox text="This outbreak information is based on publicly available data from health authorities. It does not constitute medical advice. Consult a healthcare professional for personal medical decisions." />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('outbreaks').select('name, summary').eq('slug', slug).eq('published', true).single()
    if (!data) return { title: 'Outbreak Not Found' }
    return { title: data.name, description: data.summary || `Outbreak information for ${data.name}.` }
  } catch { return { title: 'Outbreak' } }
}

export default async function OutbreakDetailPage({ params }: Props) {
  const { slug } = await params
  let outbreak: any = null
  let reports: any[] = []
  let updates: any[] = []
  let sources: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('outbreaks').select('*').eq('slug', slug).eq('published', true).single()
    if (!data) notFound()
    outbreak = data

    const [reportsRes, updatesRes, sourcesRes] = await Promise.all([
      supabase.from('reports').select('*, location:locations(country, region, city, precision), report_type, cluster_relation, counts_as_case').eq('outbreak_id', outbreak.id).eq('published', true).order('report_date', { ascending: false }),
      supabase.from('updates').select('*').eq('outbreak_id', outbreak.id).eq('published', true).order('published_at', { ascending: false }),
      // Get sources linked to this outbreak's reports
      supabase.from('report_sources').select('source:sources(*)').in('report_id', (await supabase.from('reports').select('id').eq('outbreak_id', outbreak.id).eq('published', true)).data?.map((r: any) => r.id) || []),
    ])

    reports = reportsRes.data || []
    updates = updatesRes.data || []

    const sourceMap = new Map()
    sourcesRes.data?.forEach((rs: any) => { if (rs.source) sourceMap.set(rs.source.id, rs.source) })
    sources = Array.from(sourceMap.values())
  } catch {
    if (!outbreak) notFound()
  }

  if (!outbreak) notFound()

  const caseReports = reports.filter((r: any) => r.counts_as_case !== false)
  const totalConfirmed = caseReports.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const totalDeaths = caseReports.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasC = caseReports.some((r: any) => r.confirmed_cases !== null)
  const hasD = caseReports.some((r: any) => r.deaths !== null)

  return (
    <div className="bg-[#061417] pt-14 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ff4d57]/12 text-[#ff4d57] border border-[#ff4d57]/20">{outbreak.status}</span>
            {outbreak.last_reviewed_at && (
              <span className="text-[10px] text-white/30">Last reviewed: {new Date(outbreak.last_reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#f2f7f8]">{outbreak.name}</h1>
          {outbreak.pathogen_name && <p className="text-sm text-white/40 mt-1">{outbreak.pathogen_name}</p>}
        </div>

        {outbreak.summary && <p className="text-sm text-white/60 leading-relaxed mb-8">{outbreak.summary}</p>}

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { l: 'Confirmed cases', v: hasC ? totalConfirmed : 'Unknown' },
            { l: 'Deaths', v: hasD ? totalDeaths : 'Unknown' },
            { l: 'Reports', v: reports.length },
            { l: 'Sources', v: sources.length },
          ].map((m, i) => (
            <div key={i} className="bg-[#0b2026] border border-white/[0.06] rounded-xl p-4">
              <div className="text-[8px] text-white/25 uppercase tracking-wider">{m.l}</div>
              <div className="text-xl font-bold text-[#f2f7f8] mt-1 tabular-nums">{m.v}</div>
            </div>
          ))}
        </div>

        {/* Locations */}
        {reports.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-[#f2f7f8] mb-3">Reported locations</h2>
            <div className="space-y-2">
              {reports.map((r: any) => (
                <div key={r.id} className="bg-[#0b2026] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#f2f7f8]">{[r.location?.city, r.location?.region, r.location?.country].filter(Boolean).join(', ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] text-white/35">{r.report_type?.replace(/_/g, ' ') || 'Report'}</span>
                      {r.location?.precision === 'approximate' && <span className="text-[8px] text-[#ffb240]">Approximate</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {r.counts_as_case !== false && r.confirmed_cases !== null && <p className="text-sm font-bold text-[#f2f7f8] tabular-nums">{r.confirmed_cases} cases</p>}
                    {r.counts_as_case !== false && r.deaths !== null && <p className="text-xs text-white/40 tabular-nums">{r.deaths} deaths</p>}
                    {r.counts_as_case === false && <p className="text-[9px] text-white/25">Non-case location</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* What is known / not known / what to do */}
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {[
            { t: 'What is known', v: outbreak.what_is_known },
            { t: 'What is not yet known', v: outbreak.what_is_not_known },
            { t: 'What to do', v: outbreak.what_to_do },
          ].map((s, i) => (
            <div key={i} className="bg-[#0b2026] border border-white/[0.06] rounded-xl p-4">
              <h3 className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-2">{s.t}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{s.v || 'Awaiting verified source.'}</p>
            </div>
          ))}
        </div>

        {/* Transmission */}
        {outbreak.transmission_notes && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-[#f2f7f8] mb-2">Transmission</h2>
            <p className="text-xs text-white/50 leading-relaxed">{outbreak.transmission_notes}</p>
          </section>
        )}

        {/* Sources */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-[#f2f7f8] mb-3">Sources</h2>
          {sources.length > 0 ? (
            <div className="space-y-2">
              {sources.map((s: any) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="block bg-[#0b2026] border border-white/[0.06] rounded-xl p-3 hover:bg-[#102b32] transition-colors">
                  <p className="text-xs font-medium text-[#f2f7f8]">{s.title}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{s.publisher} · {s.published_at ? new Date(s.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/25">No sources linked yet.</p>
          )}
        </section>

        {/* Timeline */}
        {updates.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-[#f2f7f8] mb-3">Timeline</h2>
            <div className="space-y-0">
              {updates.map((u: any, i: number) => (
                <div key={u.id} className="flex gap-3">
                  <div className="flex flex-col items-center"><div className="w-2 h-2 rounded-full bg-white/20 mt-1.5" />{i < updates.length - 1 && <div className="w-px flex-1 bg-white/[0.06]" />}</div>
                  <div className="pb-4">
                    <p className="text-xs font-medium text-[#f2f7f8]">{u.title}</p>
                    {u.summary && <p className="text-xs text-white/40 mt-0.5">{u.summary}</p>}
                    <p className="text-[10px] text-white/20 mt-1">{u.published_at ? new Date(u.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Disclaimer */}
        <div className="border border-white/[0.06] rounded-xl p-4 mt-8">
          <p className="text-[10px] text-white/20 leading-relaxed">
            This outbreak information is based on publicly available data from health authorities and media monitoring. It does not constitute medical advice. Consult a healthcare professional for personal medical decisions.
          </p>
        </div>

        <div className="mt-6">
          <Link href="/map" className="text-xs text-[#28d7c2] hover:text-[#28d7c2]/80">View on map</Link>
        </div>
      </div>
    </div>
  )
}

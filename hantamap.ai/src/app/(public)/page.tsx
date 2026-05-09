import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HantaMap.ai - Real-time Hantavirus Signal Tracking',
  description: 'Track Hantavirus signals in real time. Official sources, media monitoring and source-backed updates in one live map.',
}

export const revalidate = 60

export default async function HomePage() {
  let reportCount = 0
  let mediaSignalCount = 0
  let reports: any[] = []
  let updates: any[] = []
  let mediaItems: any[] = []
  const lastChecked = new Date().toISOString()

  try {
    const supabase = await createClient()
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const [reportsCountRes, updatesRes, reportsWithLocRes, mediaRes] = await Promise.all([
      supabase.from('reports').select('id', { count: 'exact' }).eq('published', true),
      supabase.from('updates').select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)').eq('published', true).order('published_at', { ascending: false }).limit(5),
      supabase.from('reports').select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city, latitude, longitude, precision)').eq('published', true).order('created_at', { ascending: false }).limit(50),
      supabase.from('source_candidates').select('id, title, url, publisher, original_publisher, published_at, confidence_level, source_type').eq('is_public', true).eq('source_type', 'media').gte('published_at', tenDaysAgo.toISOString()).order('published_at', { ascending: false }).limit(10),
    ])

    reportCount = reportsCountRes.count || 0
    updates = updatesRes.data || []
    reports = reportsWithLocRes.data || []
    mediaItems = mediaRes.data || []
    mediaSignalCount = mediaItems.length
  } catch {
    // Supabase not configured
  }

  const totalConfirmed = reports.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const totalDeaths = reports.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasConfirmed = reports.some((r: any) => r.confirmed_cases !== null)
  const hasDeaths = reports.some((r: any) => r.deaths !== null)

  return (
    <div className="bg-[var(--bg-primary)]">
      {/* Hero with embedded map */}
      <section className="relative min-h-[85vh] flex flex-col">
        <div className="absolute inset-0 opacity-60">
          <MapView reports={reports} height="100%" interactive={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-[var(--bg-primary)]" />

        <div className="relative flex-1 flex flex-col justify-center px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-6">
              {reportCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent-red)]/15 text-[var(--accent-red)] border border-[var(--accent-red)]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] animate-pulse" />
                  Active signal
                </span>
              )}
              {mediaSignalCount > 0 && reportCount === 0 && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent-amber)]/15 text-[var(--accent-amber)] border border-[var(--accent-amber)]/20">
                  Monitoring active
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1]">
              Track Hantavirus signals in real time.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-4 leading-relaxed max-w-md">
              Official sources, recent media monitoring and source-backed updates in one live map.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--accent-teal)] text-[var(--bg-primary)] text-sm font-semibold hover:brightness-110 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Open live map
              </Link>
              <Link
                href="/updates"
                className="inline-flex items-center px-6 py-3 rounded-full border border-white/10 text-[var(--text-secondary)] text-sm font-medium hover:bg-white/5 hover:text-[var(--text-primary)] transition-all"
              >
                Latest updates
              </Link>
            </div>
          </div>
        </div>

        {/* Floating metrics */}
        <div className="relative px-4 sm:px-6 pb-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Official reports', value: reportCount || '-', accent: reportCount > 0 },
              { label: 'Confirmed cases', value: hasConfirmed ? totalConfirmed : '-', accent: false },
              { label: 'Deaths', value: hasDeaths ? totalDeaths : '-', accent: false },
              { label: 'Media signals', value: mediaSignalCount || '-', accent: false },
            ].map((m, i) => (
              <div key={i} className="bg-[var(--bg-panel)]/80 border border-white/[0.06] rounded-[var(--radius-card)] p-4 backdrop-blur-sm">
                <div className={`text-2xl font-bold tabular-nums ${m.accent ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'}`}>
                  {m.value}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active signals */}
      {(updates.length > 0 || mediaItems.length > 0) && (
        <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto">
          {/* Official updates */}
          {updates.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Verified updates</h2>
                <Link href="/updates" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">View all</Link>
              </div>
              <div className="space-y-3">
                {updates.map((u: any) => (
                  <div key={u.id} className="bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-card)] p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--accent-green)]/20">
                        {u.verification_status}
                      </span>
                      {u.outbreak && (
                        <Link href={`/outbreaks/${u.outbreak.slug}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                          {u.outbreak.name}
                        </Link>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{u.title}</h3>
                    {u.summary && <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{u.summary}</p>}
                    <div className="text-xs text-[var(--text-muted)] mt-3">
                      {u.published_at ? new Date(u.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      {u.location && ` · ${[u.location.city, u.location.region, u.location.country].filter(Boolean).join(', ')}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media monitoring */}
          {mediaItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Media monitoring</h2>
                <Link href="/updates?tab=media" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">View all</Link>
              </div>
              {updates.length === 0 && (
                <div className="bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/15 rounded-[var(--radius-card)] px-4 py-3 mb-4">
                  <p className="text-xs text-[var(--accent-amber)]">
                    No official Hantavirus reports published yet. Recent media monitoring is active.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {mediaItems.map((item: any) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-card)] p-4 hover:bg-[var(--bg-panel-strong)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        item.confidence_level === 'high'
                          ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20'
                          : 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/20'
                      }`}>
                        {item.confidence_level === 'high' ? 'High confidence' : 'Media'}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
                      <span>{item.original_publisher || item.publisher}</span>
                      <span>·</span>
                      <span>{item.published_at ? new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2">Media report, awaiting official confirmation</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Empty state if nothing at all */}
      {updates.length === 0 && mediaItems.length === 0 && reports.length === 0 && (
        <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto text-center">
          <div className="bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-large)] p-12 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-teal)]/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--accent-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-sm text-[var(--text-primary)] font-medium">Monitoring active</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">No Hantavirus reports published yet. Official and media sources are being monitored.</p>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <div className="border border-white/[0.06] rounded-[var(--radius-card)] p-4">
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
            HantaMap does not provide medical diagnosis or emergency medical advice. Information is sourced from public health authorities and media monitoring. Media reports are not confirmed cases. Always consult a healthcare professional for medical decisions. Last checked: {new Date(lastChecked).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
          </p>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'

interface HomeMapClientProps {
  reports: any[]
  updates: any[]
  mediaItems: any[]
  lastChecked: string
}

export function HomeMapClient({ reports, updates, mediaItems, lastChecked }: HomeMapClientProps) {
  const [showOfficial, setShowOfficial] = useState(true)
  const [showMedia, setShowMedia] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [feedOpen, setFeedOpen] = useState(false)

  const hasOfficial = reports.length > 0
  const hasMedia = mediaItems.length > 0
  const totalConfirmed = reports.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const totalDeaths = reports.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasConfirmedData = reports.some((r: any) => r.confirmed_cases !== null)
  const hasDeathData = reports.some((r: any) => r.deaths !== null)

  return (
    <div className="relative w-full bg-[var(--bg-primary)]" style={{ height: '100svh' }}>
      {/* Full-screen map, starts behind the fixed header */}
      <div className="absolute inset-0">
        <MapView
          reports={showOfficial ? reports : []}
          mediaItems={showMedia ? mediaItems : []}
          height="100%"
          interactive={true}
          showMedia={showMedia}
          onMarkerSelect={setSelectedReport}
        />
      </div>

      {/* Layer toggles, top-left under header */}
      <div className="absolute top-[68px] left-4 z-[1000] flex gap-2">
        <button
          onClick={() => setShowOfficial(!showOfficial)}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl transition-all ${
            showOfficial
              ? 'bg-[var(--accent-red)]/20 text-[var(--accent-red)] border border-[var(--accent-red)]/30'
              : 'bg-[var(--bg-panel)]/80 text-[var(--text-muted)] border border-white/[0.08]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]" />
          Official
        </button>
        <button
          onClick={() => setShowMedia(!showMedia)}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl transition-all ${
            showMedia
              ? 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30'
              : 'bg-[var(--bg-panel)]/80 text-[var(--text-muted)] border border-white/[0.08]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)]" />
          Media
        </button>
      </div>

      {/* Feed toggle, top-right under header */}
      <div className="absolute top-[68px] right-4 z-[1000] flex gap-2">
        <button
          onClick={() => setFeedOpen(!feedOpen)}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl bg-[var(--bg-panel)]/80 text-[var(--text-secondary)] border border-white/[0.08] hover:bg-[var(--bg-panel)] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          Feed
        </button>
        <Link
          href="/map"
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl bg-[var(--bg-panel)]/80 text-[var(--text-secondary)] border border-white/[0.08] hover:bg-[var(--bg-panel)] transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          Expand
        </Link>
      </div>

      {/* No-data overlay */}
      {!hasOfficial && !hasMedia && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <div className="bg-[var(--bg-panel)]/90 border border-white/[0.08] rounded-[var(--radius-large)] px-8 py-6 backdrop-blur-xl text-center max-w-xs">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-teal)]/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-[var(--accent-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Monitoring active</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">No Hantavirus reports published yet. Official and media sources are being monitored.</p>
          </div>
        </div>
      )}

      {/* Media-only banner */}
      {!hasOfficial && hasMedia && (
        <div className="absolute top-[112px] left-4 right-4 z-[999] flex justify-center pointer-events-none">
          <div className="bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 rounded-full px-4 py-1.5 backdrop-blur-xl pointer-events-auto">
            <p className="text-[10px] text-[var(--accent-amber)] font-medium">
              Media monitoring active. Awaiting official confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Bottom metrics bar */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] safe-bottom">
        <div className="mx-auto max-w-3xl">
          <div className="bg-[var(--bg-panel)]/90 border border-white/[0.08] rounded-2xl backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-5 overflow-x-auto">
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{reports.length}</div>
                  <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest">Verified</div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{mediaItems.length}</div>
                  <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest">Media</div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{hasConfirmedData ? totalConfirmed : '-'}</div>
                  <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest">Cases</div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{hasDeathData ? totalDeaths : '-'}</div>
                  <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest">Deaths</div>
                </div>
              </div>
              <div className="text-[8px] text-[var(--text-muted)] flex-shrink-0 hidden sm:block pl-4">
                {new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
              </div>
            </div>
            {/* Source strip */}
            <div className="border-t border-white/[0.04] px-4 py-1.5 flex items-center justify-between">
              <p className="text-[9px] text-[var(--text-muted)]">Sources: WHO, ECDC, CDC, media monitoring</p>
              <p className="text-[9px] text-[var(--text-muted)]">Not medical advice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected report detail sheet */}
      {selectedReport && (
        <div className="absolute bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:top-[68px] sm:bottom-auto sm:w-[340px] z-[1001] safe-bottom">
          <div className="bg-[var(--bg-panel)]/95 border border-white/[0.08] rounded-[var(--radius-card)] p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                  {selectedReport.outbreak?.name || 'Report'}
                </h3>
                {selectedReport.outbreak?.pathogen_name && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{selectedReport.outbreak.pathogen_name}</p>
                )}
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 -mr-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--accent-green)]/20">
                {selectedReport.verification_status}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                {[selectedReport.location?.city, selectedReport.location?.country].filter(Boolean).join(', ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white/[0.03] rounded-[var(--radius-sm)] p-3">
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Confirmed</div>
                <div className="text-xl font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                  {selectedReport.confirmed_cases !== null ? selectedReport.confirmed_cases : 'Unknown'}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-[var(--radius-sm)] p-3">
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Deaths</div>
                <div className="text-xl font-bold text-[var(--text-primary)] tabular-nums mt-0.5">
                  {selectedReport.deaths !== null ? selectedReport.deaths : 'Unknown'}
                </div>
              </div>
            </div>

            {selectedReport.location?.precision === 'approximate' && (
              <p className="text-[10px] text-[var(--accent-amber)] mb-3">Location is approximate</p>
            )}

            {selectedReport.outbreak?.slug && (
              <Link
                href={`/outbreaks/${selectedReport.outbreak.slug}`}
                className="block text-center text-xs font-medium py-2.5 rounded-full bg-white/[0.06] text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors"
              >
                View full report
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Feed panel (right side on desktop, bottom sheet on mobile) */}
      {feedOpen && (
        <div className="absolute top-[106px] right-4 bottom-20 sm:w-[360px] z-[1001] flex flex-col max-h-[calc(100svh-180px)]">
          <div className="bg-[var(--bg-panel)]/95 border border-white/[0.08] rounded-[var(--radius-card)] backdrop-blur-xl flex flex-col overflow-hidden flex-1">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Signal feed</h3>
              <button onClick={() => setFeedOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {/* Official updates */}
              {updates.map((u: any) => (
                <Link key={u.id} href={u.outbreak ? `/outbreaks/${u.outbreak.slug}` : '/updates'} className="block bg-white/[0.03] rounded-[var(--radius-sm)] p-3 hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-green)]">{u.verification_status}</span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">{u.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {u.published_at ? new Date(u.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    {u.outbreak && ` · ${u.outbreak.name}`}
                  </p>
                </Link>
              ))}

              {/* Media items */}
              {mediaItems.map((item: any) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-white/[0.03] rounded-[var(--radius-sm)] p-3 hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-amber)]">
                      {item.confidence_level === 'high' ? 'High confidence' : 'Media'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">{item.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    {item.original_publisher || item.publisher}
                    {item.published_at && ` · ${new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </a>
              ))}

              {updates.length === 0 && mediaItems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-[var(--text-muted)]">No signals yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

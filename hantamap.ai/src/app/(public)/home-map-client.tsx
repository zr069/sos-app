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
  const caseReports = reports.filter((r: any) => r.counts_as_case !== false)
  const nonCaseReports = reports.filter((r: any) => r.counts_as_case === false)
  const totalConfirmed = caseReports.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const totalDeaths = caseReports.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasConfirmedData = caseReports.some((r: any) => r.confirmed_cases !== null)
  const hasDeathData = caseReports.some((r: any) => r.deaths !== null)

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#061417] overflow-hidden" style={{ zIndex: 1 }}>
      {/* Map layer: fills entire screen */}
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

      {/* Overlay layer: pointer-events-none container, children opt in */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>

        {/* Top-left: layer pills */}
        <div className="absolute top-[68px] left-4 flex gap-2 pointer-events-auto">
          <button
            onClick={() => setShowOfficial(!showOfficial)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl transition-all ${
              showOfficial
                ? 'bg-[var(--accent-red)]/20 text-[var(--accent-red)] border border-[var(--accent-red)]/30'
                : 'bg-[#0b2026]/80 text-[#5a7078] border border-white/[0.08]'
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
                : 'bg-[#0b2026]/80 text-[#5a7078] border border-white/[0.08]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)]" />
            Media
          </button>
        </div>

        {/* Top-right: feed + full map */}
        <div className="absolute top-[68px] right-4 flex gap-2 pointer-events-auto">
          <button
            onClick={() => { setFeedOpen(!feedOpen); setSelectedReport(null) }}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl bg-[#0b2026]/80 text-[#9fb0b7] border border-white/[0.08] hover:bg-[#0b2026] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            Feed
          </button>
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl bg-[#0b2026]/80 text-[#9fb0b7] border border-white/[0.08] hover:bg-[#0b2026] transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            Full map
          </Link>
        </div>

        {/* No-data center overlay */}
        {!hasOfficial && !hasMedia && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="bg-[#0b2026]/90 border border-white/[0.08] rounded-3xl px-8 py-6 backdrop-blur-xl text-center max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-[#28d7c2]/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-[#28d7c2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="text-sm font-medium text-[#f2f7f8]">Monitoring active</p>
              <p className="text-xs text-[#5a7078] mt-1">No Hantavirus reports published yet.</p>
            </div>
          </div>
        )}

        {/* Media-only banner */}
        {!hasOfficial && hasMedia && (
          <div className="absolute top-[112px] left-4 right-4 flex justify-center">
            <div className="bg-[#ffb240]/10 border border-[#ffb240]/20 rounded-full px-4 py-1.5 backdrop-blur-xl pointer-events-auto">
              <p className="text-[10px] text-[#ffb240] font-medium">Media monitoring active. Awaiting official confirmation.</p>
            </div>
          </div>
        )}

        {/* Bottom metrics bar */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto safe-bottom">
          <div className="px-4 pb-4">
            <div className="mx-auto max-w-3xl">
              <div className="bg-[#0b2026]/90 border border-white/[0.08] rounded-2xl backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-4 sm:gap-5 overflow-x-auto">
                    <div className="text-center flex-shrink-0">
                      <div className="text-lg font-bold text-[#ff4d57] tabular-nums">{hasConfirmedData ? totalConfirmed : '-'}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Confirmed</div>
                    </div>
                    <div className="w-px h-8 bg-white/[0.06]" />
                    <div className="text-center flex-shrink-0">
                      <div className="text-lg font-bold text-[#f2f7f8] tabular-nums">{hasDeathData ? totalDeaths : '-'}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Deaths</div>
                    </div>
                    <div className="w-px h-8 bg-white/[0.06]" />
                    <div className="text-center flex-shrink-0">
                      <div className="text-lg font-bold text-[#38d48b] tabular-nums">{nonCaseReports.length}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Response</div>
                    </div>
                    <div className="w-px h-8 bg-white/[0.06]" />
                    <div className="text-center flex-shrink-0">
                      <div className="text-lg font-bold text-[#ffb240] tabular-nums">{mediaItems.length}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Media</div>
                    </div>
                  </div>
                  <div className="text-[8px] text-[#5a7078] flex-shrink-0 hidden sm:block pl-4">
                    {new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
                  </div>
                </div>
                <div className="border-t border-white/[0.04] px-4 py-1.5 flex items-center justify-between">
                  <p className="text-[9px] text-[#5a7078]">Sources: WHO, ECDC, CDC, media. Media signals are not confirmed cases.</p>
                  <p className="text-[9px] text-[#5a7078] hidden sm:block">Not medical advice</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected report detail sheet */}
        {selectedReport && (
          <div className="absolute bottom-28 left-4 right-4 sm:left-auto sm:right-4 sm:top-[68px] sm:bottom-auto sm:w-[340px] pointer-events-auto safe-bottom">
            <div className="bg-[#0b2026]/95 border border-white/[0.08] rounded-[20px] p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#f2f7f8] leading-tight">{selectedReport.outbreak?.name || 'Report'}</h3>
                  {selectedReport.outbreak?.pathogen_name && (
                    <p className="text-[11px] text-[#5a7078] mt-0.5">{selectedReport.outbreak.pathogen_name}</p>
                  )}
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-[#5a7078] hover:text-[#f2f7f8] p-1 -mr-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#38d48b]/15 text-[#38d48b] border border-[#38d48b]/20">
                  {selectedReport.verification_status}
                </span>
                <span className="text-[11px] text-[#5a7078]">
                  {[selectedReport.location?.city, selectedReport.location?.country].filter(Boolean).join(', ')}
                </span>
              </div>
              {selectedReport.counts_as_case !== false ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Confirmed</div>
                    <div className="text-xl font-bold text-[#f2f7f8] tabular-nums mt-0.5">
                      {selectedReport.confirmed_cases !== null ? selectedReport.confirmed_cases : 'Unknown'}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Deaths</div>
                    <div className="text-xl font-bold text-[#f2f7f8] tabular-nums mt-0.5">
                      {selectedReport.deaths !== null ? selectedReport.deaths : 'Unknown'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-[#5a7078] mb-4">This location does not count toward confirmed case totals.</p>
              )}
              {selectedReport.location?.precision === 'approximate' && (
                <p className="text-[10px] text-[#ffb240] mb-3">Location is approximate</p>
              )}
              {selectedReport.report_type && selectedReport.report_type !== 'outbreak_origin' && selectedReport.report_type !== 'confirmed_case_location' && (
                <p className="text-[10px] text-[#9fb0b7] mb-3 capitalize">{selectedReport.report_type.replace(/_/g, ' ')}</p>
              )}
              {selectedReport.outbreak?.slug && (
                <Link
                  href={`/outbreaks/${selectedReport.outbreak.slug}`}
                  className="block text-center text-xs font-medium py-2.5 rounded-full bg-white/[0.06] text-[#9fb0b7] hover:bg-white/10 hover:text-[#f2f7f8] transition-colors"
                >
                  View full report
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Feed panel */}
        {feedOpen && (
          <div className="absolute top-[106px] right-4 bottom-24 sm:w-[360px] flex flex-col max-h-[calc(100svh-200px)] pointer-events-auto">
            <div className="bg-[#0b2026]/95 border border-white/[0.08] rounded-[20px] backdrop-blur-xl flex flex-col overflow-hidden flex-1">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
                <h3 className="text-sm font-bold text-[#f2f7f8]">Signal feed</h3>
                <button onClick={() => setFeedOpen(false)} className="text-[#5a7078] hover:text-[#f2f7f8]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {updates.map((u: any) => (
                  <Link key={u.id} href={u.outbreak ? `/outbreaks/${u.outbreak.slug}` : '/updates'} className="block bg-white/[0.03] rounded-lg p-3 hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38d48b]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#38d48b]">{u.verification_status}</span>
                    </div>
                    <p className="text-xs font-medium text-[#f2f7f8] leading-snug">{u.title}</p>
                    <p className="text-[10px] text-[#5a7078] mt-1">
                      {u.published_at ? new Date(u.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </p>
                  </Link>
                ))}
                {mediaItems.map((item: any) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-white/[0.03] rounded-lg p-3 hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb240]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#ffb240]">
                        {item.confidence_level === 'high' ? 'High confidence' : 'Media'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#f2f7f8] leading-snug">{item.title}</p>
                    <p className="text-[10px] text-[#5a7078] mt-1">{item.original_publisher || item.publisher}</p>
                  </a>
                ))}
                {updates.length === 0 && mediaItems.length === 0 && (
                  <div className="text-center py-8"><p className="text-xs text-[#5a7078]">No signals yet</p></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

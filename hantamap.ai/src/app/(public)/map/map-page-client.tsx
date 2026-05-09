'use client'

import { useState, useCallback } from 'react'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'
import Link from 'next/link'

interface MapPageClientProps {
  reports: any[]
  mediaItems: any[]
  lastChecked: string | null
}

export function MapPageClient({ reports, mediaItems, lastChecked }: MapPageClientProps) {
  const hasOfficial = reports.length > 0
  const hasMedia = mediaItems.length > 0
  const [showOfficial, setShowOfficial] = useState(true)
  const [showMedia, setShowMedia] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const visibleReports = showOfficial ? reports : []
  const visibleMedia = showMedia ? mediaItems : []

  const caseReports = reports.filter((r: any) => r.counts_as_case !== false)
  const totalConfirmed = caseReports.reduce((sum: number, r: any) => sum + (r.confirmed_cases || 0), 0)
  const totalDeaths = caseReports.reduce((sum: number, r: any) => sum + (r.deaths || 0), 0)
  const hasConfirmedData = caseReports.some((r: any) => r.confirmed_cases !== null)
  const hasDeathData = caseReports.some((r: any) => r.deaths !== null)

  const handleReset = useCallback(() => {
    setSelectedReport(null)
  }, [])

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ background: '#02090b', zIndex: 10 }}>

      {/* Map: fills entire viewport */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <MapView
          reports={visibleReports}
          mediaItems={visibleMedia}
          height="100%"
          interactive={true}
          showMedia={showMedia}
          captureScroll={true}
          onMarkerSelect={setSelectedReport}
        />
      </div>

      {/* All overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <div className="flex items-center justify-between h-14 px-4" style={{ background: 'linear-gradient(to bottom, rgba(2,9,11,0.85) 0%, rgba(2,9,11,0.4) 80%, transparent 100%)' }}>
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#28d7c2] flex items-center justify-center">
                  <span className="text-[#02090b] text-xs font-black">H</span>
                </div>
                <span className="text-sm font-bold text-[#f2f7f8] tracking-tight hidden sm:block">HantaMap</span>
              </Link>
              <Link href="/" className="flex items-center gap-1 text-[11px] text-[#5a7078] hover:text-[#9fb0b7] transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Overview
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {lastChecked && (
                <span className="text-[10px] text-[#5a7078] hidden sm:block font-mono">
                  {new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC
                </span>
              )}
              <Link href="/login" className="text-[11px] text-[#5a7078] hover:text-[#9fb0b7] transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Left: layer toggles */}
        <div className="absolute top-16 left-4 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={() => setShowOfficial(!showOfficial)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl transition-all ${
              showOfficial ? 'bg-[#ff4d57]/20 text-[#ff4d57] border border-[#ff4d57]/30' : 'bg-[#0b2026]/80 text-[#5a7078] border border-white/[0.08]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff4d57]" />
            Official
          </button>
          <button
            onClick={() => setShowMedia(!showMedia)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-full backdrop-blur-xl transition-all ${
              showMedia ? 'bg-[#ffb240]/20 text-[#ffb240] border border-[#ffb240]/30' : 'bg-[#0b2026]/80 text-[#5a7078] border border-white/[0.08]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ffb240]" />
            Media
          </button>

          {/* Legend */}
          <div className="mt-2 bg-[#0b2026]/80 border border-white/[0.06] rounded-2xl p-3 backdrop-blur-xl hidden sm:block">
            <p className="text-[9px] text-[#5a7078] uppercase tracking-widest mb-2">Legend</p>
            {[
              { color: '#ff4d57', label: 'Official case' },
              { color: '#38d48b', label: 'Treatment' },
              { color: '#60a5fa', label: 'Response' },
              { color: '#a78bfa', label: 'Evacuation' },
              { color: '#ffb240', label: 'Media signal' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 py-0.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                <span className="text-[10px] text-[#9fb0b7]">{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 py-0.5 mt-1 border-t border-white/[0.04] pt-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0 border border-dashed border-[#ff4d57]/40" />
              <span className="text-[10px] text-[#9fb0b7]">Approximate</span>
            </div>
          </div>
        </div>

        {/* Media-only banner */}
        {!hasOfficial && hasMedia && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="bg-[#ffb240]/10 border border-[#ffb240]/20 rounded-full px-4 py-1.5 backdrop-blur-xl">
              <p className="text-[10px] text-[#ffb240] font-medium">Media monitoring active. Awaiting official confirmation.</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasOfficial && !hasMedia && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="bg-[#0b2026]/90 border border-white/[0.08] rounded-3xl px-8 py-6 backdrop-blur-xl text-center max-w-xs">
              <p className="text-sm font-medium text-[#f2f7f8]">Monitoring active</p>
              <p className="text-xs text-[#5a7078] mt-1">No Hantavirus reports published yet.</p>
            </div>
          </div>
        )}

        {/* Right panel: selected report or overview */}
        <div className="absolute top-16 right-4 bottom-20 hidden sm:block pointer-events-auto" style={{ width: '300px' }}>
          {selectedReport ? (
            <div className="bg-[#0b2026]/95 border border-white/[0.08] rounded-[20px] p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#f2f7f8] leading-tight">{selectedReport.outbreak?.name || 'Report'}</h3>
                  {selectedReport.outbreak?.pathogen_name && (
                    <p className="text-[11px] text-[#5a7078] mt-0.5">{selectedReport.outbreak.pathogen_name}</p>
                  )}
                </div>
                <button onClick={handleReset} className="text-[#5a7078] hover:text-[#f2f7f8] p-1 -mr-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#38d48b]/15 text-[#38d48b] border border-[#38d48b]/20">{selectedReport.verification_status}</span>
                <span className="text-[11px] text-[#5a7078]">{[selectedReport.location?.city, selectedReport.location?.country].filter(Boolean).join(', ')}</span>
              </div>
              {selectedReport.counts_as_case !== false ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Confirmed</div>
                    <div className="text-xl font-bold text-[#f2f7f8] tabular-nums mt-0.5">{selectedReport.confirmed_cases !== null ? selectedReport.confirmed_cases : 'Unknown'}</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3">
                    <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Deaths</div>
                    <div className="text-xl font-bold text-[#f2f7f8] tabular-nums mt-0.5">{selectedReport.deaths !== null ? selectedReport.deaths : 'Unknown'}</div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-[#5a7078] mb-4">This location does not count toward confirmed case totals.</p>
              )}
              {selectedReport.location?.precision === 'approximate' && <p className="text-[10px] text-[#ffb240] mb-3">Approximate marker, not verified exact position</p>}
              {selectedReport.report_type && !['outbreak_origin', 'confirmed_case_location'].includes(selectedReport.report_type) && (
                <p className="text-[10px] text-[#9fb0b7] mb-3 capitalize">{selectedReport.report_type.replace(/_/g, ' ')}</p>
              )}
              {selectedReport.outbreak?.slug && (
                <Link href={`/outbreaks/${selectedReport.outbreak.slug}`} className="block text-center text-xs font-medium py-2.5 rounded-full bg-white/[0.06] text-[#9fb0b7] hover:bg-white/10 hover:text-[#f2f7f8] transition-colors">View full report</Link>
              )}
            </div>
          ) : (
            <div className="bg-[#0b2026]/90 border border-white/[0.06] rounded-[20px] p-5 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-[#f2f7f8] mb-4">Hantavirus overview</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Official reports</div>
                  <div className="text-xl font-bold text-[#ff4d57] tabular-nums mt-0.5">{caseReports.length}</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Media signals</div>
                  <div className="text-xl font-bold text-[#ffb240] tabular-nums mt-0.5">{mediaItems.length}</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Confirmed cases</div>
                  <div className="text-xl font-bold text-[#f2f7f8] tabular-nums mt-0.5">{hasConfirmedData ? totalConfirmed : '-'}</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3">
                  <div className="text-[9px] text-[#5a7078] uppercase tracking-wider">Official deaths</div>
                  <div className="text-xl font-bold text-[#f2f7f8] tabular-nums mt-0.5">{hasDeathData ? totalDeaths : '-'}</div>
                </div>
              </div>
              <p className="text-[9px] text-[#5a7078]">Media signals are not confirmed cases. Select a marker for details.</p>
            </div>
          )}
        </div>

        {/* Mobile: selected report bottom sheet */}
        {selectedReport && (
          <div className="absolute bottom-20 left-4 right-4 sm:hidden pointer-events-auto safe-bottom">
            <div className="bg-[#0b2026]/95 border border-white/[0.08] rounded-[20px] p-4 backdrop-blur-xl">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-bold text-[#f2f7f8]">{selectedReport.outbreak?.name || 'Report'}</h3>
                <button onClick={handleReset} className="text-[#5a7078] hover:text-[#f2f7f8] p-1 -mr-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#38d48b]/15 text-[#38d48b] border border-[#38d48b]/20">{selectedReport.verification_status}</span>
                <span className="text-[10px] text-[#5a7078]">{[selectedReport.location?.city, selectedReport.location?.country].filter(Boolean).join(', ')}</span>
              </div>
              {selectedReport.counts_as_case !== false && (
                <div className="flex gap-4 mb-3">
                  <div><span className="text-[9px] text-[#5a7078] uppercase">Confirmed</span><span className="text-base font-bold text-[#f2f7f8] ml-2 tabular-nums">{selectedReport.confirmed_cases ?? 'Unknown'}</span></div>
                  <div><span className="text-[9px] text-[#5a7078] uppercase">Deaths</span><span className="text-base font-bold text-[#f2f7f8] ml-2 tabular-nums">{selectedReport.deaths ?? 'Unknown'}</span></div>
                </div>
              )}
              {selectedReport.location?.precision === 'approximate' && <p className="text-[10px] text-[#ffb240] mb-2">Approximate location</p>}
              {selectedReport.outbreak?.slug && (
                <Link href={`/outbreaks/${selectedReport.outbreak.slug}`} className="block text-center text-xs font-medium py-2 rounded-full bg-white/[0.06] text-[#9fb0b7]">View full report</Link>
              )}
            </div>
          </div>
        )}

        {/* Bottom status rail */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto safe-bottom">
          <div className="px-4 pb-3 sm:pb-4">
            <div className="sm:ml-0 sm:mr-[320px]">
              <div className="bg-[#0b2026]/90 border border-white/[0.06] rounded-2xl backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-4 overflow-x-auto">
                    <div className="text-center flex-shrink-0">
                      <div className="text-base font-bold text-[#ff4d57] tabular-nums">{hasConfirmedData ? totalConfirmed : '-'}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Confirmed</div>
                    </div>
                    <div className="w-px h-7 bg-white/[0.06]" />
                    <div className="text-center flex-shrink-0">
                      <div className="text-base font-bold text-[#f2f7f8] tabular-nums">{hasDeathData ? totalDeaths : '-'}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Deaths</div>
                    </div>
                    <div className="w-px h-7 bg-white/[0.06]" />
                    <div className="text-center flex-shrink-0">
                      <div className="text-base font-bold text-[#38d48b] tabular-nums">{reports.length}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Locations</div>
                    </div>
                    <div className="w-px h-7 bg-white/[0.06]" />
                    <div className="text-center flex-shrink-0">
                      <div className="text-base font-bold text-[#ffb240] tabular-nums">{mediaItems.length}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">Media</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/[0.04] px-4 py-1.5 flex items-center justify-between">
                  <p className="text-[9px] text-[#5a7078]">Sources: WHO, ECDC, CDC, media. Media signals are not confirmed cases.</p>
                  {lastChecked && <p className="text-[9px] text-[#5a7078] hidden sm:block">{new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

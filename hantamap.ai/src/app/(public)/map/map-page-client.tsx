'use client'

import { useState } from 'react'
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
  const nonCaseReports = reports.filter((r: any) => r.counts_as_case === false)
  const totalConfirmed = caseReports.reduce((sum: number, r: any) => sum + (r.confirmed_cases || 0), 0)
  const totalDeaths = caseReports.reduce((sum: number, r: any) => sum + (r.deaths || 0), 0)
  const hasConfirmedData = caseReports.some((r: any) => r.confirmed_cases !== null)
  const hasDeathData = caseReports.some((r: any) => r.deaths !== null)

  return (
    <div className="relative bg-[var(--bg-primary)] -mt-14" style={{ height: '100svh' }}>
      {/* Map fills everything */}
      <div className="absolute inset-0">
        <MapView
          reports={visibleReports}
          mediaItems={visibleMedia}
          height="100%"
          interactive={true}
          showMedia={showMedia}
          autoFit={true}
          onMarkerSelect={setSelectedReport}
        />
      </div>

      {/* Back to overview + Layer controls */}
      <div className="absolute top-[72px] left-4 z-[1000] flex gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full backdrop-blur-xl bg-[var(--bg-panel)]/80 text-[var(--text-secondary)] border border-white/[0.06] hover:bg-[var(--bg-panel)] transition-all"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Overview
        </Link>
      </div>
      <div className="absolute top-[72px] left-[120px] z-[1000] flex gap-2">
        <button
          onClick={() => setShowOfficial(!showOfficial)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full backdrop-blur-xl transition-all ${
            showOfficial
              ? 'bg-[var(--accent-red)]/20 text-[var(--accent-red)] border border-[var(--accent-red)]/30'
              : 'bg-[var(--bg-panel)]/80 text-[var(--text-muted)] border border-white/[0.06]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-red)]" />
          Official
        </button>
        <button
          onClick={() => setShowMedia(!showMedia)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full backdrop-blur-xl transition-all ${
            showMedia
              ? 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border border-[var(--accent-amber)]/30'
              : 'bg-[var(--bg-panel)]/80 text-[var(--text-muted)] border border-white/[0.06]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)]" />
          Media
        </button>
      </div>

      {/* Status panel - floating bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] safe-bottom">
        {/* Banner if no official data */}
        {!hasOfficial && hasMedia && (
          <div className="mb-3 mx-auto max-w-lg">
            <div className="bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/20 rounded-2xl px-4 py-3 backdrop-blur-xl text-center">
              <p className="text-xs text-[var(--accent-amber)]">
                Media monitoring active. Reports are awaiting official confirmation by health authorities.
              </p>
            </div>
          </div>
        )}

        {!hasOfficial && !hasMedia && (
          <div className="mb-3 mx-auto max-w-lg">
            <div className="bg-[var(--bg-panel)]/90 border border-white/[0.06] rounded-2xl px-4 py-3 backdrop-blur-xl text-center">
              <p className="text-xs text-[var(--text-secondary)]">Monitoring active. No Hantavirus reports published yet.</p>
            </div>
          </div>
        )}

        {/* Metrics bar */}
        <div className="mx-auto max-w-2xl">
          <div className="bg-[var(--bg-panel)]/90 border border-white/[0.06] rounded-2xl px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center gap-4 min-w-0">
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{reports.length}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Verified</div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{mediaItems.length}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Media</div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{hasConfirmedData ? totalConfirmed : '-'}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Confirmed</div>
                </div>
                <div className="w-px h-8 bg-white/[0.06]" />
                <div className="text-center flex-shrink-0">
                  <div className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{hasDeathData ? totalDeaths : '-'}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Deaths</div>
                </div>
              </div>
              {lastChecked && (
                <div className="text-[9px] text-[var(--text-muted)] flex-shrink-0 hidden sm:block">
                  Updated {new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected report detail sheet (mobile bottom, desktop right) */}
      {selectedReport && (
        <div className="absolute bottom-28 left-4 right-4 sm:left-auto sm:right-4 sm:top-20 sm:bottom-auto sm:w-80 z-[1001]">
          <div className="bg-[var(--bg-panel)] border border-white/[0.08] rounded-[var(--radius-card)] p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {selectedReport.outbreak?.name || 'Report'}
                </h3>
                {selectedReport.outbreak?.pathogen_name && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{selectedReport.outbreak.pathogen_name}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--accent-green)]/20">
                {selectedReport.verification_status}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {[selectedReport.location?.city, selectedReport.location?.region, selectedReport.location?.country].filter(Boolean).join(', ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white/[0.03] rounded-[var(--radius-sm)] p-3">
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Confirmed</div>
                <div className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
                  {selectedReport.confirmed_cases !== null ? selectedReport.confirmed_cases : 'Unknown'}
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-[var(--radius-sm)] p-3">
                <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Deaths</div>
                <div className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
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
                className="block text-center text-xs font-medium py-2 rounded-[var(--radius-pill)] bg-white/[0.06] text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors"
              >
                View full outbreak report
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

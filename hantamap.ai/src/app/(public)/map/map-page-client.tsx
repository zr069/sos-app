'use client'

import { useState, useMemo, useCallback } from 'react'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'
import Link from 'next/link'

interface MapPageClientProps {
  reports: any[]
  mediaItems: any[]
  lastChecked: string | null
}

// ── Helpers ──

function fmtDate(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

function dayStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

// ── Component ──

export function MapPageClient({ reports, mediaItems, lastChecked }: MapPageClientProps) {
  const [showOfficial, setShowOfficial] = useState(true)
  const [showMedia, setShowMedia] = useState(true)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [playbackDay, setPlaybackDay] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  // ── Timeline range from real data ──
  const allDates = useMemo(() => {
    const dates: Date[] = []
    reports.forEach((r: any) => { const d = fmtDate(r.report_date || r.created_at); if (d) dates.push(d) })
    mediaItems.forEach((m: any) => { const d = fmtDate(m.published_at); if (d) dates.push(d) })
    dates.sort((a, b) => a.getTime() - b.getTime())
    return dates
  }, [reports, mediaItems])

  const minDate = allDates.length > 0 ? allDates[0] : new Date()
  const maxDate = allDates.length > 0 ? allDates[allDates.length - 1] : new Date()
  // Build list of unique day strings
  const dayList = useMemo(() => {
    const days: string[] = []
    const cur = new Date(minDate)
    while (cur <= maxDate) {
      days.push(dayStr(cur))
      cur.setDate(cur.getDate() + 1)
    }
    if (days.length === 0) days.push(dayStr(new Date()))
    return days
  }, [minDate, maxDate])

  const currentDayIdx = playbackDay ? dayList.indexOf(playbackDay) : dayList.length - 1
  const effectiveDay = playbackDay || dayList[dayList.length - 1]

  // Filter data by playback date
  const filteredReports = useMemo(() => {
    if (!playbackDay) return reports
    return reports.filter((r: any) => {
      const d = r.report_date || r.created_at
      return d && d.slice(0, 10) <= playbackDay
    })
  }, [reports, playbackDay])

  const filteredMedia = useMemo(() => {
    if (!playbackDay) return mediaItems
    return mediaItems.filter((m: any) => {
      return m.published_at && m.published_at.slice(0, 10) <= playbackDay
    })
  }, [mediaItems, playbackDay])

  const visibleReports = showOfficial ? filteredReports : []
  const visibleMedia = showMedia ? filteredMedia : []

  // Metrics from visible data
  const caseReports = filteredReports.filter((r: any) => r.counts_as_case !== false)
  const totalConfirmed = caseReports.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const totalDeaths = caseReports.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasConfirmed = caseReports.some((r: any) => r.confirmed_cases !== null)
  const hasDeaths = caseReports.some((r: any) => r.deaths !== null)

  // Playback controls
  const stepDay = useCallback((dir: number) => {
    const idx = Math.max(0, Math.min(dayList.length - 1, currentDayIdx + dir))
    setPlaybackDay(dayList[idx])
  }, [currentDayIdx, dayList])

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value)
    setPlaybackDay(dayList[idx])
  }, [dayList])

  // Auto-play
  const togglePlay = useCallback(() => {
    if (playing) { setPlaying(false); return }
    setPlaying(true)
    if (currentDayIdx >= dayList.length - 1) setPlaybackDay(dayList[0])
  }, [playing, currentDayIdx, dayList])

  // Play tick
  useState(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setPlaybackDay(prev => {
        const idx = prev ? dayList.indexOf(prev) : 0
        if (idx >= dayList.length - 1) { setPlaying(false); return dayList[dayList.length - 1] }
        return dayList[idx + 1]
      })
    }, 600)
    return () => clearInterval(interval)
  })

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ background: '#02090b', zIndex: 10 }}>

      {/* Map: Leaflet popups handle marker details (anchored with pointer) */}
      <div className="absolute inset-0">
        <MapView reports={visibleReports} mediaItems={visibleMedia} height="100%" interactive={true} showMedia={showMedia} captureScroll={true} />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>

        {/* ── Top command bar ── */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <div className="flex items-center justify-between h-12 px-4" style={{ background: 'linear-gradient(to bottom, rgba(2,9,11,0.9), transparent)' }}>
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#28d7c2] flex items-center justify-center"><span className="text-[#02090b] text-[10px] font-black">H</span></div>
                <span className="text-xs font-bold text-white/90 tracking-tight hidden sm:block">HantaMap</span>
              </Link>
              <Link href="/" className="text-[10px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Overview
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setTimelineOpen(!timelineOpen)} className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${timelineOpen ? 'bg-[#28d7c2]/20 text-[#28d7c2] border border-[#28d7c2]/30' : 'text-white/40 hover:text-white/70 border border-white/[0.06]'}`}>
                Timeline
              </button>
              {lastChecked && <span className="text-[9px] text-white/30 font-mono hidden sm:block">{new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
              <Link href="/login" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">Sign in</Link>
            </div>
          </div>
        </div>

        {/* ── Left: layers + legend ── */}
        <div className="absolute top-14 left-3 flex flex-col gap-2 pointer-events-auto">
          <div className="flex flex-col gap-1.5">
            <button onClick={() => setShowOfficial(!showOfficial)} className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full backdrop-blur-xl transition-all ${showOfficial ? 'bg-[#ff4d57]/15 text-[#ff4d57] border border-[#ff4d57]/25' : 'bg-white/[0.04] text-white/30 border border-white/[0.06]'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d57]" />Official
            </button>
            <button onClick={() => setShowMedia(!showMedia)} className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full backdrop-blur-xl transition-all ${showMedia ? 'bg-[#ffb240]/15 text-[#ffb240] border border-[#ffb240]/25' : 'bg-white/[0.04] text-white/30 border border-white/[0.06]'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb240]" />Media
            </button>
          </div>
          {/* Legend */}
          <div className="bg-[#0b1a1f]/90 border border-white/[0.06] rounded-xl p-2.5 backdrop-blur-xl hidden sm:block mt-1">
            <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1.5">Legend</p>
            {[
              { c: '#ff4d57', l: 'Confirmed / origin' },
              { c: '#ffb240', l: 'Media reported' },
              { c: '#38bdf8', l: 'Treatment / response' },
              { c: '#a78bfa', l: 'Evacuation' },
            ].map(i => (
              <div key={i.l} className="flex items-center gap-1.5 py-[2px]">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i.c }} />
                <span className="text-[9px] text-white/50">{i.l}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 py-[2px] mt-0.5 border-t border-white/[0.04] pt-1">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 border border-dashed border-white/30" />
              <span className="text-[9px] text-white/50">Approximate</span>
            </div>
          </div>
        </div>

        {/* ── Right panel: overview stats (desktop only, not for selected marker) ── */}
        <div className="absolute top-14 right-3 hidden sm:block pointer-events-auto" style={{ width: '260px' }}>
          <div className="bg-[#0b1a1f]/90 border border-white/[0.06] rounded-2xl p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-white/70 mb-3">Hantavirus overview</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <div className="text-[7px] text-white/25 uppercase tracking-wider">Confirmed</div>
                <div className="text-lg font-bold text-[#ff4d57] tabular-nums">{hasConfirmed ? totalConfirmed : '-'}</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <div className="text-[7px] text-white/25 uppercase tracking-wider">Deaths</div>
                <div className="text-lg font-bold text-white/80 tabular-nums">{hasDeaths ? totalDeaths : '-'}</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <div className="text-[7px] text-white/25 uppercase tracking-wider">Locations</div>
                <div className="text-lg font-bold text-[#38bdf8] tabular-nums">{filteredReports.length}</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-2.5">
                <div className="text-[7px] text-white/25 uppercase tracking-wider">Media</div>
                <div className="text-lg font-bold text-[#ffb240] tabular-nums">{filteredMedia.length}</div>
              </div>
            </div>
            <p className="text-[8px] text-white/20">Click a marker for details. Media signals are not confirmed cases.</p>
          </div>
        </div>

        {/* ── Bottom rail ── */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto safe-bottom">
          <div className="px-3 pb-3">
            {/* Timeline player */}
            {timelineOpen && dayList.length > 1 && (
              <div className="mb-2 sm:mr-[296px]">
                <div className="bg-[#0b1a1f]/90 border border-white/[0.06] rounded-xl px-3 py-2 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <button onClick={() => stepDay(-1)} className="text-white/40 hover:text-white/70 p-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={togglePlay} className="w-6 h-6 rounded-full bg-[#28d7c2]/20 text-[#28d7c2] flex items-center justify-center hover:bg-[#28d7c2]/30 transition-colors">
                      {playing
                        ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      }
                    </button>
                    <button onClick={() => stepDay(1)} className="text-white/40 hover:text-white/70 p-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    <input type="range" min={0} max={dayList.length - 1} value={currentDayIdx >= 0 ? currentDayIdx : dayList.length - 1} onChange={handleSlider} className="flex-1 h-1 accent-[#28d7c2] bg-white/[0.06] rounded-full cursor-pointer" />
                    <span className="text-[10px] text-white/50 font-mono tabular-nums w-20 text-right">{effectiveDay}</span>
                    <button onClick={() => { setPlaybackDay(null); setPlaying(false) }} className="text-[9px] text-white/30 hover:text-white/50 px-1.5 py-0.5 rounded border border-white/[0.06]">Live</button>
                  </div>
                </div>
              </div>
            )}
            {/* Metrics bar */}
            <div className="sm:mr-[296px]">
              <div className="bg-[#0b1a1f]/90 border border-white/[0.06] rounded-xl backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
                    {[
                      { v: hasConfirmed ? totalConfirmed : '-', l: 'Confirmed', c: '#ff4d57' },
                      { v: hasDeaths ? totalDeaths : '-', l: 'Deaths', c: 'rgba(255,255,255,0.85)' },
                      { v: filteredReports.length, l: 'Locations', c: '#38bdf8' },
                      { v: filteredMedia.length, l: 'Media', c: '#ffb240' },
                    ].map((m, i) => (
                      <div key={i} className="text-center flex-shrink-0">
                        <div className="text-sm font-bold tabular-nums" style={{ color: m.c }}>{m.v}</div>
                        <div className="text-[7px] text-white/25 uppercase tracking-widest">{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/[0.03] px-3 py-1 flex items-center justify-between">
                  <p className="text-[8px] text-white/20">Sources: WHO, ECDC, CDC, media. Media signals are not confirmed cases.</p>
                  {lastChecked && <p className="text-[8px] text-white/20 hidden sm:block font-mono">{new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredReports.length === 0 && filteredMedia.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="bg-[#0b1a1f]/90 border border-white/[0.08] rounded-2xl px-6 py-5 backdrop-blur-xl text-center max-w-xs">
              <p className="text-sm font-medium text-white/80">Monitoring active</p>
              <p className="text-[10px] text-white/30 mt-1">{playbackDay ? `No reports before ${playbackDay}` : 'No Hantavirus reports published yet.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

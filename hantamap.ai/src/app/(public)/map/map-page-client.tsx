'use client'

import { useState, useMemo, useCallback } from 'react'
import { DynamicIntelMap } from '@/components/map/dynamic-intel-map'
import Link from 'next/link'

interface MapPageClientProps {
  reports: any[]
  mediaItems: any[]
  lastChecked: string | null
}

function fmtDate(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

function dayStr(d: Date) { return d.toISOString().slice(0, 10) }

export function MapPageClient({ reports, mediaItems, lastChecked }: MapPageClientProps) {
  const [showOfficial, setShowOfficial] = useState(true)
  const [showMedia, setShowMedia] = useState(true)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [playbackDay, setPlaybackDay] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  const allDates = useMemo(() => {
    const dates: Date[] = []
    reports.forEach((r: any) => { const d = fmtDate(r.report_date || r.created_at); if (d) dates.push(d) })
    mediaItems.forEach((m: any) => { const d = fmtDate(m.published_at); if (d) dates.push(d) })
    dates.sort((a, b) => a.getTime() - b.getTime())
    return dates
  }, [reports, mediaItems])

  const minDate = allDates.length > 0 ? allDates[0] : new Date()
  const maxDate = allDates.length > 0 ? allDates[allDates.length - 1] : new Date()

  const dayList = useMemo(() => {
    const days: string[] = []
    const cur = new Date(minDate)
    while (cur <= maxDate) { days.push(dayStr(cur)); cur.setDate(cur.getDate() + 1) }
    if (days.length === 0) days.push(dayStr(new Date()))
    return days
  }, [minDate, maxDate])

  const currentDayIdx = playbackDay ? dayList.indexOf(playbackDay) : dayList.length - 1
  const effectiveDay = playbackDay || dayList[dayList.length - 1]

  const filteredReports = useMemo(() => {
    if (!playbackDay) return reports
    return reports.filter((r: any) => { const d = r.report_date || r.created_at; return d && d.slice(0, 10) <= playbackDay })
  }, [reports, playbackDay])

  const filteredMedia = useMemo(() => {
    if (!playbackDay) return mediaItems
    return mediaItems.filter((m: any) => m.published_at && m.published_at.slice(0, 10) <= playbackDay)
  }, [mediaItems, playbackDay])

  const visibleReports = showOfficial ? filteredReports : []
  const visibleMedia = showMedia ? filteredMedia : []

  const caseReports = filteredReports.filter((r: any) => r.counts_as_case !== false)
  const totalConfirmed = caseReports.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const totalDeaths = caseReports.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasConfirmed = caseReports.some((r: any) => r.confirmed_cases !== null)
  const hasDeaths = caseReports.some((r: any) => r.deaths !== null)

  const stepDay = useCallback((dir: number) => {
    setPlaybackDay(dayList[Math.max(0, Math.min(dayList.length - 1, currentDayIdx + dir))])
  }, [currentDayIdx, dayList])

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaybackDay(dayList[parseInt(e.target.value)])
  }, [dayList])

  const togglePlay = useCallback(() => {
    if (playing) { setPlaying(false); return }
    setPlaying(true)
    if (currentDayIdx >= dayList.length - 1) setPlaybackDay(dayList[0])
  }, [playing, currentDayIdx, dayList])

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

  // Panel background
  const P = 'bg-[#06131799] backdrop-blur-md border border-white/[0.06]'

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ background: '#02090b', zIndex: 10 }}>

      {/* Map: MapLibre GL vector map */}
      <div className="absolute inset-0">
        <DynamicIntelMap reports={visibleReports} mediaItems={visibleMedia} />
      </div>

      {/* Vignette overlay for depth */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(2,9,11,0.35) 100%)', zIndex: 999 }} />

      {/* All controls */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>

        {/* ═══ TOP COMMAND BAR ═══ */}
        <div className="absolute top-0 left-0 right-0 pointer-events-auto">
          <div className={`${P} border-t-0 border-x-0 rounded-none`}>
            <div className="flex items-center justify-between h-11 px-4">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-6 h-6 rounded-md bg-[#28d7c2] flex items-center justify-center">
                    <span className="text-[#02090b] text-[10px] font-black">H</span>
                  </div>
                  <span className="text-[11px] font-bold text-white/80 tracking-tight hidden sm:block group-hover:text-white/100 transition-colors">HantaMap</span>
                </Link>
                <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />
                <Link href="/" className="text-[10px] text-white/35 hover:text-white/60 transition-colors flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Overview
                </Link>
                <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28d7c2] animate-pulse" />
                  <span className="text-[9px] text-white/35 uppercase tracking-wider">Active monitoring</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTimelineOpen(!timelineOpen)} className={`text-[9px] font-semibold px-2.5 py-1 rounded-md transition-all ${timelineOpen ? 'bg-[#28d7c2]/15 text-[#28d7c2]' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'}`}>
                  Timeline
                </button>
                <div className="h-4 w-px bg-white/[0.06]" />
                {lastChecked && <span className="text-[8px] text-white/25 font-mono hidden sm:block">{new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</span>}
                <Link href="/login" className="text-[9px] text-white/35 hover:text-white/60 transition-colors font-medium">Sign in</Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ LEFT: LAYERS + LEGEND ═══ */}
        <div className="absolute top-[52px] left-3 flex flex-col gap-2 pointer-events-auto">
          <div className={`${P} rounded-lg p-1.5 flex flex-col gap-1`}>
            <button onClick={() => setShowOfficial(!showOfficial)} className={`flex items-center gap-1.5 text-[9px] font-semibold px-2.5 py-[6px] rounded-md transition-all ${showOfficial ? 'bg-[#ff4d57]/12 text-[#ff4d57]' : 'text-white/25 hover:text-white/50 hover:bg-white/[0.03]'}`}>
              <span className={`w-2 h-2 rounded-full ${showOfficial ? 'bg-[#ff4d57]' : 'bg-white/20'}`} />
              Official verified
            </button>
            <button onClick={() => setShowMedia(!showMedia)} className={`flex items-center gap-1.5 text-[9px] font-semibold px-2.5 py-[6px] rounded-md transition-all ${showMedia ? 'bg-[#ffb240]/12 text-[#ffb240]' : 'text-white/25 hover:text-white/50 hover:bg-white/[0.03]'}`}>
              <span className={`w-2 h-2 rounded-full ${showMedia ? 'bg-[#ffb240]' : 'bg-white/20'}`} />
              Media monitoring
            </button>
          </div>

          {/* Legend */}
          <div className={`${P} rounded-lg p-3 hidden sm:block`}>
            <p className="text-[7px] text-white/25 uppercase tracking-[0.15em] mb-2 font-semibold">Signal legend</p>
            {[
              { c: '#ff4d57', l: 'Confirmed / outbreak origin' },
              { c: '#ffb240', l: 'Media reported (unverified)' },
              { c: '#38bdf8', l: 'Treatment / response' },
              { c: '#a78bfa', l: 'Evacuation' },
            ].map(i => (
              <div key={i.l} className="flex items-center gap-2 py-[3px]">
                <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: i.c, boxShadow: `0 0 6px ${i.c}60` }} />
                <span className="text-[9px] text-white/40">{i.l}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 py-[3px] mt-1 border-t border-white/[0.04] pt-1.5">
              <span className="w-[6px] h-[6px] rounded-full flex-shrink-0 border border-dashed border-white/25" />
              <span className="text-[9px] text-white/40">Approximate location</span>
            </div>
            <p className="text-[8px] text-white/15 mt-2 leading-relaxed">Media signals are not confirmed cases.</p>
          </div>
        </div>

        {/* ═══ RIGHT: OVERVIEW PANEL (desktop) ═══ */}
        <div className="absolute top-[52px] right-3 hidden sm:block pointer-events-auto" style={{ width: '240px' }}>
          <div className={`${P} rounded-lg p-3.5`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Hantavirus status</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d57] animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v: hasConfirmed ? totalConfirmed : '-', l: 'Confirmed cases', c: '#ff4d57' },
                { v: hasDeaths ? totalDeaths : '-', l: 'Official deaths', c: 'rgba(255,255,255,0.75)' },
                { v: filteredReports.length, l: 'Mapped locations', c: '#38bdf8' },
                { v: filteredMedia.length, l: 'Media signals', c: '#ffb240' },
              ].map((m, i) => (
                <div key={i} className="bg-white/[0.025] rounded-md p-2.5">
                  <div className="text-lg font-bold tabular-nums leading-none" style={{ color: m.c }}>{m.v}</div>
                  <div className="text-[7px] text-white/20 uppercase tracking-wider mt-1.5 leading-tight">{m.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/[0.04]">
              <p className="text-[8px] text-white/20 leading-relaxed">Sources: WHO, ECDC, CDC, media monitoring. Click a marker for details.</p>
            </div>
          </div>
        </div>

        {/* Media banner */}
        {reports.length === 0 && mediaItems.length > 0 && (
          <div className="absolute top-[52px] left-1/2 -translate-x-1/2 pointer-events-auto hidden sm:block">
            <div className="bg-[#ffb240]/8 border border-[#ffb240]/15 rounded-md px-3 py-1.5 backdrop-blur-xl">
              <p className="text-[9px] text-[#ffb240]/80">Media monitoring active. Reports are awaiting official confirmation.</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredReports.length === 0 && filteredMedia.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className={`${P} rounded-xl px-6 py-5 text-center max-w-xs`}>
              <p className="text-sm font-medium text-white/70">Monitoring active</p>
              <p className="text-[10px] text-white/25 mt-1">{playbackDay ? `No reports before ${playbackDay}` : 'No Hantavirus reports published yet.'}</p>
            </div>
          </div>
        )}

        {/* ═══ BOTTOM: TIMELINE + METRICS ═══ */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto safe-bottom">
          <div className="px-3 pb-3">
            {/* Timeline */}
            {timelineOpen && dayList.length > 1 && (
              <div className="mb-1.5 sm:mr-[256px]">
                <div className={`${P} rounded-lg px-3 py-2`}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => stepDay(-1)} className="text-white/30 hover:text-white/60 p-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={togglePlay} className="w-6 h-6 rounded-full bg-[#28d7c2]/15 text-[#28d7c2] flex items-center justify-center hover:bg-[#28d7c2]/25 transition-colors flex-shrink-0">
                      {playing
                        ? <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    </button>
                    <button onClick={() => stepDay(1)} className="text-white/30 hover:text-white/60 p-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    <input type="range" min={0} max={dayList.length - 1} value={currentDayIdx >= 0 ? currentDayIdx : dayList.length - 1} onChange={handleSlider} className="flex-1 h-[3px] accent-[#28d7c2] bg-white/[0.06] rounded-full cursor-pointer" />
                    <span className="text-[9px] text-white/40 font-mono tabular-nums w-[72px] text-right">{effectiveDay}</span>
                    <button onClick={() => { setPlaybackDay(null); setPlaying(false) }} className={`text-[8px] font-semibold px-1.5 py-0.5 rounded transition-colors ${!playbackDay ? 'bg-[#28d7c2]/15 text-[#28d7c2]' : 'text-white/25 hover:text-white/50 border border-white/[0.06]'}`}>LIVE</button>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics rail */}
            <div className="sm:mr-[256px]">
              <div className={`${P} rounded-lg overflow-hidden`}>
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-4 overflow-x-auto">
                    {[
                      { v: hasConfirmed ? totalConfirmed : '-', l: 'Confirmed cases', c: '#ff4d57' },
                      { v: hasDeaths ? totalDeaths : '-', l: 'Deaths', c: 'rgba(255,255,255,0.8)' },
                      { v: filteredReports.length, l: 'Locations', c: '#38bdf8' },
                      { v: caseReports.length, l: 'Official reports', c: 'rgba(255,255,255,0.5)' },
                      { v: filteredMedia.length, l: 'Media signals', c: '#ffb240' },
                    ].map((m, i) => (
                      <div key={i} className="text-center flex-shrink-0">
                        <div className="text-sm font-bold tabular-nums leading-none" style={{ color: m.c }}>{m.v}</div>
                        <div className="text-[6px] text-white/20 uppercase tracking-[0.12em] mt-1">{m.l}</div>
                      </div>
                    ))}
                  </div>
                  {lastChecked && <span className="text-[7px] text-white/15 font-mono hidden sm:block flex-shrink-0 ml-3">{new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</span>}
                </div>
                <div className="border-t border-white/[0.03] px-3 py-1">
                  <p className="text-[7px] text-white/15">Sources: WHO, ECDC, CDC, media monitoring. Media signals are not confirmed cases. Not medical advice.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { DynamicIntelMap } from '@/components/map/dynamic-intel-map'
import Link from 'next/link'

interface Props { reports: any[]; mediaItems: any[]; lastChecked: string | null }

function parseDate(iso: string | null) { if (!iso) return null; const d = new Date(iso); return isNaN(d.getTime()) ? null : d }
function dayStr(d: Date) { return d.toISOString().slice(0, 10) }

const INSET = 'left-5 right-5 sm:left-6 sm:right-6'

export function MapPageClient({ reports, mediaItems, lastChecked }: Props) {
  const [showOfficial, setShowOfficial] = useState(true)
  const [showMedia, setShowMedia] = useState(true)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [playbackDay, setPlaybackDay] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  // Timeline
  const allDates = useMemo(() => {
    const d: Date[] = []
    reports.forEach((r: any) => { const x = parseDate(r.report_date || r.created_at); if (x) d.push(x) })
    mediaItems.forEach((m: any) => { const x = parseDate(m.published_at); if (x) d.push(x) })
    d.sort((a, b) => a.getTime() - b.getTime())
    return d
  }, [reports, mediaItems])

  const dayList = useMemo(() => {
    if (allDates.length === 0) return [dayStr(new Date())]
    const min = allDates[0], max = allDates[allDates.length - 1]
    const days: string[] = []
    const cur = new Date(min)
    while (cur <= max) { days.push(dayStr(cur)); cur.setDate(cur.getDate() + 1) }
    return days.length > 0 ? days : [dayStr(new Date())]
  }, [allDates])

  const curIdx = playbackDay ? dayList.indexOf(playbackDay) : dayList.length - 1
  const curDay = playbackDay || dayList[dayList.length - 1]

  const filtered = useMemo(() => {
    if (!playbackDay) return reports
    return reports.filter((r: any) => { const d = r.report_date || r.created_at; return d && d.slice(0, 10) <= playbackDay })
  }, [reports, playbackDay])

  const filteredMedia = useMemo(() => {
    if (!playbackDay) return mediaItems
    return mediaItems.filter((m: any) => m.published_at && m.published_at.slice(0, 10) <= playbackDay)
  }, [mediaItems, playbackDay])

  const vis = showOfficial ? filtered : []
  const visMedia = showMedia ? filteredMedia : []

  const cases = filtered.filter((r: any) => r.counts_as_case !== false)
  const confirmed = cases.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const deaths = cases.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasC = cases.some((r: any) => r.confirmed_cases !== null)
  const hasD = cases.some((r: any) => r.deaths !== null)

  const step = useCallback((dir: number) => { setPlaybackDay(dayList[Math.max(0, Math.min(dayList.length - 1, curIdx + dir))]) }, [curIdx, dayList])
  const togglePlay = useCallback(() => { if (playing) { setPlaying(false); return }; setPlaying(true); if (curIdx >= dayList.length - 1) setPlaybackDay(dayList[0]) }, [playing, curIdx, dayList])
  const resetView = useCallback(() => { if (typeof window !== 'undefined' && (window as any).__hantamap_reset) (window as any).__hantamap_reset() }, [])

  useEffect(() => {
    if (!playing) return
    const iv = setInterval(() => {
      setPlaybackDay(prev => {
        const i = prev ? dayList.indexOf(prev) : 0
        if (i >= dayList.length - 1) { setPlaying(false); return dayList[dayList.length - 1] }
        return dayList[i + 1]
      })
    }, 500)
    return () => clearInterval(iv)
  }, [playing, dayList])

  // Panel style
  const P = 'bg-[#06131799] backdrop-blur-md border border-white/[0.06] rounded-lg'

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ background: '#02090b', zIndex: 10 }}>
      {/* Map */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <DynamicIntelMap reports={vis} mediaItems={visMedia} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(2,9,11,0.3) 100%)', zIndex: 1 }} />

      {/* Controls */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>

        {/* ── TOP BAR ── */}
        <div className={`absolute top-0 ${INSET} pointer-events-auto`}>
          <div className={`${P} rounded-none sm:rounded-b-lg border-t-0 mt-0`}>
            <div className="flex items-center justify-between h-11 px-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-6 h-6 rounded-md bg-[#28d7c2] flex items-center justify-center"><span className="text-[#02090b] text-[10px] font-black">H</span></div>
                  <span className="text-[11px] font-bold text-white/80 tracking-tight hidden sm:block">HantaMap</span>
                </Link>
                <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />
                <Link href="/" className="text-[10px] text-white/35 hover:text-white/60 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Overview
                </Link>
                <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#28d7c2] animate-pulse" />
                  <span className="text-[8px] text-white/30 uppercase tracking-wider">Active monitoring</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setTimelineOpen(!timelineOpen)} className={`text-[9px] font-semibold px-2.5 py-1 rounded-md transition-all ${timelineOpen ? 'bg-[#28d7c2]/15 text-[#28d7c2]' : 'text-white/35 hover:text-white/55 hover:bg-white/[0.04]'}`}>Timeline</button>
                {lastChecked && <span className="text-[8px] text-white/20 font-mono hidden sm:block">{new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC</span>}
                <div className="h-4 w-px bg-white/[0.06]" />
                <Link href="/login" className="text-[9px] text-white/35 hover:text-white/60 font-medium">Sign in</Link>
                <Link href="/login" className="text-[9px] font-semibold px-2.5 py-1 rounded-md bg-[#28d7c2]/15 text-[#28d7c2] hover:bg-[#28d7c2]/25 transition-colors hidden sm:block">Create account</Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── LEFT: LAYERS + LEGEND ── */}
        <div className="absolute top-[52px] left-5 sm:left-6 flex flex-col gap-2 pointer-events-auto" style={{ width: '160px' }}>
          <div className={`${P} p-1.5 flex flex-col gap-1`}>
            <button onClick={() => setShowOfficial(!showOfficial)} className={`flex items-center gap-1.5 text-[9px] font-semibold px-2.5 py-[6px] rounded-md transition-all ${showOfficial ? 'bg-[#ff4d57]/12 text-[#ff4d57]' : 'text-white/25 hover:bg-white/[0.03]'}`}>
              <span className={`w-2 h-2 rounded-full ${showOfficial ? 'bg-[#ff4d57]' : 'bg-white/20'}`} />Official verified
            </button>
            <button onClick={() => setShowMedia(!showMedia)} className={`flex items-center gap-1.5 text-[9px] font-semibold px-2.5 py-[6px] rounded-md transition-all ${showMedia ? 'bg-[#ffb240]/12 text-[#ffb240]' : 'text-white/25 hover:bg-white/[0.03]'}`}>
              <span className={`w-2 h-2 rounded-full ${showMedia ? 'bg-[#ffb240]' : 'bg-white/20'}`} />Media monitoring
            </button>
          </div>
          <div className={`${P} p-3 hidden sm:block`}>
            <p className="text-[7px] text-white/25 uppercase tracking-[0.15em] mb-2 font-semibold">Signal legend</p>
            {[
              { c: '#ff4d57', l: 'Confirmed / origin' },
              { c: '#ffb240', l: 'Media reported' },
              { c: '#38bdf8', l: 'Treatment / response' },
              { c: '#a78bfa', l: 'Evacuation' },
            ].map(i => (
              <div key={i.l} className="flex items-center gap-2 py-[3px]">
                <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: i.c, boxShadow: `0 0 6px ${i.c}50` }} />
                <span className="text-[8px] text-white/40">{i.l}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 py-[3px] mt-1 border-t border-white/[0.04] pt-1.5">
              <span className="w-[6px] h-[6px] rounded-full border border-dashed border-white/25 flex-shrink-0" />
              <span className="text-[8px] text-white/40">Approximate</span>
            </div>
            <p className="text-[7px] text-white/15 mt-2">Media signals are not confirmed cases.</p>
          </div>
        </div>

        {/* ── RIGHT: MAP CONTROLS + OVERVIEW ── */}
        <div className="absolute top-[52px] right-5 sm:right-6 flex flex-col gap-2 pointer-events-auto items-end">
          {/* Controls */}
          <div className={`${P} p-1 flex flex-col gap-0.5`}>
            <button onClick={() => mapCtrl('zoomIn')} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded text-sm font-bold">+</button>
            <div className="h-px bg-white/[0.04]" />
            <button onClick={() => mapCtrl('zoomOut')} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded text-sm font-bold leading-none" style={{ paddingBottom: '2px' }}>-</button>
            <div className="h-px bg-white/[0.04]" />
            <button onClick={resetView} className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded" title="Reset world view">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
            </button>
          </div>
          {/* Overview panel (desktop) */}
          <div className={`${P} p-3.5 hidden sm:block`} style={{ width: '220px' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Status</h3>
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d57] animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v: hasC ? confirmed : '-', l: 'Confirmed', c: '#ff4d57' },
                { v: hasD ? deaths : '-', l: 'Deaths', c: 'rgba(255,255,255,0.7)' },
                { v: filtered.length, l: 'Locations', c: '#38bdf8' },
                { v: filteredMedia.length, l: 'Media', c: '#ffb240' },
              ].map((m, i) => (
                <div key={i} className="bg-white/[0.025] rounded-md p-2">
                  <div className="text-base font-bold tabular-nums leading-none" style={{ color: m.c }}>{m.v}</div>
                  <div className="text-[6px] text-white/20 uppercase tracking-wider mt-1">{m.l}</div>
                </div>
              ))}
            </div>
            <p className="text-[7px] text-white/15 mt-2.5">Click a marker for details.</p>
          </div>
        </div>

        {/* ── BOTTOM: TIMELINE + METRICS ── */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-auto safe-bottom flex justify-center">
          <div className="w-full max-w-[840px] px-4 pb-3">
            {/* Timeline */}
            {timelineOpen && dayList.length > 1 && (
              <div className="mb-1.5">
                <div className={`${P} px-3 py-2`}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => step(-1)} className="text-white/30 hover:text-white/60 p-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={togglePlay} className="w-6 h-6 rounded-full bg-[#28d7c2]/15 text-[#28d7c2] flex items-center justify-center hover:bg-[#28d7c2]/25 flex-shrink-0">
                      {playing ? <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                        : <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
                    </button>
                    <button onClick={() => step(1)} className="text-white/30 hover:text-white/60 p-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    <input type="range" min={0} max={dayList.length - 1} value={curIdx >= 0 ? curIdx : dayList.length - 1} onChange={e => setPlaybackDay(dayList[parseInt(e.target.value)])} className="flex-1 h-[3px] accent-[#28d7c2] bg-white/[0.06] rounded-full cursor-pointer" />
                    <span className="text-[9px] text-white/40 font-mono tabular-nums w-[72px] text-right">{curDay}</span>
                    <button onClick={() => { setPlaybackDay(null); setPlaying(false) }} className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${!playbackDay ? 'bg-[#28d7c2]/15 text-[#28d7c2]' : 'text-white/25 hover:text-white/45 border border-white/[0.06]'}`}>LIVE</button>
                  </div>
                  <p className="text-[7px] text-white/15 mt-1">Timeline uses available source timestamps.</p>
                </div>
              </div>
            )}
            {/* Metrics rail */}
            <div className={`${P} overflow-hidden`}>
              <div className="flex items-center justify-center px-4 py-2.5 gap-5 overflow-x-auto">
                {[
                  { v: hasC ? confirmed : '-', l: 'Confirmed cases', c: '#ff4d57' },
                  { v: hasD ? deaths : '-', l: 'Deaths', c: 'rgba(255,255,255,0.8)' },
                  { v: filtered.length, l: 'Locations', c: '#38bdf8' },
                  { v: cases.length, l: 'Official reports', c: 'rgba(255,255,255,0.5)' },
                  { v: filteredMedia.length, l: 'Media signals', c: '#ffb240' },
                ].map((m, i) => (
                  <div key={i} className="text-center flex-shrink-0">
                    <div className="text-sm font-bold tabular-nums leading-none" style={{ color: m.c }}>{m.v}</div>
                    <div className="text-[6px] text-white/20 uppercase tracking-[0.1em] mt-1">{m.l}</div>
                  </div>
                ))}
                {lastChecked && <div className="text-[7px] text-white/15 font-mono hidden sm:block flex-shrink-0 ml-2">{new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>}
              </div>
              <div className="border-t border-white/[0.03] px-4 py-1 text-center">
                <p className="text-[7px] text-white/15">Sources: WHO, ECDC, CDC, media. Media signals are not confirmed cases.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && filteredMedia.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className={`${P} px-6 py-5 text-center max-w-xs`}>
              <p className="text-sm font-medium text-white/70">Monitoring active</p>
              <p className="text-[10px] text-white/25 mt-1">{playbackDay ? `No reports before ${playbackDay}` : 'No Hantavirus reports published yet.'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function mapCtrl(action: string) {
  if (typeof window === 'undefined') return
  const w = window as any
  if (action === 'zoomIn') w.__hantamap_zoomIn?.()
  if (action === 'zoomOut') w.__hantamap_zoomOut?.()
}

'use client'

import { useState } from 'react'

interface MapControlsProps {
  officialCount: number
  mediaCount: number
  hasOfficialData: boolean
  onToggleOfficial: (on: boolean) => void
  onToggleMedia: (on: boolean) => void
  defaultShowOfficial: boolean
  defaultShowMedia: boolean
  lastChecked: string | null
}

export function MapControls({
  officialCount,
  mediaCount,
  hasOfficialData,
  onToggleOfficial,
  onToggleMedia,
  defaultShowOfficial,
  defaultShowMedia,
  lastChecked,
}: MapControlsProps) {
  const [showOfficial, setShowOfficial] = useState(defaultShowOfficial)
  const [showMedia, setShowMedia] = useState(defaultShowMedia)

  function handleToggleOfficial() {
    const next = !showOfficial
    setShowOfficial(next)
    onToggleOfficial(next)
  }

  function handleToggleMedia() {
    const next = !showMedia
    setShowMedia(next)
    onToggleMedia(next)
  }

  const formattedTime = lastChecked
    ? new Date(lastChecked).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown'

  return (
    <>
      {/* Layer toggle panel */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/95 border border-slate-700 rounded-md px-3 py-2.5 min-w-[180px]">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Layers</div>

        <label className="flex items-center gap-2 cursor-pointer mb-1.5">
          <input
            type="checkbox"
            checked={showOfficial}
            onChange={handleToggleOfficial}
            className="w-3 h-3 accent-red-600 rounded-sm"
          />
          <span className="flex items-center gap-1.5 text-xs text-slate-200">
            <span className="w-2 h-2 rounded-full bg-red-600 border border-white/60 flex-shrink-0" />
            Official verified
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showMedia}
            onChange={handleToggleMedia}
            className="w-3 h-3 accent-amber-500 rounded-sm"
          />
          <span className="flex items-center gap-1.5 text-xs text-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 border border-dashed border-white/60 flex-shrink-0" />
            Media monitoring
          </span>
        </label>

        {/* Legend */}
        <div className="border-t border-slate-700 mt-2.5 pt-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Legend</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 border border-white/80 flex-shrink-0" />
            Verified report
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 border border-dashed border-white/60 flex-shrink-0" />
            Media report (unverified)
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="w-3 h-3 rounded-full bg-red-600/10 border border-red-600/30 flex-shrink-0" />
            Approximate location
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-slate-900/95 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>{officialCount} verified report{officialCount !== 1 ? 's' : ''}</span>
          <span className="text-slate-600">|</span>
          <span>{mediaCount} media item{mediaCount !== 1 ? 's' : ''}</span>
        </div>
        <div>
          Last checked: {formattedTime}
        </div>
      </div>

      {/* Media-only banner */}
      {!hasOfficialData && mediaCount > 0 && (
        <div className="absolute top-3 left-3 right-[200px] z-[1000] bg-amber-900/80 border border-amber-700/60 rounded-md px-3 py-2 text-xs text-amber-200">
          Media monitoring layer: reports are awaiting official confirmation by health authorities.
        </div>
      )}
    </>
  )
}

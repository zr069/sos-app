'use client'

import { useState, useCallback } from 'react'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'
import { MapControls } from './map-filters'

interface MapPageClientProps {
  reports: any[]
  mediaItems: any[]
  lastChecked: string | null
}

export function MapPageClient({ reports, mediaItems, lastChecked }: MapPageClientProps) {
  const hasOfficialData = reports.length > 0
  const [showOfficial, setShowOfficial] = useState(true)
  const [showMedia, setShowMedia] = useState(!hasOfficialData && mediaItems.length > 0 ? true : true)

  const handleToggleOfficial = useCallback((on: boolean) => setShowOfficial(on), [])
  const handleToggleMedia = useCallback((on: boolean) => setShowMedia(on), [])

  const visibleReports = showOfficial ? reports : []
  const visibleMedia = showMedia ? mediaItems : []

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] bg-slate-900">
      <div className="flex-1 relative">
        <MapView
          reports={visibleReports}
          mediaItems={visibleMedia}
          height="100%"
          interactive={true}
          showMedia={showMedia}
        />
        <MapControls
          officialCount={reports.length}
          mediaCount={mediaItems.length}
          hasOfficialData={hasOfficialData}
          onToggleOfficial={handleToggleOfficial}
          onToggleMedia={handleToggleMedia}
          defaultShowOfficial={true}
          defaultShowMedia={true}
          lastChecked={lastChecked}
        />
      </div>
    </div>
  )
}

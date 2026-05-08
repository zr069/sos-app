'use client'

import dynamic from 'next/dynamic'

export const DynamicMap = dynamic<any>(
  () => import('@/components/map/map-view').then(m => ({ default: m.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-slate-100 rounded border border-slate-200 flex items-center justify-center" style={{ height: '400px' }}>
        <p className="text-xs text-slate-400">Loading map...</p>
      </div>
    ),
  }
)

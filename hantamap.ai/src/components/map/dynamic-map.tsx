'use client'

import dynamic from 'next/dynamic'

export const DynamicMap = dynamic<any>(
  () => import('@/components/map/map-view').then(m => ({ default: m.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full bg-[var(--bg-primary)] flex items-center justify-center" style={{ height: '100%', minHeight: '300px' }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-teal)]/30 border-t-[var(--accent-teal)] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[var(--text-muted)]">Loading map</p>
        </div>
      </div>
    ),
  }
)

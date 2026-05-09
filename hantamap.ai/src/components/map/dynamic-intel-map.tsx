'use client'

import dynamic from 'next/dynamic'

export const DynamicIntelMap = dynamic<any>(
  () => import('@/components/map/intel-map').then(m => ({ default: m.IntelMap })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#02090b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#28d7c2]/30 border-t-[#28d7c2] animate-spin mx-auto mb-3" />
          <p className="text-[10px] text-white/25 uppercase tracking-widest">Loading map</p>
        </div>
      </div>
    ),
  }
)

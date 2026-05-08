import { MetricCard } from '@/components/ui/metric-card'
import { VerificationBadge } from '@/components/ui/verification-badge'
import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo',
  description: 'Demo page with sample data. This is not real outbreak data.',
  robots: 'noindex',
}

const demoReports = [
  {
    id: 'demo-1',
    outbreak_id: 'demo-outbreak',
    location_id: 'demo-loc-1',
    status: 'confirmed',
    confirmed_cases: 47,
    probable_cases: 12,
    suspected_cases: null,
    deaths: 3,
    recovered: 31,
    report_date: '2025-01-15T00:00:00Z',
    verification_status: 'verified' as const,
    editor_note: 'Demo data only',
    published: true,
    created_at: '',
    updated_at: '',
    outbreak: {
      id: 'demo-outbreak',
      slug: 'demo-outbreak',
      name: 'Demo Outbreak',
      pathogen_name: null,
      summary: null,
      status: 'active' as const,
      transmission_notes: null,
      what_is_known: null,
      what_is_not_known: null,
      what_to_do: null,
      first_reported_at: null,
      last_reviewed_at: null,
      published: true,
      created_at: '',
      updated_at: '',
    },
    location: {
      id: 'demo-loc-1',
      country: 'Demo Country',
      region: 'Demo Region',
      city: 'Demo City',
      latitude: 48.85,
      longitude: 2.35,
      created_at: '',
    },
  },
  {
    id: 'demo-2',
    outbreak_id: 'demo-outbreak',
    location_id: 'demo-loc-2',
    status: 'probable',
    confirmed_cases: null,
    probable_cases: 8,
    suspected_cases: 15,
    deaths: null,
    recovered: null,
    report_date: '2025-01-18T00:00:00Z',
    verification_status: 'probable' as const,
    editor_note: 'Demo data only',
    published: true,
    created_at: '',
    updated_at: '',
    outbreak: {
      id: 'demo-outbreak',
      slug: 'demo-outbreak',
      name: 'Demo Outbreak',
      pathogen_name: null,
      summary: null,
      status: 'active' as const,
      transmission_notes: null,
      what_is_known: null,
      what_is_not_known: null,
      what_to_do: null,
      first_reported_at: null,
      last_reviewed_at: null,
      published: true,
      created_at: '',
      updated_at: '',
    },
    location: {
      id: 'demo-loc-2',
      country: 'Demo Country B',
      region: null,
      city: 'Demo Town',
      latitude: 51.5,
      longitude: -0.12,
      created_at: '',
    },
  },
  {
    id: 'demo-3',
    outbreak_id: 'demo-outbreak',
    location_id: 'demo-loc-3',
    status: 'suspected',
    confirmed_cases: null,
    probable_cases: null,
    suspected_cases: 5,
    deaths: null,
    recovered: null,
    report_date: '2025-01-20T00:00:00Z',
    verification_status: 'suspected' as const,
    editor_note: 'Demo data only',
    published: true,
    created_at: '',
    updated_at: '',
    outbreak: {
      id: 'demo-outbreak',
      slug: 'demo-outbreak',
      name: 'Demo Outbreak',
      pathogen_name: null,
      summary: null,
      status: 'active' as const,
      transmission_notes: null,
      what_is_known: null,
      what_is_not_known: null,
      what_to_do: null,
      first_reported_at: null,
      last_reviewed_at: null,
      published: true,
      created_at: '',
      updated_at: '',
    },
    location: {
      id: 'demo-loc-3',
      country: 'Demo Country C',
      region: 'Demo Province',
      city: null,
      latitude: 40.41,
      longitude: -3.7,
      created_at: '',
    },
  },
]

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="border border-amber-200 bg-amber-50 rounded p-4 mb-8">
        <p className="text-sm font-medium text-amber-800">
          Demo data, not real outbreak data.
        </p>
        <p className="text-xs text-amber-600 mt-1">
          The information on this page is fictional and for demonstration purposes only. It does not represent actual outbreak conditions.
        </p>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Demo dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Active outbreaks" value={1} subtitle="Demo data" />
        <MetricCard label="Reports" value={3} subtitle="Demo data" />
        <MetricCard label="Countries" value={3} subtitle="Demo data" />
        <MetricCard label="Sources" value={0} subtitle="Demo data" />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Demo map</h2>
        <MapView reports={demoReports as any} height="400px" interactive={true} />
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Demo reports</h2>
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Confirmed</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Deaths</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demoReports.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-slate-700">
                    {[r.location.city, r.location.region, r.location.country].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">
                    {r.confirmed_cases !== null ? r.confirmed_cases : 'Unknown'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">
                    {r.deaths !== null ? r.deaths : 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <VerificationBadge status={r.verification_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DisclaimerBox text="This is a demo page with fictional data. No real outbreak data is shown. HantaMap does not provide medical diagnosis or emergency medical advice." />
    </div>
  )
}

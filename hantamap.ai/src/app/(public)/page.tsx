import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/ui/metric-card'
import { UpdateCard } from '@/components/ui/update-card'
import { VerificationBadge } from '@/components/ui/verification-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import { DynamicMap as MapView } from '@/components/map/dynamic-map'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HantaMap.ai - Real-time Outbreak Tracking',
  description: 'Real-time outbreak tracking with verified sources. Understand global health risks through maps, verified updates and preparedness guidance.',
}

export const revalidate = 300

export default async function HomePage() {
  let outbreakCount = 0
  let reportCount = 0
  let countryCount = 0
  let updates: any[] = []
  let reports: any[] = []
  let recentReports: any[] = []

  try {
    const supabase = await createClient()

    const [outbreaksRes, reportsRes, updatesRes, reportsWithLocRes] = await Promise.all([
      supabase.from('outbreaks').select('id', { count: 'exact' }).eq('published', true),
      supabase.from('reports').select('id, location_id, locations(country)', { count: 'exact' }).eq('published', true),
      supabase.from('updates').select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)').eq('published', true).order('published_at', { ascending: false }).limit(5),
      supabase.from('reports').select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city, latitude, longitude)').eq('published', true).order('created_at', { ascending: false }).limit(50),
    ])

    outbreakCount = outbreaksRes.count || 0
    reportCount = reportsRes.count || 0

    // Count unique countries
    const countries = new Set<string>()
    reportsRes.data?.forEach((r: any) => {
      if (r.locations?.country) countries.add(r.locations.country)
    })
    countryCount = countries.size

    updates = updatesRes.data || []
    reports = reportsWithLocRes.data || []

    // Recent reports for table
    const recentRes = await supabase
      .from('reports')
      .select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)')
      .eq('published', true)
      .order('report_date', { ascending: false })
      .limit(10)
    recentReports = recentRes.data || []
  } catch {
    // Supabase not configured, show empty states
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight max-w-2xl">
            Real-time outbreak tracking with verified sources
          </h1>
          <p className="text-base md:text-lg text-slate-600 mt-4 max-w-2xl leading-relaxed">
            HantaMap helps people understand global health risks through maps, verified updates and calm preparedness guidance.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/map"
              className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-colors"
            >
              View live map
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Active outbreaks"
            value={outbreakCount || 'None tracked'}
            subtitle="Published and monitored"
          />
          <MetricCard
            label="Verified reports"
            value={reportCount || 'None yet'}
            subtitle="Source-backed data"
          />
          <MetricCard
            label="Countries affected"
            value={countryCount || 'None yet'}
            subtitle="With published reports"
          />
          <MetricCard
            label="Data sources"
            value="WHO, ECDC, CDC"
            subtitle="Prioritized hierarchy"
          />
        </div>
      </section>

      {/* Map Preview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Global overview</h2>
          <Link href="/map" className="text-xs text-slate-500 hover:text-slate-700">
            Open full map
          </Link>
        </div>
        <MapView reports={reports} height="400px" interactive={false} />
        {reports.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">No verified outbreak data available yet. Data will appear here once published by editors.</p>
        )}
      </section>

      {/* Latest Updates */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Latest verified updates</h2>
          <Link href="/updates" className="text-xs text-slate-500 hover:text-slate-700">
            View all
          </Link>
        </div>
        {updates.length > 0 ? (
          <div className="space-y-3">
            {updates.map((update: any) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No verified updates available yet"
            description="Updates will appear here once published with verified sources."
          />
        )}
      </section>

      {/* Affected Regions Table */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent reports by region</h2>
        {recentReports.length > 0 ? (
          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Outbreak</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirmed</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deaths</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReports.map((report: any) => (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">
                        {[report.location?.city, report.location?.region, report.location?.country].filter(Boolean).join(', ')}
                      </td>
                      <td className="px-4 py-3">
                        {report.outbreak ? (
                          <Link href={`/outbreaks/${report.outbreak.slug}`} className="text-slate-700 hover:text-slate-900">
                            {report.outbreak.name}
                          </Link>
                        ) : (
                          <span className="text-slate-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 tabular-nums">
                        {report.confirmed_cases !== null ? report.confirmed_cases : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 tabular-nums">
                        {report.deaths !== null ? report.deaths : 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        <VerificationBadge status={report.verification_status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {report.report_date
                          ? new Date(report.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No reports available yet"
            description="Regional outbreak data will be shown here once published."
          />
        )}
      </section>

      {/* Source Explanation + Verification */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-slate-200 rounded p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Source hierarchy</h3>
            <ol className="space-y-1.5 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-xs text-slate-400 tabular-nums w-4">1.</span> WHO</li>
              <li className="flex gap-2"><span className="text-xs text-slate-400 tabular-nums w-4">2.</span> ECDC</li>
              <li className="flex gap-2"><span className="text-xs text-slate-400 tabular-nums w-4">3.</span> CDC</li>
              <li className="flex gap-2"><span className="text-xs text-slate-400 tabular-nums w-4">4.</span> National health ministries</li>
              <li className="flex gap-2"><span className="text-xs text-slate-400 tabular-nums w-4">5.</span> Regional health authorities</li>
              <li className="flex gap-2"><span className="text-xs text-slate-400 tabular-nums w-4">6.</span> Peer-reviewed scientific institutions</li>
              <li className="flex gap-2"><span className="text-xs text-slate-400 tabular-nums w-4">7.</span> Reputable media (context only)</li>
            </ol>
          </div>
          <div className="border border-slate-200 rounded p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Verification levels</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <VerificationBadge status="verified" />
                <span className="text-sm text-slate-600">Confirmed by official health authority</span>
              </div>
              <div className="flex items-center gap-3">
                <VerificationBadge status="probable" />
                <span className="text-sm text-slate-600">Likely accurate, pending final confirmation</span>
              </div>
              <div className="flex items-center gap-3">
                <VerificationBadge status="suspected" />
                <span className="text-sm text-slate-600">Under investigation, not yet confirmed</span>
              </div>
              <div className="flex items-center gap-3">
                <VerificationBadge status="disputed" />
                <span className="text-sm text-slate-600">Conflicting reports from sources</span>
              </div>
              <div className="flex items-center gap-3">
                <VerificationBadge status="retracted" />
                <span className="text-sm text-slate-600">Withdrawn or corrected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <DisclaimerBox text="HantaMap does not provide medical diagnosis or emergency medical advice. The information presented is sourced from public health authorities and is intended for informational purposes only. Always consult a healthcare professional for medical decisions. If you are experiencing a medical emergency, contact your local emergency services immediately." />
      </section>
    </div>
  )
}

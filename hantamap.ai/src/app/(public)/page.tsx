import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DynamicMap } from '@/components/map/dynamic-map'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HantaMap.ai - Real-time Hantavirus Signal Tracking',
  description: 'Track Hantavirus signals in real time with verified sources, media monitoring and source-backed updates.',
}

export const revalidate = 60

export default async function HomePage() {
  let reports: any[] = []
  let updates: any[] = []
  let mediaItems: any[] = []

  try {
    const supabase = await createClient()
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const [reportsRes, updatesRes, mediaRes] = await Promise.all([
      supabase.from('reports').select('*, outbreak:outbreaks(id, name, slug, pathogen_name), location:locations(country, region, city, latitude, longitude, precision)').eq('published', true).order('created_at', { ascending: false }).limit(50),
      supabase.from('updates').select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)').eq('published', true).order('published_at', { ascending: false }).limit(5),
      supabase.from('source_candidates').select('id, title, url, publisher, original_publisher, published_at, confidence_level').eq('is_public', true).eq('source_type', 'media').gte('published_at', tenDaysAgo.toISOString()).order('published_at', { ascending: false }).limit(8),
    ])

    reports = reportsRes.data || []
    updates = updatesRes.data || []
    mediaItems = mediaRes.data || []
  } catch {}

  const caseReports = reports.filter((r: any) => r.counts_as_case !== false)
  const totalConfirmed = caseReports.reduce((s: number, r: any) => s + (r.confirmed_cases || 0), 0)
  const totalDeaths = caseReports.reduce((s: number, r: any) => s + (r.deaths || 0), 0)
  const hasConfirmed = caseReports.some((r: any) => r.confirmed_cases !== null)
  const hasDeaths = caseReports.some((r: any) => r.deaths !== null)
  const lastChecked = new Date().toISOString()

  return (
    <div className="bg-[#061417] pt-14">

      {/* ── SECTION 1: Hero + Live Map ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-14 items-start">

          {/* Left: copy + CTAs */}
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#28d7c2] mb-4">
              Real-time outbreak tracking with verified sources
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#f2f7f8] leading-[1.15] tracking-tight">
              Hantavirus signals, mapped in real time.
            </h1>
            <p className="text-base text-[#9fb0b7] mt-4 leading-relaxed">
              HantaMap helps people understand global health risks through maps, verified updates and calm preparedness guidance.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/map" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#28d7c2] text-[#061417] text-sm font-semibold hover:brightness-110 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                View live map
              </Link>
              <Link href="/login" className="inline-flex items-center px-5 py-2.5 rounded-full border border-white/10 text-[#9fb0b7] text-sm font-medium hover:bg-white/5 hover:text-[#f2f7f8] transition-all">
                Create free account
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {['Official sources', 'Media monitoring', 'Verified updates'].map(t => (
                <span key={t} className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-white/[0.08] text-[#5a7078]">{t}</span>
              ))}
            </div>
          </div>

          {/* Right: live map dashboard card */}
          <div className="w-full">
            <div className="bg-[#0b2026] border border-white/[0.08] rounded-[20px] overflow-hidden">
              {/* Map: interactive for touch but does not capture scroll */}
              <div className="relative w-full h-[55svh] sm:h-[380px]">
                <DynamicMap reports={reports} height="100%" interactive={true} captureScroll={false} />
              </div>
              {/* Compact metrics strip inside card */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-4 overflow-x-auto">
                  {[
                    { v: hasConfirmed ? totalConfirmed : '-', l: 'Confirmed', c: '#ff4d57' },
                    { v: hasDeaths ? totalDeaths : '-', l: 'Deaths', c: '#f2f7f8' },
                    { v: reports.length, l: 'Locations', c: '#38d48b' },
                    { v: mediaItems.length, l: 'Media', c: '#ffb240' },
                  ].map((m, i) => (
                    <div key={i} className="text-center flex-shrink-0">
                      <div className="text-base font-bold tabular-nums" style={{ color: m.c }}>{m.v}</div>
                      <div className="text-[8px] text-[#5a7078] uppercase tracking-widest">{m.l}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[8px] text-[#5a7078] hidden sm:block">
                  Updated {new Date(lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#5a7078] mt-2 text-right">
              Media signals are not confirmed cases.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Live status ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto border-t border-white/[0.04]">
        <h2 className="text-lg font-bold text-[#f2f7f8] mb-6">Live status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Official reports', value: caseReports.length || '-' },
            { label: 'Confirmed cases', value: hasConfirmed ? totalConfirmed : '-' },
            { label: 'Official deaths', value: hasDeaths ? totalDeaths : '-' },
            { label: 'Media signals (10 days)', value: mediaItems.length || '-' },
          ].map((m, i) => (
            <div key={i} className="bg-[#0b2026] border border-white/[0.06] rounded-2xl p-4">
              <div className="text-2xl font-bold text-[#f2f7f8] tabular-nums">{m.value}</div>
              <div className="text-[10px] text-[#5a7078] uppercase tracking-wider mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Latest updates + media feed */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Official updates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#f2f7f8]">Verified updates</h3>
              <Link href="/updates" className="text-[10px] text-[#5a7078] hover:text-[#9fb0b7]">View all</Link>
            </div>
            {updates.length > 0 ? (
              <div className="space-y-2">
                {updates.slice(0, 3).map((u: any) => (
                  <div key={u.id} className="bg-[#0b2026] border border-white/[0.06] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#38d48b]/15 text-[#38d48b] border border-[#38d48b]/20">{u.verification_status}</span>
                    </div>
                    <p className="text-xs font-medium text-[#f2f7f8] leading-snug">{u.title}</p>
                    {u.summary && <p className="text-xs text-[#9fb0b7] mt-1 line-clamp-2">{u.summary}</p>}
                    <p className="text-[10px] text-[#5a7078] mt-2">
                      {u.published_at ? new Date(u.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0b2026] border border-white/[0.06] rounded-2xl p-6 text-center">
                <p className="text-xs text-[#5a7078]">No official updates published yet.</p>
              </div>
            )}
          </div>

          {/* Media monitoring */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#f2f7f8]">Media monitoring</h3>
              <Link href="/updates?tab=media" className="text-[10px] text-[#5a7078] hover:text-[#9fb0b7]">View all</Link>
            </div>
            {mediaItems.length > 0 ? (
              <div className="space-y-2">
                {mediaItems.slice(0, 3).map((item: any) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-[#0b2026] border border-white/[0.06] rounded-2xl p-4 hover:bg-[#102b32] transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        item.confidence_level === 'high' ? 'bg-[#38d48b]/10 text-[#38d48b] border-[#38d48b]/20' : 'bg-[#ffb240]/10 text-[#ffb240] border-[#ffb240]/20'
                      }`}>{item.confidence_level === 'high' ? 'High confidence' : 'Media'}</span>
                    </div>
                    <p className="text-xs font-medium text-[#f2f7f8] leading-snug">{item.title}</p>
                    <p className="text-[10px] text-[#5a7078] mt-2">{item.original_publisher || item.publisher}</p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-[#0b2026] border border-white/[0.06] rounded-2xl p-6 text-center">
                <p className="text-xs text-[#5a7078]">No recent media items.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Why HantaMap ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto border-t border-white/[0.04]">
        <h2 className="text-lg font-bold text-[#f2f7f8] mb-2">Why HantaMap</h2>
        <p className="text-sm text-[#9fb0b7] mb-8 max-w-xl">Source-backed outbreak intelligence for individuals, families and health professionals.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Verified updates', desc: 'Every report links to official sources from WHO, ECDC, CDC or national health authorities.' },
            { title: 'Global signal map', desc: 'Interactive map with verified markers and media monitoring signals, updated automatically.' },
            { title: 'Preparedness guidance', desc: 'Calm, practical household readiness checklists. No fear language, no product claims.' },
            { title: 'Personal dashboard', desc: 'Save regions, track travel plans, manage preparedness lists with a free account.' },
            { title: 'Source-linked data', desc: 'Every published case count, location and status is backed by a linked source URL.' },
            { title: 'Clear verification', desc: 'Verified, probable, suspected, disputed, media-reported. Each status is clearly labeled.' },
          ].map((f, i) => (
            <div key={i} className="bg-[#0b2026] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#f2f7f8] mb-1.5">{f.title}</h3>
              <p className="text-xs text-[#9fb0b7] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: Source methodology ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0b2026] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#f2f7f8] mb-3">Source hierarchy</h3>
            <ol className="space-y-1.5 text-xs text-[#9fb0b7]">
              {['WHO', 'ECDC', 'CDC', 'National health ministries', 'Regional health authorities', 'Peer-reviewed institutions', 'Reputable media (context only)'].map((s, i) => (
                <li key={i} className="flex gap-2"><span className="text-[#5a7078] tabular-nums w-4">{i + 1}.</span>{s}</li>
              ))}
            </ol>
          </div>
          <div className="bg-[#0b2026] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-[#f2f7f8] mb-3">Data integrity</h3>
            <ul className="space-y-1.5 text-xs text-[#9fb0b7]">
              <li>Media mentions are not confirmed cases.</li>
              <li>0 means verified zero. Unknown means data not available.</li>
              <li>Conflicting data is marked &quot;disputed&quot;, not silently resolved.</li>
              <li>Every report requires at least one linked source before publishing.</li>
              <li>Treatment locations do not count toward case totals.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Account CTA ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto border-t border-white/[0.04]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold text-[#f2f7f8] mb-3">Track what matters to you</h2>
          <p className="text-sm text-[#9fb0b7] mb-6">Create a free account to save regions, set up alerts, track travel plans and access the preparedness checklist.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center px-6 py-3 rounded-full bg-[#28d7c2] text-[#061417] text-sm font-semibold hover:brightness-110 transition-all">
              Create free account
            </Link>
            <Link href="/map" className="inline-flex items-center px-6 py-3 rounded-full border border-white/10 text-[#9fb0b7] text-sm font-medium hover:bg-white/5 hover:text-[#f2f7f8] transition-all">
              Explore the map
            </Link>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[10px] text-[#5a7078] leading-relaxed">
            HantaMap does not provide medical diagnosis or emergency medical advice. Information is sourced from public health authorities and media monitoring. Media reports are not confirmed cases. Always consult a healthcare professional for medical decisions. Last checked: {new Date(lastChecked).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
          </p>
        </div>
      </section>
    </div>
  )
}

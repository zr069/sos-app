import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Updates',
  description: 'Verified Hantavirus updates and media monitoring from official health authorities.',
}

export const revalidate = 60

export default async function UpdatesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  let updates: any[] = []
  let mediaItems: any[] = []

  try {
    const supabase = await createClient()
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const [updatesRes, mediaRes] = await Promise.all([
      supabase.from('updates').select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)').eq('published', true).order('published_at', { ascending: false }).limit(50),
      supabase.from('source_candidates').select('id, title, url, publisher, original_publisher, published_at, confidence_level, extracted_summary').eq('is_public', true).eq('source_type', 'media').gte('published_at', tenDaysAgo.toISOString()).order('published_at', { ascending: false }).limit(50),
    ])
    updates = updatesRes.data || []
    mediaItems = mediaRes.data || []
  } catch {}

  const activeTab = params.tab || (updates.length > 0 ? 'official' : 'media')

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen px-4 sm:px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Updates</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Source-backed outbreak updates and media monitoring.</p>

      <div className="flex gap-2 mb-6">
        <Link href="/updates?tab=official" className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${activeTab === 'official' ? 'bg-white/10 text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-white/5'}`}>
          Official ({updates.length})
        </Link>
        <Link href="/updates?tab=media" className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${activeTab === 'media' ? 'bg-white/10 text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:bg-white/5'}`}>
          Media ({mediaItems.length})
        </Link>
      </div>

      {activeTab === 'official' && (
        updates.length > 0 ? (
          <div className="space-y-3">
            {updates.map((u: any) => (
              <article key={u.id} className="bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-card)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-green)]/15 text-[var(--accent-green)] border border-[var(--accent-green)]/20">{u.verification_status}</span>
                  {u.outbreak && <Link href={`/outbreaks/${u.outbreak.slug}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">{u.outbreak.name}</Link>}
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{u.title}</h3>
                {u.summary && <p className="text-sm text-[var(--text-secondary)] mt-1.5 line-clamp-3">{u.summary}</p>}
                <div className="text-xs text-[var(--text-muted)] mt-3">
                  {u.published_at ? new Date(u.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  {u.location && ` · ${[u.location.city, u.location.region, u.location.country].filter(Boolean).join(', ')}`}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-card)] p-10 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No official updates published yet.</p>
          </div>
        )
      )}

      {activeTab === 'media' && (
        <>
          <div className="bg-[var(--accent-amber)]/10 border border-[var(--accent-amber)]/15 rounded-[var(--radius-card)] px-4 py-3 mb-4">
            <p className="text-xs text-[var(--accent-amber)]">Media mentions are not confirmed cases. Awaiting official confirmation.</p>
          </div>
          {mediaItems.length > 0 ? (
            <div className="space-y-2">
              {mediaItems.map((item: any) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-card)] p-4 hover:bg-[var(--bg-panel-strong)] transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.confidence_level === 'high' ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)] border-[var(--accent-green)]/20' : 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/20'}`}>
                      {item.confidence_level === 'high' ? 'High confidence' : 'Media'}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug">{item.title}</h3>
                  {item.extracted_summary && <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{item.extracted_summary}</p>}
                  <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
                    <span>{item.original_publisher || item.publisher}</span>
                    <span>·</span>
                    <span>{item.published_at ? new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--bg-panel)] border border-white/[0.06] rounded-[var(--radius-card)] p-10 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No recent media monitoring items.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

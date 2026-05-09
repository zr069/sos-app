import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UpdateCard } from '@/components/ui/update-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Updates',
  description: 'Verified outbreak updates from official health authorities and scientific sources.',
}

export const revalidate = 300

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function UpdatesPage({ searchParams }: Props) {
  const params = await searchParams
  let updates: any[] = []
  let mediaItems: any[] = []

  try {
    const supabase = await createClient()

    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const tenDaysAgoISO = tenDaysAgo.toISOString()

    const [updatesRes, mediaRes] = await Promise.all([
      supabase
        .from('updates')
        .select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(50),
      supabase
        .from('source_candidates')
        .select('id, title, url, publisher, original_publisher, published_at, confidence_level, source_type')
        .eq('is_public', true)
        .eq('source_type', 'media')
        .gte('published_at', tenDaysAgoISO)
        .order('published_at', { ascending: false })
        .limit(50),
    ])

    updates = updatesRes.data || []
    mediaItems = mediaRes.data || []
  } catch {
    // Supabase not configured
  }

  // Default to official tab if official updates exist, otherwise media
  const activeTab = params.tab === 'media'
    ? 'media'
    : params.tab === 'official'
      ? 'official'
      : updates.length > 0
        ? 'official'
        : 'media'

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Updates</h1>
      <p className="text-sm text-slate-500 mb-6">
        Source-backed outbreak updates from health authorities, scientific institutions, and media monitoring.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-slate-200">
        <Link
          href="/updates?tab=official"
          className={`px-4 py-2.5 text-sm font-medium -mb-px ${
            activeTab === 'official'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Official
        </Link>
        <Link
          href="/updates?tab=media"
          className={`px-4 py-2.5 text-sm font-medium -mb-px ${
            activeTab === 'media'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Media monitoring
          {mediaItems.length > 0 && (
            <span className="ml-2 text-xs text-slate-400">{mediaItems.length}</span>
          )}
        </Link>
      </div>

      {activeTab === 'official' ? (
        <>
          {updates.length > 0 ? (
            <div className="space-y-3">
              {updates.map((update: any) => (
                <UpdateCard key={update.id} update={update} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No verified updates available yet"
              description="Updates will appear here once published with verified sources by editors."
            />
          )}
        </>
      ) : (
        <>
          {mediaItems.length > 0 ? (
            <div className="space-y-3">
              {mediaItems.map((item: any) => (
                <article key={item.id} className="border border-slate-200 rounded p-5 bg-amber-50/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                      item.confidence_level === 'high'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.confidence_level === 'high' ? 'High confidence' : 'Media'}
                    </span>
                    <span className="text-xs text-slate-400">Media report, not verified by health authorities</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-700"
                    >
                      {item.title}
                    </a>
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">
                      {item.original_publisher || item.publisher}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Date unknown'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No media signals in the last 10 days"
              description="Media monitoring items will appear here when available."
            />
          )}
        </>
      )}
    </div>
  )
}

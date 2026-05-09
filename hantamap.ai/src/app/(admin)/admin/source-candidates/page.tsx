import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Source Review Queue' }

export default async function SourceCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; provider?: string; type?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('source_candidates')
    .select('*')
    .order('fetched_at', { ascending: false })
    .limit(100)

  const filterStatus = params.status || 'pending'
  if (filterStatus !== 'all') {
    query = query.eq('review_status', filterStatus)
  }

  if (params.provider) {
    query = query.eq('source_provider', params.provider)
  }

  const filterType = params.type || ''
  if (filterType === 'official') {
    query = query.eq('source_type', 'official')
  } else if (filterType === 'media') {
    query = query.in('source_type', ['media', 'aggregator'])
  }

  const { data: candidates } = await query

  // Get counts
  const [pendingRes, reviewedRes, ignoredRes] = await Promise.all([
    supabase.from('source_candidates').select('id', { count: 'exact' }).eq('review_status', 'pending'),
    supabase.from('source_candidates').select('id', { count: 'exact' }).eq('review_status', 'reviewed'),
    supabase.from('source_candidates').select('id', { count: 'exact' }).eq('review_status', 'ignored'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Source review queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Imported source candidates awaiting editorial review. No public data has been created yet.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded p-3 bg-slate-50 mb-6">
        <p className="text-xs text-slate-600">
          <span className="font-medium">Current ingestion topic:</span> Hantavirus / Andes-Hantavirus.
          Only sources matching this topic are imported. Irrelevant sources are skipped during ingestion.
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'pending', label: 'Pending', count: pendingRes.count || 0 },
          { key: 'reviewed', label: 'Reviewed', count: reviewedRes.count || 0 },
          { key: 'ignored', label: 'Ignored', count: ignoredRes.count || 0 },
          { key: 'all', label: 'All', count: (pendingRes.count || 0) + (reviewedRes.count || 0) + (ignoredRes.count || 0) },
        ].map(tab => (
          <Link
            key={tab.key}
            href={`/admin/source-candidates?status=${tab.key}${params.provider ? `&provider=${params.provider}` : ''}`}
            className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
              filterStatus === tab.key
                ? 'bg-slate-900 text-white border-slate-900'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      {/* Source type filter */}
      <div className="flex gap-2 mb-3">
        {[
          { key: '', label: 'All types' },
          { key: 'official', label: 'Official' },
          { key: 'media', label: 'Media monitoring' },
        ].map(t => (
          <Link
            key={t.key}
            href={`/admin/source-candidates?status=${filterStatus}${params.provider ? `&provider=${params.provider}` : ''}${t.key ? `&type=${t.key}` : ''}`}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              filterType === t.key
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Provider filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: '', label: 'All providers' },
          { key: 'who-don', label: 'WHO DON' },
          { key: 'who-emergencies', label: 'WHO Emergencies' },
          { key: 'cdc-travel', label: 'CDC Travel' },
          { key: 'reliefweb', label: 'ReliefWeb' },
          { key: 'google-news', label: 'Google News' },
        ].map(p => (
          <Link
            key={p.key}
            href={`/admin/source-candidates?status=${filterStatus}${p.key ? `&provider=${p.key}` : ''}${filterType ? `&type=${filterType}` : ''}`}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              (params.provider || '') === p.key
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {candidates && candidates.length > 0 ? (
        <div className="space-y-2">
          {candidates.map((c: any) => (
            <Link
              key={c.id}
              href={`/admin/source-candidates/${c.id}`}
              className="block border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 leading-snug">{c.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {c.source_type === 'media' && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Media</span>
                    )}
                    {c.confidence_level === 'high' && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">High confidence</span>
                    )}
                    {c.is_public && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Public</span>
                    )}
                    <span className="text-xs text-slate-400">{c.original_publisher || c.publisher}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400 uppercase">{c.source_provider}</span>
                    {c.published_at && (
                      <>
                        <span className="text-xs text-slate-300">|</span>
                        <span className="text-xs text-slate-400">
                          {new Date(c.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </>
                    )}
                  </div>
                  {c.detected_keywords && c.detected_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.detected_keywords.map((kw: string) => (
                        <span key={kw} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{kw}</span>
                      ))}
                    </div>
                  )}
                  {c.detected_countries && c.detected_countries.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.detected_countries.map((co: string) => (
                        <span key={co} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{co}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0 ${
                  c.review_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  c.review_status === 'reviewed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {c.review_status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-slate-200 rounded p-8 text-center">
          <p className="text-sm text-slate-500">No source candidates found.</p>
          <p className="text-xs text-slate-400 mt-1">
            Run the ingestion scripts to import official source candidates.
          </p>
        </div>
      )}
    </div>
  )
}

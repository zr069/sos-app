import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CandidateActions } from './candidate-actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Review Source Candidate' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function CandidateDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidate } = await supabase
    .from('source_candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (!candidate) notFound()

  // Fetch existing outbreaks for linking
  const { data: outbreaks } = await supabase
    .from('outbreaks')
    .select('id, name, slug')
    .order('name')

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Imported source candidate</p>
        <h1 className="text-xl font-bold text-slate-900">{candidate.title}</h1>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
          candidate.review_status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          candidate.review_status === 'reviewed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          'bg-slate-50 text-slate-500 border-slate-200'
        }`}>
          {candidate.review_status === 'pending' ? 'Awaiting editorial review' : candidate.review_status}
        </span>
        <span className="text-xs text-slate-400 uppercase">{candidate.source_provider}</span>
        {candidate.linked_source_id && (
          <span className="text-xs text-emerald-600">Source created</span>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 mb-1">Publisher</p>
          <p className="text-sm text-slate-900">{candidate.publisher}</p>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 mb-1">Published</p>
          <p className="text-sm text-slate-900">
            {candidate.published_at
              ? new Date(candidate.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'Unknown'}
          </p>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 mb-1">Fetched at</p>
          <p className="text-sm text-slate-900">
            {new Date(candidate.fetched_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="border border-slate-200 rounded p-4">
          <p className="text-xs text-slate-500 mb-1">External ID</p>
          <p className="text-sm text-slate-900 font-mono text-xs break-all">{candidate.external_id}</p>
        </div>
      </div>

      {/* Source URL */}
      {candidate.url && (
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-1">Original source</p>
          <a
            href={candidate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-700 underline hover:text-slate-900 break-all"
          >
            {candidate.url}
          </a>
        </div>
      )}

      {/* Detected keywords and countries */}
      {candidate.detected_keywords && candidate.detected_keywords.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-1">Detected keywords</p>
          <div className="flex flex-wrap gap-1">
            {candidate.detected_keywords.map((kw: string) => (
              <span key={kw} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {candidate.detected_countries && candidate.detected_countries.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-1">Detected countries</p>
          <div className="flex flex-wrap gap-1">
            {candidate.detected_countries.map((co: string) => (
              <span key={co} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{co}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {candidate.extracted_summary && (
        <div className="mb-6">
          <p className="text-xs text-slate-500 mb-1">Extracted summary</p>
          <div className="border border-slate-200 rounded p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{candidate.extracted_summary}</p>
          </div>
        </div>
      )}

      {/* Raw payload */}
      <details className="mb-8">
        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">View raw payload</summary>
        <pre className="mt-2 border border-slate-200 rounded p-4 text-xs text-slate-600 overflow-x-auto max-h-96 bg-slate-50">
          {JSON.stringify(candidate.raw_payload, null, 2)}
        </pre>
      </details>

      {/* Actions */}
      <CandidateActions candidate={candidate} outbreaks={outbreaks || []} />
    </div>
  )
}

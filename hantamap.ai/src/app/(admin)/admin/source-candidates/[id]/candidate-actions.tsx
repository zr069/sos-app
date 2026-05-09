'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CandidateActionsProps {
  candidate: any
  outbreaks: { id: string; name: string; slug: string }[]
}

export function CandidateActions({ candidate, outbreaks }: CandidateActionsProps) {
  const [loading, setLoading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function markStatus(status: 'reviewed' | 'ignored') {
    setLoading(status)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('source_candidates')
      .update({ review_status: status, updated_at: new Date().toISOString() })
      .eq('id', candidate.id)

    if (err) setError(err.message)
    else setMessage(`Marked as ${status}.`)
    setLoading('')
    router.refresh()
  }

  async function createSource() {
    setLoading('create-source')
    setError('')
    const supabase = createClient()

    // Determine source type from provider
    const typeMap: Record<string, string> = {
      'who-don': 'who',
      'who-emergencies': 'who',
      'cdc-travel': 'cdc',
      'reliefweb': 'other',
    }

    const { data: source, error: err } = await supabase
      .from('sources')
      .insert({
        title: candidate.title,
        publisher: candidate.publisher,
        url: candidate.url || '',
        published_at: candidate.published_at,
        source_type: typeMap[candidate.source_provider] || 'other',
        reliability_level: candidate.source_provider.startsWith('who') ? 5 : candidate.source_provider === 'cdc-travel' ? 4 : 3,
      })
      .select('id')
      .single()

    if (err) {
      setError(err.message)
      setLoading('')
      return
    }

    // Link source to candidate
    await supabase
      .from('source_candidates')
      .update({ linked_source_id: source.id, review_status: 'reviewed', updated_at: new Date().toISOString() })
      .eq('id', candidate.id)

    setMessage('Source created and linked.')
    setLoading('')
    router.refresh()
  }

  async function createUpdate(outbreakId?: string) {
    setLoading('create-update')
    setError('')
    const supabase = createClient()

    // First ensure source exists
    let sourceId = candidate.linked_source_id
    if (!sourceId) {
      const typeMap: Record<string, string> = {
        'who-don': 'who',
        'who-emergencies': 'who',
        'cdc-travel': 'cdc',
        'reliefweb': 'other',
      }

      const { data: source, error: srcErr } = await supabase
        .from('sources')
        .insert({
          title: candidate.title,
          publisher: candidate.publisher,
          url: candidate.url || '',
          published_at: candidate.published_at,
          source_type: typeMap[candidate.source_provider] || 'other',
          reliability_level: candidate.source_provider.startsWith('who') ? 5 : 4,
        })
        .select('id')
        .single()

      if (srcErr) { setError(srcErr.message); setLoading(''); return }
      sourceId = source.id

      await supabase
        .from('source_candidates')
        .update({ linked_source_id: sourceId, review_status: 'reviewed', updated_at: new Date().toISOString() })
        .eq('id', candidate.id)
    }

    // Create update (unpublished draft)
    const { data: update, error: updErr } = await supabase
      .from('updates')
      .insert({
        title: candidate.title,
        summary: candidate.extracted_summary?.slice(0, 500) || null,
        outbreak_id: outbreakId || null,
        verification_status: 'awaiting_source',
        published: false,
      })
      .select('id')
      .single()

    if (updErr) { setError(updErr.message); setLoading(''); return }

    // Link source to update
    await supabase
      .from('update_sources')
      .insert({ update_id: update.id, source_id: sourceId })

    setMessage('Update draft created with source linked. Review and publish in the Updates section.')
    setLoading('')
    router.refresh()
  }

  return (
    <div className="border border-slate-200 rounded p-6">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Actions</h2>

      {error && (
        <div className="border border-red-200 rounded p-3 bg-red-50 mb-4">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {message && (
        <div className="border border-emerald-200 rounded p-3 bg-emerald-50 mb-4">
          <p className="text-xs text-emerald-700">{message}</p>
        </div>
      )}

      <div className="space-y-3">
        {/* Review status */}
        <div className="flex gap-2">
          <button
            onClick={() => markStatus('reviewed')}
            disabled={!!loading || candidate.review_status === 'reviewed'}
            className="text-xs font-medium px-3 py-1.5 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          >
            {loading === 'reviewed' ? 'Saving...' : 'Mark reviewed'}
          </button>
          <button
            onClick={() => markStatus('ignored')}
            disabled={!!loading || candidate.review_status === 'ignored'}
            className="text-xs font-medium px-3 py-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading === 'ignored' ? 'Saving...' : 'Ignore'}
          </button>
        </div>

        {/* Create source */}
        <div>
          <button
            onClick={createSource}
            disabled={!!loading || !!candidate.linked_source_id}
            className="text-xs font-medium px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading === 'create-source' ? 'Creating...' : candidate.linked_source_id ? 'Source already created' : 'Create source'}
          </button>
        </div>

        {/* Create update */}
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => createUpdate()}
            disabled={!!loading}
            className="text-xs font-medium px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading === 'create-update' ? 'Creating...' : 'Create update draft'}
          </button>
          {outbreaks.length > 0 && (
            <select
              onChange={e => { if (e.target.value) createUpdate(e.target.value) }}
              disabled={!!loading}
              className="text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-600 bg-white"
              defaultValue=""
            >
              <option value="">Link to outbreak...</option>
              {outbreaks.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Navigate to related admin sections */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Link href="/admin/reports/new" className="text-xs text-slate-500 hover:text-slate-700">
            Create report manually
          </Link>
          <span className="text-xs text-slate-300">|</span>
          <Link href="/admin/source-candidates" className="text-xs text-slate-500 hover:text-slate-700">
            Back to queue
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Creating an update or report from this candidate does not automatically publish it. All records require editorial review before publishing.
      </p>
    </div>
  )
}

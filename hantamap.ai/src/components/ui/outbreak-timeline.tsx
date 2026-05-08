import { VerificationBadge } from './verification-badge'
import { type Update } from '@/lib/types'

export function OutbreakTimeline({ updates }: { updates: Update[] }) {
  if (updates.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 rounded p-6 text-center">
        <p className="text-sm text-slate-500">No timeline entries yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {updates.map((update, i) => (
        <div key={update.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-slate-300 mt-2" />
            {i < updates.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
          </div>
          <div className="pb-6 min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <VerificationBadge status={update.verification_status} />
              <span className="text-xs text-slate-400">
                {update.published_at
                  ? new Date(update.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : ''}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900">{update.title}</p>
            {update.summary && (
              <p className="text-sm text-slate-500 mt-0.5">{update.summary}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

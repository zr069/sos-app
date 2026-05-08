import Link from 'next/link'
import { VerificationBadge } from './verification-badge'
import { type Update } from '@/lib/types'

export function UpdateCard({ update }: { update: Update }) {
  return (
    <article className="border border-slate-200 rounded p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <VerificationBadge status={update.verification_status} />
            {update.outbreak && (
              <Link
                href={`/outbreaks/${update.outbreak.slug}`}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {update.outbreak.name}
              </Link>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
            {update.title}
          </h3>
          {update.summary && (
            <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{update.summary}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            {update.location && (
              <span className="text-xs text-slate-400">
                {[update.location.city, update.location.region, update.location.country].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {update.published_at
                ? new Date(update.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Date unknown'}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

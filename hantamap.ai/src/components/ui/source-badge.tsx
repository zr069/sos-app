import { type Source } from '@/lib/types'

export function SourceBadge({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded px-2 py-1 transition-colors"
    >
      <span className="font-medium">{source.publisher}</span>
      {source.published_at && (
        <span className="text-slate-400">
          {new Date(source.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )}
    </a>
  )
}

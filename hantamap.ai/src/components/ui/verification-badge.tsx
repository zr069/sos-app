import { type VerificationStatus } from '@/lib/types'

const statusConfig: Record<VerificationStatus, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  probable: { label: 'Probable', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspected: { label: 'Suspected', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  disputed: { label: 'Disputed', className: 'bg-red-50 text-red-700 border-red-200' },
  retracted: { label: 'Retracted', className: 'bg-slate-100 text-slate-500 border-slate-200 line-through' },
  awaiting_source: { label: 'Awaiting source', className: 'bg-slate-50 text-slate-500 border-slate-200' },
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${config.className}`}>
      {config.label}
    </span>
  )
}

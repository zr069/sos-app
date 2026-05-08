interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border border-dashed border-slate-200 rounded p-8 text-center">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
}

export function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <div className="border border-slate-200 rounded p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  )
}

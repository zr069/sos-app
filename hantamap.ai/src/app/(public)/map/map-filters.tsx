'use client'

interface MapFiltersProps {
  outbreaks: { id: string; name: string; slug: string }[]
  countries: string[]
}

export function MapFilters({ outbreaks, countries }: MapFiltersProps) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-2">
      <div className="mx-auto max-w-7xl flex flex-wrap gap-2">
        <select className="text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-600 bg-white">
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="probable">Probable</option>
          <option value="suspected">Suspected</option>
          <option value="disputed">Disputed</option>
        </select>
        <select className="text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-600 bg-white">
          <option value="">All outbreaks</option>
          {outbreaks.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <select className="text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-600 bg-white">
          <option value="">All countries</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-red-600" /> Confirmed
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-600" /> Probable
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Suspected
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-gray-500" /> Disputed
          </span>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="text-sm font-bold text-slate-900">HantaMap.ai</p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Real-time outbreak tracking with verified sources. HantaMap does not provide medical diagnosis or emergency medical advice.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Platform</p>
            <div className="flex flex-col gap-2">
              <Link href="/map" className="text-xs text-slate-500 hover:text-slate-700">Live Map</Link>
              <Link href="/updates" className="text-xs text-slate-500 hover:text-slate-700">Updates</Link>
              <Link href="/preparedness" className="text-xs text-slate-500 hover:text-slate-700">Preparedness</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Information</p>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-xs text-slate-500 hover:text-slate-700">About</Link>
              <a href="mailto:corrections@hantamap.ai" className="text-xs text-slate-500 hover:text-slate-700">Corrections</a>
              <a href="mailto:press@hantamap.ai" className="text-xs text-slate-500 hover:text-slate-700">Press</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Legal</p>
            <div className="flex flex-col gap-2">
              <Link href="/about#privacy" className="text-xs text-slate-500 hover:text-slate-700">Privacy</Link>
              <Link href="/about#terms" className="text-xs text-slate-500 hover:text-slate-700">Terms</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 mt-8 pt-6">
          <p className="text-xs text-slate-400">
            HantaMap does not provide medical diagnosis or emergency medical advice. Always consult a healthcare professional for medical decisions.
          </p>
        </div>
      </div>
    </footer>
  )
}

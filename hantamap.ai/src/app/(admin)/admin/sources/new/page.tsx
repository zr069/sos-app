import { SourceForm } from '../source-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Add Source' }

export default function NewSourcePage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Add source</h1>
      <SourceForm />
    </div>
  )
}

import { OutbreakForm } from '../outbreak-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: New Outbreak' }

export default function NewOutbreakPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Create outbreak</h1>
      <OutbreakForm />
    </div>
  )
}

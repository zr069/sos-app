import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OutbreakForm } from '../outbreak-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Edit Outbreak' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditOutbreakPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: outbreak } = await supabase
    .from('outbreaks')
    .select('*')
    .eq('id', id)
    .single()

  if (!outbreak) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit outbreak</h1>
      <OutbreakForm outbreak={outbreak} />
    </div>
  )
}

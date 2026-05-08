import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { UpdateForm } from '../update-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin: Edit Update' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditUpdatePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [updateRes, outbreaksRes, locationsRes, sourcesRes, linkedRes] = await Promise.all([
    supabase.from('updates').select('*').eq('id', id).single(),
    supabase.from('outbreaks').select('id, name').order('name'),
    supabase.from('locations').select('id, country, region, city').order('country'),
    supabase.from('sources').select('id, title, publisher').order('title'),
    supabase.from('update_sources').select('source_id').eq('update_id', id),
  ])

  if (!updateRes.data) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit update</h1>
      <UpdateForm
        update={updateRes.data}
        outbreaks={outbreaksRes.data || []}
        locations={locationsRes.data || []}
        sources={sourcesRes.data || []}
        linkedSourceIds={(linkedRes.data || []).map((s: any) => s.source_id)}
      />
    </div>
  )
}

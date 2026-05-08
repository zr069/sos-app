import { createClient } from '@/lib/supabase/server'
import { RegionsList } from './regions-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Saved Regions',
}

export default async function RegionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: regions } = await supabase
    .from('saved_regions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at')

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-2">Saved regions</h1>
      <p className="text-sm text-slate-500 mb-6">
        Save regions to monitor for outbreak updates. You can enable alerts for each region.
      </p>
      <RegionsList regions={regions || []} userId={user.id} />
    </div>
  )
}

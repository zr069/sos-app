import { createClient } from '@/lib/supabase/server'
import { TravelList } from './travel-list'
import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Travel Plans',
}

export default async function TravelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: plans } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('departure_date')

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-2">Travel plans</h1>
      <p className="text-sm text-slate-500 mb-6">
        Add travel destinations to see relevant outbreak updates for those regions.
      </p>
      <TravelList plans={plans || []} userId={user.id} />
      <div className="mt-8">
        <DisclaimerBox text="HantaMap does not provide definitive travel advice. Review official travel guidance before departure. Check local health authority updates. Consider contacting a healthcare professional for personal medical questions." />
      </div>
    </div>
  )
}

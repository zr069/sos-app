import { createClient } from '@/lib/supabase/server'
import { AlertsForm } from './alerts-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alert Preferences',
}

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: prefs } = await supabase
    .from('alert_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: regions } = await supabase
    .from('saved_regions')
    .select('id, label, alert_enabled')
    .eq('user_id', user.id)

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 mb-2">Alert preferences</h1>
      <p className="text-sm text-slate-500 mb-6">
        Choose how and when you want to receive outbreak notifications.
      </p>
      <AlertsForm prefs={prefs} userId={user.id} regions={regions || []} />
    </div>
  )
}

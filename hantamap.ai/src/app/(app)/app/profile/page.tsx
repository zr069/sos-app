import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'
import { DisclaimerBox } from '@/components/ui/disclaimer-box'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Profile</h1>
      <ProfileForm profile={profile} email={user.email || ''} />
      <div className="mt-8">
        <DisclaimerBox text="Your personal data is stored securely and is not shared with third parties. HantaMap does not collect sensitive medical history. You can delete your account at any time." />
      </div>
    </div>
  )
}

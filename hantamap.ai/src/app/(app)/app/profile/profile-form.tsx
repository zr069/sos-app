'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProfileFormProps {
  profile: any
  email: string
}

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.get('full_name') as string,
        country: form.get('country') as string,
        city: form.get('city') as string,
        household_size: parseInt(form.get('household_size') as string) || null,
        has_children: form.get('has_children') === 'on',
        has_elderly: form.get('has_elderly') === 'on',
        has_pets: form.get('has_pets') === 'on',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.user_id)

    if (error) {
      setMessage('Failed to save profile.')
    } else {
      setMessage('Profile saved.')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
        <input type="email" disabled value={email} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-400 bg-slate-50" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Full name</label>
        <input name="full_name" type="text" defaultValue={profile?.full_name || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
          <input name="country" type="text" defaultValue={profile?.country || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">City or region</label>
          <input name="city" type="text" defaultValue={profile?.city || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Household size</label>
        <input name="household_size" type="number" min="1" defaultValue={profile?.household_size || ''} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input name="has_children" type="checkbox" defaultChecked={profile?.has_children} className="rounded border-slate-300" />
          <span className="text-sm text-slate-700">Children in household</span>
        </label>
        <label className="flex items-center gap-2">
          <input name="has_elderly" type="checkbox" defaultChecked={profile?.has_elderly} className="rounded border-slate-300" />
          <span className="text-sm text-slate-700">Elderly persons in household</span>
        </label>
        <label className="flex items-center gap-2">
          <input name="has_pets" type="checkbox" defaultChecked={profile?.has_pets} className="rounded border-slate-300" />
          <span className="text-sm text-slate-700">Pets</span>
        </label>
      </div>

      {message && (
        <p className={`text-xs ${message.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>{message}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  )
}

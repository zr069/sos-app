'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AlertPrefs {
  id: string
  email_enabled: boolean
  push_enabled: boolean
  frequency: string
}

interface Region {
  id: string
  label: string
  alert_enabled: boolean
}

export function AlertsForm({
  prefs,
  userId,
  regions,
}: {
  prefs: AlertPrefs | null
  userId: string
  regions: Region[]
}) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const data = {
      user_id: userId,
      email_enabled: form.get('email_enabled') === 'on',
      push_enabled: form.get('push_enabled') === 'on',
      frequency: form.get('frequency') as string,
      updated_at: new Date().toISOString(),
    }

    if (prefs) {
      await supabase.from('alert_preferences').update(data).eq('id', prefs.id)
    } else {
      await supabase.from('alert_preferences').insert(data)
    }

    setMessage('Preferences saved.')
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Notification channels</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              name="email_enabled"
              type="checkbox"
              defaultChecked={prefs?.email_enabled ?? true}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Email notifications</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              name="push_enabled"
              type="checkbox"
              defaultChecked={prefs?.push_enabled ?? false}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">Push notifications</span>
            <span className="text-xs text-slate-400">(coming soon)</span>
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Frequency</h2>
        <div className="space-y-2">
          {['immediate', 'daily', 'weekly'].map(freq => (
            <label key={freq} className="flex items-center gap-2">
              <input
                name="frequency"
                type="radio"
                value={freq}
                defaultChecked={(prefs?.frequency || 'daily') === freq}
                className="border-slate-300"
              />
              <span className="text-sm text-slate-700 capitalize">{freq === 'immediate' ? 'Immediate' : freq === 'daily' ? 'Daily digest' : 'Weekly digest'}</span>
            </label>
          ))}
        </div>
      </section>

      {regions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Monitored regions</h2>
          <div className="space-y-1">
            {regions.map(r => (
              <div key={r.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-slate-700">{r.label}</span>
                <span className={`text-xs ${r.alert_enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {r.alert_enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Manage region alerts in the Regions section.
          </p>
        </section>
      )}

      {message && <p className="text-xs text-emerald-600">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save preferences'}
      </button>
    </form>
  )
}

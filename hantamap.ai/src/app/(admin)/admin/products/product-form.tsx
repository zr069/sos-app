'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function ProductForm() {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    await supabase.from('products').insert({
      name: form.get('name') as string,
      category: form.get('category') as string,
      description: form.get('description') as string || null,
      affiliate_url: form.get('affiliate_url') as string || null,
      disclaimer: form.get('disclaimer') as string || null,
      active: true,
    })

    e.currentTarget.reset()
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
        <input name="name" required className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
        <select name="category" required className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 bg-white">
          <option value="hygiene">Hygiene</option>
          <option value="masks">Masks</option>
          <option value="gloves">Gloves</option>
          <option value="disinfectants">Disinfectants</option>
          <option value="drinking_water">Drinking water</option>
          <option value="food">Food</option>
          <option value="first_aid">First aid</option>
          <option value="medicine">Medicine</option>
          <option value="baby">Baby supplies</option>
          <option value="pets">Pet supplies</option>
          <option value="power">Power banks</option>
          <option value="air_filters">Air filters</option>
          <option value="planning">Planning</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
        <textarea name="description" rows={2} className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Affiliate URL</label>
        <input name="affiliate_url" type="url" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Disclaimer</label>
        <input name="disclaimer" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-400" />
      </div>
      <button type="submit" disabled={saving} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50">
        {saving ? 'Adding...' : 'Add product'}
      </button>
    </form>
  )
}

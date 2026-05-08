import { createClient } from '@/lib/supabase/server'
import { PreparednessList } from './preparedness-list'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preparedness Checklist',
}

const defaultCategories = [
  { key: 'water', label: 'Drinking water', items: ['Water bottles or containers', 'Water purification tablets'] },
  { key: 'food', label: 'Shelf-stable food', items: ['Canned goods', 'Dried foods', 'Energy bars'] },
  { key: 'hygiene', label: 'Hygiene', items: ['Soap and hand sanitizer', 'Tissues', 'Waste bags'] },
  { key: 'masks', label: 'Masks', items: ['Respiratory masks'] },
  { key: 'gloves', label: 'Gloves', items: ['Disposable gloves'] },
  { key: 'disinfectant', label: 'Disinfectant', items: ['Surface disinfectant', 'Cleaning supplies'] },
  { key: 'first_aid', label: 'First aid', items: ['First aid kit', 'Bandages and wound care'] },
  { key: 'medicine', label: 'Medication', items: ['Prescription medication supply', 'Basic over-the-counter medication'] },
  { key: 'baby', label: 'Baby supplies', items: ['Diapers', 'Baby food or formula'] },
  { key: 'pets', label: 'Pet supplies', items: ['Pet food supply', 'Pet medication'] },
  { key: 'power', label: 'Power and communication', items: ['Power bank', 'Battery-powered radio', 'Flashlight and batteries'] },
]

export default async function PreparednessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: items } = await supabase
    .from('preparedness_items')
    .select('*')
    .eq('user_id', user.id)
    .order('category')

  const completed = (items || []).filter(i => i.completed).length
  const total = (items || []).length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-2">Preparedness checklist</h1>
      <p className="text-sm text-slate-500 mb-4">
        Track your household readiness. This is a personal checklist, not medical advice.
      </p>

      {total > 0 && (
        <div className="border border-slate-200 rounded p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-900">Progress</span>
            <span className="text-sm text-slate-500">{completed}/{total} items ({progress}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-slate-900 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <PreparednessList
        items={items || []}
        userId={user.id}
        defaultCategories={defaultCategories}
      />
    </div>
  )
}

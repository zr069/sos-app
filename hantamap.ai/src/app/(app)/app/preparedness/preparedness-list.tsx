'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Item {
  id: string
  category: string
  label: string
  completed: boolean
  quantity: number | null
  notes: string | null
}

interface Category {
  key: string
  label: string
  items: string[]
}

export function PreparednessList({
  items,
  userId,
  defaultCategories,
}: {
  items: Item[]
  userId: string
  defaultCategories: Category[]
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function initializeDefaults() {
    setLoading(true)
    const supabase = createClient()
    const newItems = defaultCategories.flatMap(cat =>
      cat.items.map(label => ({
        user_id: userId,
        category: cat.key,
        label,
        completed: false,
      }))
    )
    await supabase.from('preparedness_items').insert(newItems)
    setLoading(false)
    router.refresh()
  }

  async function toggleItem(id: string, completed: boolean) {
    const supabase = createClient()
    await supabase
      .from('preparedness_items')
      .update({ completed: !completed, updated_at: new Date().toISOString() })
      .eq('id', id)
    router.refresh()
  }

  async function deleteItem(id: string) {
    const supabase = createClient()
    await supabase.from('preparedness_items').delete().eq('id', id)
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 rounded p-8 text-center">
        <p className="text-sm text-slate-500 mb-3">No checklist items yet.</p>
        <button
          onClick={initializeDefaults}
          disabled={loading}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Start with default checklist'}
        </button>
      </div>
    )
  }

  const grouped = items.reduce((acc: Record<string, Item[]>, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const categoryLabels: Record<string, string> = {}
  defaultCategories.forEach(c => { categoryLabels[c.key] = c.label })

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, catItems]) => (
        <section key={category}>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {categoryLabels[category] || category}
          </h2>
          <div className="space-y-1">
            {catItems.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-1.5">
                <button
                  onClick={() => toggleItem(item.id, item.completed)}
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.completed
                      ? 'bg-slate-900 border-slate-900'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm flex-1 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {item.label}
                </span>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-xs text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

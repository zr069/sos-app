import { createClient } from '@/lib/supabase/server'
import { UpdateCard } from '@/components/ui/update-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Updates',
  description: 'Verified outbreak updates from official health authorities and scientific sources.',
}

export const revalidate = 300

export default async function UpdatesPage() {
  let updates: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('updates')
      .select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(50)

    updates = data || []
  } catch {
    // Supabase not configured
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Verified updates</h1>
      <p className="text-sm text-slate-500 mb-8">
        Source-backed outbreak updates from health authorities and scientific institutions.
      </p>

      {updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update: any) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No verified updates available yet"
          description="Updates will appear here once published with verified sources by editors."
        />
      )}
    </div>
  )
}

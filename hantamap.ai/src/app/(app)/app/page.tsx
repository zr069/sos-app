import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MetricCard } from '@/components/ui/metric-card'
import { UpdateCard } from '@/components/ui/update-card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AppDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [profileRes, regionsRes, itemsRes, updatesRes, plansRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('saved_regions').select('*').eq('user_id', user.id),
    supabase.from('preparedness_items').select('*').eq('user_id', user.id),
    supabase.from('updates').select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)').eq('published', true).order('published_at', { ascending: false }).limit(5),
    supabase.from('travel_plans').select('*').eq('user_id', user.id).order('departure_date'),
  ])

  const profile = profileRes.data
  const regions = regionsRes.data || []
  const items = itemsRes.data || []
  const updates = updatesRes.data || []
  const plans = plansRes.data || []

  const completedItems = items.filter((i: any) => i.completed).length
  const totalItems = items.length
  const prepProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Determine risk status based on saved regions
  let riskStatus = 'No saved regions configured'
  if (regions.length > 0) {
    riskStatus = 'No known verified reports near your saved regions'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          {profile?.full_name ? `Welcome, ${profile.full_name}` : 'Dashboard'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Your personal outbreak intelligence overview.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Saved regions" value={regions.length} subtitle="Monitoring" />
        <MetricCard label="Travel plans" value={plans.length} subtitle="Active" />
        <MetricCard label="Checklist progress" value={totalItems > 0 ? `${prepProgress}%` : 'Not started'} subtitle={`${completedItems}/${totalItems} items`} />
        <MetricCard label="Information level" value="Low" subtitle={riskStatus} />
      </div>

      {/* Risk Status */}
      <section className="border border-slate-200 rounded p-5 mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Local status</h2>
        <p className="text-sm text-slate-600">{riskStatus}</p>
        <p className="text-xs text-slate-400 mt-2">
          This status is based on published reports near your saved regions. It is not a personal medical risk assessment.
        </p>
      </section>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <Link href="/app/advisor" className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
          <p className="text-sm font-medium text-slate-900">AI Advisor</p>
          <p className="text-xs text-slate-500 mt-1">Ask questions about outbreaks and preparedness</p>
        </Link>
        <Link href="/app/preparedness" className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
          <p className="text-sm font-medium text-slate-900">Preparedness checklist</p>
          <p className="text-xs text-slate-500 mt-1">Track your household readiness</p>
        </Link>
        <Link href="/app/alerts" className="border border-slate-200 rounded p-4 hover:bg-slate-50 transition-colors">
          <p className="text-sm font-medium text-slate-900">Alert preferences</p>
          <p className="text-xs text-slate-500 mt-1">Configure notifications for your regions</p>
        </Link>
      </div>

      {/* Latest Updates */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Latest updates</h2>
        {updates.length > 0 ? (
          <div className="space-y-3">
            {updates.map((update: any) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : (
          <EmptyState title="No updates available" description="Published updates will appear here." />
        )}
      </section>
    </div>
  )
}

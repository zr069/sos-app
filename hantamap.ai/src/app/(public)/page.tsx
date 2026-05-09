import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { HomeMapClient } from './home-map-client'

export const metadata: Metadata = {
  title: 'HantaMap.ai - Real-time Hantavirus Signal Map',
  description: 'Track Hantavirus signals in real time. Official sources, media monitoring and source-backed updates in one live map.',
}

export const revalidate = 60

export default async function HomePage() {
  let reports: any[] = []
  let updates: any[] = []
  let mediaItems: any[] = []

  try {
    const supabase = await createClient()
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const [reportsRes, updatesRes, mediaRes] = await Promise.all([
      supabase
        .from('reports')
        .select('*, outbreak:outbreaks(id, name, slug, pathogen_name), location:locations(country, region, city, latitude, longitude, precision)')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('updates')
        .select('*, outbreak:outbreaks(name, slug), location:locations(country, region, city)')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(5),
      supabase
        .from('source_candidates')
        .select('id, title, url, publisher, original_publisher, published_at, confidence_level')
        .eq('is_public', true)
        .eq('source_type', 'media')
        .gte('published_at', tenDaysAgo.toISOString())
        .order('published_at', { ascending: false })
        .limit(10),
    ])

    reports = reportsRes.data || []
    updates = updatesRes.data || []
    mediaItems = mediaRes.data || []
  } catch {
    // Supabase not configured
  }

  return (
    <HomeMapClient
      reports={reports}
      updates={updates}
      mediaItems={mediaItems}
      lastChecked={new Date().toISOString()}
    />
  )
}

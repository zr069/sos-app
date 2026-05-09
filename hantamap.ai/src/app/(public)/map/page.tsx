import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { MapPageClient } from './map-page-client'

export const metadata: Metadata = {
  title: 'Live Map',
  description: 'Interactive outbreak map with verified reports and media monitoring layer.',
}

export const revalidate = 300

export default async function MapPage() {
  let reports: any[] = []
  let mediaItems: any[] = []
  let lastChecked: string | null = null

  try {
    const supabase = await createClient()

    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const [reportsRes, mediaRes] = await Promise.all([
      supabase
        .from('reports')
        .select('*, outbreak:outbreaks(id, name, slug), location:locations(country, region, city, latitude, longitude, precision)')
        .eq('published', true),
      supabase
        .from('source_candidates')
        .select('id, title, url, publisher, original_publisher, published_at, detected_countries, extracted_summary, confidence_level')
        .eq('is_public', true)
        .eq('source_type', 'media')
        .gte('published_at', tenDaysAgo.toISOString()),
    ])

    reports = reportsRes.data || []
    mediaItems = (mediaRes.data || []).map((item: any) => ({
      ...item,
      // Media items may not have exact lat/lng in source_candidates.
      // Use detected_countries to approximate coordinates if needed.
      // For now, pass through as-is. The map component filters out items without coords.
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
    }))

    lastChecked = new Date().toISOString()
  } catch {
    // Supabase not configured
  }

  return (
    <MapPageClient
      reports={reports}
      mediaItems={mediaItems}
      lastChecked={lastChecked}
    />
  )
}

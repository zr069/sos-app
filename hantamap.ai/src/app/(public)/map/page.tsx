import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { MapPageClient } from './map-page-client'

export const metadata: Metadata = {
  title: 'Live Map',
  description: 'Real-time Hantavirus signal map with verified reports and media monitoring.',
}

export const revalidate = 60

export default async function MapPage() {
  let reports: any[] = []
  let mediaItems: any[] = []

  try {
    const supabase = await createClient()
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const [reportsRes, mediaRes] = await Promise.all([
      supabase
        .from('reports')
        .select('*, outbreak:outbreaks(id, name, slug, pathogen_name), location:locations(country, region, city, latitude, longitude, precision)')
        .eq('published', true),
      supabase
        .from('source_candidates')
        .select('id, title, url, publisher, original_publisher, published_at, detected_countries, extracted_summary, confidence_level')
        .eq('is_public', true)
        .eq('source_type', 'media')
        .gte('published_at', tenDaysAgo.toISOString())
        .order('published_at', { ascending: false })
        .limit(50),
    ])

    reports = reportsRes.data || []
    mediaItems = (mediaRes.data || []).map((item: any) => ({
      ...item,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
    }))
  } catch {
    // Supabase not configured
  }

  return (
    <MapPageClient
      reports={reports}
      mediaItems={mediaItems}
      lastChecked={new Date().toISOString()}
    />
  )
}

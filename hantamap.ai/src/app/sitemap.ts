import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.ai'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/updates`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/preparedness`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Add published outbreak pages
  let outbreakRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: outbreaks } = await supabase
      .from('outbreaks')
      .select('slug, updated_at')
      .eq('published', true)

    if (outbreaks) {
      outbreakRoutes = outbreaks.map(o => ({
        url: `${baseUrl}/outbreaks/${o.slug}`,
        lastModified: new Date(o.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Supabase not configured
  }

  return [...staticRoutes, ...outbreakRoutes]
}

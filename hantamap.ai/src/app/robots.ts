import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hantamap.ai'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/admin/', '/api/', '/auth/', '/demo', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

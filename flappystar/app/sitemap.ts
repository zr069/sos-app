import { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flappystar.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/play',
    '/leaderboard',
    '/impressum',
    '/datenschutz',
    '/agb',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add all routes for all locales
  for (const locale of locales) {
    for (const route of routes) {
      const url = locale === 'en'
        ? `${baseUrl}${route}`
        : `${baseUrl}/${locale}${route}`;

      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : route === '/leaderboard' ? 0.9 : 0.7,
      });
    }
  }

  return sitemap;
}

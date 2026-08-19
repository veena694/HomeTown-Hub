import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hometownhub.app';

  const routes = [
    '',
    '/communities',
    '/hometown-today',
    '/people',
    '/cultural-contributor/onboarding',
    '/community/panipat',
    '/community/jaipur',
    '/community/amritsar',
    '/community/delhi',
    '/community/panipat/culture',
    '/community/panipat/memory-map',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}

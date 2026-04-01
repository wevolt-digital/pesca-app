import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/', '/test/'],
    },
    sitemap: 'https://fishintel.com.br/sitemap.xml',
  };
}

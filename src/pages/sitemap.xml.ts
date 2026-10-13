import type { APIRoute } from 'astro';

import { siteConfig } from '../data/site';
import { defaultLocale } from '../i18n/config';
import { getSitemapPages } from '../i18n/sitemap-pages';
import { buildSitemap } from '../lib/sitemap';

export const GET: APIRoute = () =>
  new Response(buildSitemap(siteConfig.url, getSitemapPages(), defaultLocale), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });

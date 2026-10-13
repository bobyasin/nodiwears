import type { Locale } from '../i18n/config';

export type PagePaths = Record<Locale, string>;

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ESCAPES[character]);
}

function toUrl(siteUrl: string, path: string): string {
  return escapeXml(new URL(path, siteUrl).href);
}

export function buildSitemap(siteUrl: string, pages: readonly PagePaths[], defaultLocale: Locale): string {
  const urls = pages.flatMap((page) => {
    const alternates = (Object.entries(page) as [Locale, string][])
      .map(([locale, path]) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${toUrl(siteUrl, path)}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${toUrl(siteUrl, page[defaultLocale])}"/>`)
      .join('\n');

    return (Object.values(page) as string[]).map(
      (path) => `  <url>\n    <loc>${toUrl(siteUrl, path)}</loc>\n${alternates}\n  </url>`,
    );
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

import { describe, expect, it } from 'vitest';

import { buildSitemap } from './sitemap';

const pages = [
  { tr: '/', en: '/en/' },
  { tr: '/katalog/a/', en: '/en/catalog/a/' },
];

describe('buildSitemap', () => {
  const xml = buildSitemap('https://example.com', pages, 'tr');

  it('should list a url entry for every language of every page', () => {
    expect(xml.match(/<url>/g)).toHaveLength(4);
    expect(xml).toContain('<loc>https://example.com/en/catalog/a/</loc>');
  });

  it('should link every entry to all its language alternates and x-default', () => {
    const block = xml.split('<url>').find((entry) => entry.includes('<loc>https://example.com/katalog/a/</loc>')) ?? '';

    expect(block).toContain('hreflang="tr" href="https://example.com/katalog/a/"');
    expect(block).toContain('hreflang="en" href="https://example.com/en/catalog/a/"');
    expect(block).toContain('hreflang="x-default" href="https://example.com/katalog/a/"');
  });

  it('should use absolute urls only', () => {
    for (const [, href] of xml.matchAll(/href="([^"]+)"/g)) {
      expect(href).toMatch(/^https:\/\//);
    }
  });

  it('should escape characters that are special in XML', () => {
    const escaped = buildSitemap('https://example.com', [{ tr: '/a?x=1&y=2', en: '/en/a?x=1&y=2' }], 'tr');

    expect(escaped).toContain('/a?x=1&amp;y=2');
    expect(escaped).not.toContain('x=1&y=2');
  });

  it('should produce a valid XML document header and root element', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });
});

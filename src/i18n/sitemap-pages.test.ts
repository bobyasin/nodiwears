import { describe, expect, it } from 'vitest';

import { getPolicies } from '../data/policies';
import { catalogTree, collectDesigns } from '../data/site';
import { getSitemapPages } from './sitemap-pages';

describe('getSitemapPages', () => {
  const pages = getSitemapPages();

  it('should include the home page, every design and every policy', () => {
    const expected = 1 + collectDesigns(catalogTree, 'tr').length + getPolicies('tr').length;

    expect(pages).toHaveLength(expected);
  });

  it('should pair each Turkish page with its English counterpart', () => {
    expect(pages[0]).toEqual({ tr: '/', en: '/en/' });
    expect(pages).toContainEqual({
      tr: '/politikalar/cerez-politikasi/',
      en: '/en/policies/cookie-policy/',
    });
  });

  it('should not list the 404 page', () => {
    for (const page of pages) {
      expect(page.tr).not.toContain('404');
      expect(page.en).not.toContain('404');
    }
  });

  it('should list every path only once', () => {
    const paths = pages.flatMap((page) => [page.tr, page.en]);

    expect(new Set(paths).size).toBe(paths.length);
  });
});

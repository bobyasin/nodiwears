import { describe, expect, it } from 'vitest';

import { getPolicies } from '../data/policies';
import { catalogTree, collectDesigns } from '../data/site';
import { getSitemapPages } from './sitemap-pages';

describe('getSitemapPages', () => {
  const pages = getSitemapPages();

  it('should include the home page, the standalone pages, every design and every policy', () => {
    const expected = 7 + collectDesigns(catalogTree, 'tr').length + getPolicies('tr').length;

    expect(pages).toHaveLength(expected);
  });

  it('should pair each Turkish page with its English counterpart', () => {
    expect(pages[0]).toEqual({ tr: '/', en: '/en/' });
    expect(pages).toContainEqual({ tr: '/ozel-tasarim/', en: '/en/custom-design/' });
    expect(pages).toContainEqual({ tr: '/urunler/', en: '/en/products/' });
    expect(pages).toContainEqual({ tr: '/kurumsal/belgelerimiz/', en: '/en/corporate/certificates/' });
    expect(pages).toContainEqual({
      tr: '/politikalar/cerez-politikasi/',
      en: '/en/policies/cookie-policy/',
    });
  });

  it('should not list the account pages, which are not meant for search engines', () => {
    const paths = pages.flatMap((page) => [page.tr, page.en]);

    for (const hidden of ['/giris/', '/kayit/', '/profil/', '/en/login/', '/en/register/', '/en/profile/']) {
      expect(paths).not.toContain(hidden);
    }
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

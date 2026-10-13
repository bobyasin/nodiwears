import { describe, expect, it } from 'vitest';

import { getPolicies } from '../data/policies';
import { catalogTree, collectDesigns, siteConfig } from '../data/site';
import { formatMessage } from '../lib/format';
import { locales } from './config';
import { ui } from './ui';

// Search engines truncate titles around 60 characters and descriptions around 160.
const MAX_TITLE_LENGTH = 62;
const MIN_DESCRIPTION_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 165;

function expectGoodTitle(title: string) {
  expect(title.length).toBeGreaterThan(0);
  expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
}

function expectGoodDescription(description: string) {
  expect(description.length).toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
  expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
}

describe.each(locales)('SEO copy (%s)', (locale) => {
  const t = ui[locale];

  it('should keep the home title and description within search result limits', () => {
    expectGoodTitle(`${siteConfig.name} | ${t.meta.tagline}`);
    expectGoodDescription(t.meta.description);
  });

  it('should keep every design page title and description within limits and unique', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const design of collectDesigns(catalogTree, locale)) {
      const title = formatMessage(t.design.seoTitle, { title: design.title, name: siteConfig.name });
      const description = formatMessage(t.design.description, { title: design.title, collection: design.collection });

      expectGoodTitle(title);
      expectGoodDescription(description);
      titles.add(title);
      descriptions.add(description);
    }

    expect(titles.size).toBe(collectDesigns(catalogTree, locale).length);
    expect(descriptions.size).toBe(titles.size);
  });

  it('should keep every policy page title and summary within limits', () => {
    for (const policy of getPolicies(locale)) {
      expectGoodTitle(`${policy.title} | ${siteConfig.name}`);
      expect(policy.summary.length).toBeGreaterThan(20);
      expect(policy.summary.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    }
  });

  it('should mention the product in the home title for search relevance', () => {
    expect(`${siteConfig.name} ${t.meta.tagline}`.toLowerCase()).toMatch(/nakış|embroidery/);
  });
});

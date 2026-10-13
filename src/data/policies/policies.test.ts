import { describe, expect, it } from 'vitest';

import { locales } from '../../i18n/config';
import { getPolicies, getPoliciesUpdatedAt, getPolicyById } from './index';

describe.each(locales)('policies (%s)', (locale) => {
  const policies = getPolicies(locale);

  it('should publish the three legally expected documents', () => {
    expect(policies.map((policy) => policy.id)).toEqual(['kvkk', 'privacy', 'cookies']);
  });

  it('should give every policy a unique URL-safe slug', () => {
    const slugs = policies.map((policy) => policy.slug);

    expect(new Set(slugs).size).toBe(slugs.length);

    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('should give every policy a title, summary and sections with headings and content', () => {
    for (const policy of policies) {
      expect(policy.title.trim()).not.toBe('');
      expect(policy.summary.trim()).not.toBe('');
      expect(policy.sections.length).toBeGreaterThan(0);

      for (const section of policy.sections) {
        const hasContent = Boolean(section.paragraphs?.length || section.items?.length || section.table);

        expect(section.heading.trim()).not.toBe('');
        expect(hasContent).toBe(true);
      }
    }
  });

  it('should keep every table row as wide as its header', () => {
    for (const policy of policies) {
      for (const section of policy.sections) {
        for (const row of section.table?.rows ?? []) {
          expect(row).toHaveLength(section.table?.head.length ?? 0);
        }
      }
    }
  });

  it('should list every data subject right in the KVKK notice', () => {
    const rights = getPolicyById(locale, 'kvkk')?.sections.find((section) => section.heading.includes('11'));

    expect(rights?.items).toHaveLength(9);
  });

  it('should document the stored cookie key in the cookie policy', () => {
    const table = getPolicyById(locale, 'cookies')?.sections.find((section) => section.table)?.table;

    expect(table?.rows[0][0]).toBe('nodiwears-cookie-consent');
  });

  it('should have a last-updated date', () => {
    expect(getPoliciesUpdatedAt(locale).trim()).not.toBe('');
  });
});

describe('policy translations', () => {
  it('should keep the same structure in every language', () => {
    const [first, ...others] = locales.map((locale) => getPolicies(locale));

    for (const other of others) {
      expect(other.map((policy) => policy.sections.length)).toEqual(first.map((policy) => policy.sections.length));
      expect(other.map((policy) => policy.sections.map((section) => section.items?.length ?? 0))).toEqual(
        first.map((policy) => policy.sections.map((section) => section.items?.length ?? 0)),
      );
    }
  });

  it('should find the same policy by id in the other language', () => {
    expect(getPolicyById('tr', 'cookies')?.slug).toBe('cerez-politikasi');
    expect(getPolicyById('en', 'cookies')?.slug).toBe('cookie-policy');
  });
});

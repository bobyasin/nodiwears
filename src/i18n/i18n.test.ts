import { describe, expect, it } from 'vitest';

import { getOtherLocale, isLocale, locales } from './config';
import { getDesignPath, getHomePath, getPolicyPath, getSectionPath } from './paths';
import { getDesignStaticPaths, getPolicyStaticPaths } from './static-paths';
import { ui } from './ui';

function collectKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) => collectKeys(child, prefix ? `${prefix}.${key}` : key));
}

function collectPlaceholders(text: string): string[] {
  return (text.match(/\{\w+\}/g) ?? []).sort();
}

function collectEntries(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') {
    return [[prefix, value]];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectEntries(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('locales', () => {
  it('should recognize only supported languages', () => {
    expect(isLocale('tr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
  });

  it('should switch between the two languages', () => {
    expect(getOtherLocale('tr')).toBe('en');
    expect(getOtherLocale('en')).toBe('tr');
  });
});

describe('ui strings', () => {
  it('should define exactly the same keys in every language', () => {
    expect(collectKeys(ui.en).sort()).toEqual(collectKeys(ui.tr).sort());
  });

  it('should keep the same placeholders in every translation', () => {
    const english = new Map(collectEntries(ui.en));

    for (const [key, turkish] of collectEntries(ui.tr)) {
      expect(collectPlaceholders(english.get(key) ?? '')).toEqual(collectPlaceholders(turkish));
    }
  });

  it('should not leave any string empty', () => {
    for (const locale of locales) {
      for (const [, text] of collectEntries(ui[locale])) {
        expect(text.trim()).not.toBe('');
      }
    }
  });
});

describe('paths', () => {
  it('should serve Turkish at the root and English under /en', () => {
    expect(getHomePath('tr')).toBe('/');
    expect(getHomePath('en')).toBe('/en/');
  });

  it('should build section anchors on the localized home page', () => {
    expect(getSectionPath('tr', 'katalog')).toBe('/#katalog');
    expect(getSectionPath('en', 'iletisim')).toBe('/en/#iletisim');
  });

  it('should localize design and policy path segments', () => {
    expect(getDesignPath('tr', 'mitoloji-medusa')).toBe('/katalog/mitoloji-medusa/');
    expect(getDesignPath('en', 'mitoloji-medusa')).toBe('/en/catalog/mitoloji-medusa/');
    expect(getPolicyPath('tr', 'cerez-politikasi')).toBe('/politikalar/cerez-politikasi/');
    expect(getPolicyPath('en', 'cookie-policy')).toBe('/en/policies/cookie-policy/');
  });
});

describe('static paths', () => {
  it('should generate the same design pages for every language', () => {
    const [first, ...others] = locales.map((locale) => getDesignStaticPaths(locale).map((entry) => entry.params.id));

    for (const other of others) {
      expect(other).toEqual(first);
    }
  });

  it('should generate localized titles for design pages', () => {
    const medusa = getDesignStaticPaths('en').find((entry) => entry.params.id === 'mitoloji-medusa');

    expect(medusa?.props).toMatchObject({ title: 'Medusa', collection: 'Mythology' });
  });

  it('should generate one page per policy slug in each language', () => {
    expect(getPolicyStaticPaths('en').map((entry) => entry.params.slug)).toEqual([
      'kvkk-notice',
      'privacy-policy',
      'cookie-policy',
    ]);
  });
});

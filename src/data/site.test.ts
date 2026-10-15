import { describe, expect, it } from 'vitest';

import { locales } from '../i18n/config';
import { normalizeWhatsAppNumber } from '../lib/whatsapp';
import { catalogTree, collectDesigns, flattenCatalog, getContactLine, getRelatedDesigns, siteConfig } from './site';

describe('catalog tree', () => {
  const nodes = flattenCatalog(catalogTree);

  it('should give every node a unique id', () => {
    const ids = nodes.map((node) => node.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should give every node a title in every language', () => {
    for (const node of nodes) {
      for (const locale of locales) {
        expect(node.title[locale].trim()).not.toBe('');
      }
    }
  });

  it('should have at least one design under every top-level collection', () => {
    for (const collection of catalogTree) {
      expect(collection.children?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('should include nested nodes when flattening', () => {
    const tree = [
      {
        id: 'a',
        title: { tr: 'A', en: 'A' },
        children: [{ id: 'b', title: { tr: 'B', en: 'B' }, children: [{ id: 'c', title: { tr: 'C', en: 'C' } }] }],
      },
    ];

    expect(flattenCatalog(tree).map((node) => node.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('designs', () => {
  it('should list the same designs in every language, only titled differently', () => {
    const [first, ...others] = locales.map((locale) => collectDesigns(catalogTree, locale));

    for (const other of others) {
      expect(other.map((design) => design.node.id)).toEqual(first.map((design) => design.node.id));
    }
  });

  it('should list only leaf nodes with a localized collection path', () => {
    const designs = collectDesigns(catalogTree, 'en');

    expect(designs.length).toBeGreaterThan(0);

    for (const design of designs) {
      expect(design.node.children).toBeUndefined();
      expect(design.collection).not.toBe('');
    }
  });

  it('should localize design and collection titles', () => {
    const phoenix = collectDesigns(catalogTree, 'en').find((design) => design.node.id === 'mitoloji-anka-kusu');
    const anka = collectDesigns(catalogTree, 'tr').find((design) => design.node.id === 'mitoloji-anka-kusu');

    expect(phoenix).toMatchObject({ title: 'Phoenix', collection: 'Mythology' });
    expect(anka).toMatchObject({ title: 'Anka kuşu', collection: 'Mitoloji' });
  });

  it('should join nested collection names in the collection path', () => {
    const tree = [
      {
        id: 'a',
        title: { tr: 'A', en: 'A' },
        children: [{ id: 'b', title: { tr: 'B', en: 'B' }, children: [{ id: 'c', title: { tr: 'C', en: 'C' } }] }],
      },
    ];

    expect(collectDesigns(tree, 'tr')).toEqual([
      { node: { id: 'c', title: { tr: 'C', en: 'C' } }, title: 'C', collection: 'A / B', rootId: 'a' },
    ]);
  });

  it('should tag every design with the id of its top-level collection', () => {
    const rootIds = new Set(catalogTree.map((collection) => collection.id));

    for (const design of collectDesigns(catalogTree, 'tr')) {
      expect(rootIds.has(design.rootId)).toBe(true);
      expect(design.node.id.startsWith(design.rootId)).toBe(true);
    }
  });

  it('should give every design a URL-safe id', () => {
    for (const design of collectDesigns(catalogTree, 'tr')) {
      expect(design.node.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('related designs', () => {
  it('should list other designs of the same collection only', () => {
    const related = getRelatedDesigns('tr', 'mitoloji-medusa');

    expect(related.length).toBeGreaterThan(0);

    for (const design of related) {
      expect(design.rootId).toBe('mitoloji');
      expect(design.node.id).not.toBe('mitoloji-medusa');
    }
  });

  it('should respect the limit', () => {
    expect(getRelatedDesigns('en', 'bitkiler-lale', 2)).toHaveLength(2);
  });

  it('should localize the titles of related designs', () => {
    expect(getRelatedDesigns('en', 'mitoloji-medusa').map((design) => design.title)).toContain('Phoenix');
  });

  it('should return nothing for an unknown design', () => {
    expect(getRelatedDesigns('tr', 'yok')).toEqual([]);
  });
});

describe('site config', () => {
  it('should define a contact email', () => {
    expect(siteConfig.contactEmail).toMatch(/^[^\s@]+@[^\s@]+$/);
  });

  it('should keep the address either empty or filled in, in every language', () => {
    const filled = locales.map((locale) => siteConfig.address[locale].trim() !== '');

    expect(new Set(filled).size).toBe(1);
  });

  it('should not ship a placeholder phone number', () => {
    // Empty is fine (it is then not shown); a number made only of zeros is a placeholder.
    expect(siteConfig.contactPhone).not.toMatch(/^\+?[\s0()-]+$/);
  });
});

describe('whatsapp number', () => {
  it('should be empty or a usable number, so a typo cannot silently hide the buttons', () => {
    const number = siteConfig.whatsappNumber.trim();

    if (number !== '') {
      expect(normalizeWhatsAppNumber(number)).not.toBeNull();
    }
  });
});

describe('getContactLine', () => {
  it('should always start with the email and leave out empty details', () => {
    for (const locale of locales) {
      const line = getContactLine(locale);

      expect(line.startsWith(siteConfig.contactEmail)).toBe(true);
      expect(line).not.toMatch(/·\s*(·|$)/);
      expect(line).not.toContain('undefined');
    }
  });
});

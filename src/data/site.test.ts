import { describe, expect, it } from 'vitest';

import { locales } from '../i18n/config';
import { catalogTree, collectDesigns, flattenCatalog, siteConfig } from './site';

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

describe('site config', () => {
  it('should define a contact email', () => {
    expect(siteConfig.contactEmail).toMatch(/^[^\s@]+@[^\s@]+$/);
  });

  it('should define an address in every language', () => {
    for (const locale of locales) {
      expect(siteConfig.address[locale].trim()).not.toBe('');
    }
  });
});

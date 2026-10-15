import type { Locale, Localized } from '../i18n/config';
import { slugify } from '../lib/slug';

export interface CatalogNode {
  id: string;
  title: Localized<string>;
  children?: readonly CatalogNode[];
  /** Photos of a design; placeholders are generated while this is empty. */
  images?: readonly string[];
}

export interface CatalogDesign {
  node: CatalogNode;
  title: string;
  collection: string;
  rootId: string;
}

export const siteConfig = {
  name: 'nodiwears',
  url: 'https://www.nodiwears.com',
  contactEmail: 'merhaba@nodiwears.com',
  // Left empty until real contact details exist; empty values are simply not shown anywhere on the site.
  contactPhone: '' as string,
  // WhatsApp number, e.g. '+90 532 123 45 67'. While empty (or a placeholder) the WhatsApp buttons show as "coming soon" and do not open anything.
  whatsappNumber: '',
  // Endpoint that receives custom design orders (multipart POST, see docs/custom-design.md). While empty the order form works as a preview and does not send anything.
  customOrderEndpoint: '',
  address: { tr: '', en: '' } satisfies Localized<string>,
} as const;

/** Email, phone and address joined with dots, leaving out whatever is not filled in yet. */
export function getContactLine(locale: Locale): string {
  return [siteConfig.contactEmail, siteConfig.contactPhone, siteConfig.address[locale]]
    .map((part) => part.trim())
    .filter((part) => part !== '')
    .join(' · ');
}

// Design ids are derived from the Turkish title so URLs stay stable across languages.
const leaves = (prefix: string, designs: readonly Localized<string>[]): CatalogNode[] =>
  designs.map((title) => ({ id: `${prefix}-${slugify(title.tr)}`, title }));

export const catalogTree: readonly CatalogNode[] = [
  {
    id: 'mitoloji',
    title: { tr: 'Mitoloji', en: 'Mythology' },
    children: leaves('mitoloji', [
      { tr: 'Medusa', en: 'Medusa' },
      { tr: 'Pegasus', en: 'Pegasus' },
      { tr: 'Anka kuşu', en: 'Phoenix' },
      { tr: 'Minotor', en: 'Minotaur' },
      { tr: 'Zeus şimşeği', en: "Zeus's lightning bolt" },
      { tr: 'Yaşam ağacı', en: 'Tree of life' },
    ]),
  },
  {
    id: 'bitkiler',
    title: { tr: 'Bitkiler', en: 'Plants' },
    children: leaves('bitkiler', [
      { tr: 'Zeytin dalı', en: 'Olive branch' },
      { tr: 'Lavanta', en: 'Lavender' },
      { tr: 'Kasımpatı', en: 'Chrysanthemum' },
      { tr: 'Eğrelti otu', en: 'Fern' },
      { tr: 'Lale', en: 'Tulip' },
      { tr: 'Monstera', en: 'Monstera' },
    ]),
  },
  {
    id: 'hayvanlar',
    title: { tr: 'Hayvanlar', en: 'Animals' },
    children: leaves('hayvanlar', [
      { tr: 'Kurt', en: 'Wolf' },
      { tr: 'Baykuş', en: 'Owl' },
      { tr: 'Kedi', en: 'Cat' },
      { tr: 'Geyik', en: 'Deer' },
      { tr: 'Kartal', en: 'Eagle' },
      { tr: 'Tilki', en: 'Fox' },
    ]),
  },
];

export function flattenCatalog(nodes: readonly CatalogNode[]): CatalogNode[] {
  return nodes.flatMap((node) => [node, ...flattenCatalog(node.children ?? [])]);
}

export function getRelatedDesigns(locale: Locale, id: string, limit = 5): CatalogDesign[] {
  const designs = collectDesigns(catalogTree, locale);
  const current = designs.find((design) => design.node.id === id);

  if (!current) {
    return [];
  }

  return designs.filter((design) => design.rootId === current.rootId && design.node.id !== id).slice(0, limit);
}

export function collectDesigns(
  nodes: readonly CatalogNode[],
  locale: Locale,
  parents: readonly string[] = [],
  rootId?: string,
): CatalogDesign[] {
  return nodes.flatMap((node) => {
    const root = rootId ?? node.id;

    if (node.children) {
      return collectDesigns(node.children, locale, [...parents, node.title[locale]], root);
    }

    return [{ node, title: node.title[locale], collection: parents.join(' / '), rootId: root }];
  });
}

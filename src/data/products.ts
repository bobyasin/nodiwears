import type { Localized } from '../i18n/config';
import type { ProductId } from './custom-order';

export const categoryIds = ['men', 'women', 'unisex', 'accessories'] as const;

export type CategoryId = (typeof categoryIds)[number];

export interface ProductCategory {
  id: CategoryId;
  label: Localized<string>;
  /** Product types offered in this category, in menu order. */
  types: readonly ProductId[];
}

export const productCategories: readonly ProductCategory[] = [
  { id: 'men', label: { tr: 'Erkek', en: 'Men' }, types: ['tshirt', 'shirt', 'hoodie', 'shorts'] },
  { id: 'women', label: { tr: 'Kadın', en: 'Women' }, types: ['tshirt', 'shirt', 'hoodie', 'shorts'] },
  { id: 'unisex', label: { tr: 'Unisex', en: 'Unisex' }, types: ['tshirt', 'hoodie'] },
  { id: 'accessories', label: { tr: 'Aksesuar', en: 'Accessories' }, types: ['cap', 'scarf', 'socks'] },
];

export const seriesIds = ['cifut'] as const;

export type SeriesId = (typeof seriesIds)[number];

export interface ProductSeries {
  id: SeriesId;
  label: Localized<string>;
  /** Product types the series is made on, in display order. */
  types: readonly ProductId[];
}

export const productSeries: readonly ProductSeries[] = [
  { id: 'cifut', label: { tr: 'Çifut Serisi', en: 'Çifut Series' }, types: ['tshirt', 'shirt', 'hoodie', 'cap', 'socks'] },
];

export function getSeries(id: string): ProductSeries | undefined {
  return productSeries.find((series) => series.id === id);
}

export function getCategory(id: string): ProductCategory | undefined {
  return productCategories.find((category) => category.id === id);
}

export interface ProductFilter {
  category: CategoryId | null;
  type: ProductId | null;
  series: SeriesId | null;
}

/** Reads ?series=, else ?category= and ?type=; anything unknown (or a type the category does not offer) is ignored. */
export function parseProductFilter(params: URLSearchParams): ProductFilter {
  const series = getSeries(params.get('series') ?? '');

  if (series) {
    return { category: null, type: null, series: series.id };
  }

  const category = getCategory(params.get('category') ?? '');
  const requested = params.get('type');
  const type = category?.types.find((id) => id === requested) ?? null;

  return { category: category?.id ?? null, type, series: null };
}

export function buildProductsQuery(filter: Partial<ProductFilter>): string {
  const params = new URLSearchParams();

  if (filter.series) {
    params.set('series', filter.series);
  } else if (filter.category) {
    params.set('category', filter.category);

    if (filter.type) {
      params.set('type', filter.type);
    }
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

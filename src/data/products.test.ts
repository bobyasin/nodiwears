import { describe, expect, it } from 'vitest';

import { locales } from '../i18n/config';
import { productIds } from './custom-order';
import {
  buildProductsQuery,
  categoryIds,
  getCategory,
  getSeries,
  parseProductFilter,
  productCategories,
  productSeries,
} from './products';

describe('product categories', () => {
  it('should define every category once, in both languages', () => {
    expect(productCategories.map((category) => category.id)).toEqual([...categoryIds]);

    for (const category of productCategories) {
      for (const locale of locales) {
        expect(category.label[locale].trim()).not.toBe('');
      }
    }
  });

  it('should only offer product types that exist, without repeating one in a category', () => {
    for (const category of productCategories) {
      expect(category.types.length).toBeGreaterThan(0);
      expect(new Set(category.types).size).toBe(category.types.length);

      for (const type of category.types) {
        expect(productIds).toContain(type);
      }
    }
  });

  it('should offer every product type in at least one category', () => {
    const offered = new Set(productCategories.flatMap((category) => category.types));

    for (const id of productIds) {
      expect(offered.has(id)).toBe(true);
    }
  });

  it('should keep hats, neck warmers and socks under accessories', () => {
    expect(getCategory('accessories')?.types).toEqual(['cap', 'scarf', 'socks']);
    expect(getCategory('unknown')).toBeUndefined();
  });
});

describe('product filter', () => {
  it('should read a category and a type it offers', () => {
    expect(parseProductFilter(new URLSearchParams('category=men&type=hoodie'))).toEqual({ category: 'men', type: 'hoodie', series: null });
    expect(parseProductFilter(new URLSearchParams('category=accessories'))).toEqual({ category: 'accessories', type: null, series: null });
  });

  it('should ignore unknown values and types the category does not offer', () => {
    expect(parseProductFilter(new URLSearchParams(''))).toEqual({ category: null, type: null, series: null });
    expect(parseProductFilter(new URLSearchParams('category=kids&type=hoodie'))).toEqual({ category: null, type: null, series: null });
    expect(parseProductFilter(new URLSearchParams('category=unisex&type=socks'))).toEqual({ category: 'unisex', type: null, series: null });
    expect(parseProductFilter(new URLSearchParams('type=hoodie'))).toEqual({ category: null, type: null, series: null });
  });

  it('should build the query string back, dropping a type without a category', () => {
    expect(buildProductsQuery({})).toBe('');
    expect(buildProductsQuery({ category: 'women' })).toBe('?category=women');
    expect(buildProductsQuery({ category: 'women', type: 'shirt' })).toBe('?category=women&type=shirt');
    expect(buildProductsQuery({ category: null, type: 'shirt' })).toBe('');
  });
});

describe('product series', () => {
  it('should define each series in both languages with product types that exist', () => {
    expect(productSeries.length).toBeGreaterThan(0);

    for (const series of productSeries) {
      expect(series.types.length).toBeGreaterThan(0);

      for (const locale of locales) {
        expect(series.label[locale].trim()).not.toBe('');
      }

      for (const type of series.types) {
        expect(productIds).toContain(type);
      }
    }
  });

  it('should find the Çifut series and ignore unknown ones', () => {
    expect(getSeries('cifut')?.label.tr).toBe('Çifut Serisi');
    expect(getSeries('nope')).toBeUndefined();
  });

  it('should read a series, which wins over category and type, and build it back', () => {
    expect(parseProductFilter(new URLSearchParams('series=cifut&category=men&type=hoodie'))).toEqual({
      category: null,
      type: null,
      series: 'cifut',
    });
    expect(parseProductFilter(new URLSearchParams('series=nope'))).toEqual({ category: null, type: null, series: null });
    expect(buildProductsQuery({ series: 'cifut', category: 'men' })).toBe('?series=cifut');
  });
});

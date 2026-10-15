import { describe, expect, it } from 'vitest';

import { locales } from '../i18n/config';
import {
  DEFAULT_PLACEMENT,
  DEFAULT_PRINT_PRESET,
  ONE_SIZE,
  colors,
  getPlacement,
  getPrintPreset,
  getPrintSpec,
  getProduct,
  isColor,
  presetLabels,
  printSpecs,
  productIds,
  products,
} from './custom-order';

describe('custom order products', () => {
  it('should define every product id exactly once, in both languages', () => {
    expect(products.map((product) => product.id)).toEqual([...productIds]);

    for (const product of products) {
      for (const locale of locales) {
        expect(product.label[locale].trim()).not.toBe('');
      }
    }
  });

  it('should offer at least one size for every product', () => {
    for (const product of products) {
      expect(product.sizes.length).toBeGreaterThan(0);
    }
  });

  it('should keep hats and neck warmers one-size', () => {
    expect(getProduct('cap')?.sizes).toEqual([ONE_SIZE]);
    expect(getProduct('scarf')?.sizes).toEqual([ONE_SIZE]);
  });

  it('should not know a product that is not offered', () => {
    expect(getProduct('socks-xl')).toBeUndefined();
  });
});

describe('custom order colors', () => {
  it('should have unique ids, valid hex values and names in both languages', () => {
    expect(new Set(colors.map((color) => color.id)).size).toBe(colors.length);

    for (const color of colors) {
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);

      for (const locale of locales) {
        expect(color.name[locale].trim()).not.toBe('');
      }
    }
  });

  it('should recognize only listed colors', () => {
    expect(isColor('navy')).toBe(true);
    expect(isColor('neon')).toBe(false);
  });
});

describe('custom order print specs', () => {
  it('should define limits for every product, each at or below the t-shirt limit', () => {
    expect(Object.keys(printSpecs).sort()).toEqual([...productIds].sort());

    for (const spec of Object.values(printSpecs)) {
      expect(spec.maxWidthCm).toBeLessThanOrEqual(36);
      expect(spec.maxHeightCm).toBeLessThanOrEqual(20);
    }
  });

  it('should keep accessories and small items well below the garment limit', () => {
    expect(printSpecs.cap.maxWidthCm * printSpecs.cap.maxHeightCm).toBeLessThan(printSpecs.tshirt.maxWidthCm * printSpecs.tshirt.maxHeightCm / 5);
    expect(printSpecs.socks.maxWidthCm).toBeLessThan(printSpecs.cap.maxWidthCm);
  });

  it.each(productIds)('should give %s ready-made sizes from small to its maximum, with a medium default', (id) => {
    const { presets, maxWidthCm, maxHeightCm } = printSpecs[id];
    const areas = presets.map((preset) => preset.widthCm * preset.heightCm);

    expect(presets.length).toBeGreaterThanOrEqual(3);
    expect(areas).toEqual([...areas].sort((a, b) => a - b));
    expect(getPrintPreset(id, DEFAULT_PRINT_PRESET)).toBeDefined();
    expect(presets.at(-1)).toMatchObject({ id: 'max', widthCm: maxWidthCm, heightCm: maxHeightCm });

    for (const preset of presets) {
      expect(preset.widthCm).toBeLessThanOrEqual(maxWidthCm);
      expect(preset.heightCm).toBeLessThanOrEqual(maxHeightCm);
      expect(presetLabels[preset.id]).toBeDefined();
    }
  });

  it.each(productIds)('should place %s prints inside the picture with room for the largest print', (id) => {
    const { zone, maxWidthCm, maxHeightCm, percentPerCm } = printSpecs[id];

    expect(zone.x).toBeGreaterThanOrEqual(0);
    expect(zone.y).toBeGreaterThanOrEqual(0);
    expect(zone.x + zone.w).toBeLessThanOrEqual(100);
    expect(zone.y + zone.h).toBeLessThanOrEqual(100);
    expect(maxWidthCm * percentPerCm).toBeLessThanOrEqual(zone.w);
    expect(maxHeightCm * percentPerCm).toBeLessThanOrEqual(zone.h);
  });

  it.each(productIds)('should offer named spots for %s inside its zone, with unique ids and both languages', (id) => {
    const { positions, zone } = printSpecs[id];

    expect(new Set(positions.map((position) => position.id)).size).toBe(positions.length);
    expect(getPlacement(id, DEFAULT_PLACEMENT) ?? positions[0]).toBeDefined();

    for (const position of positions) {
      expect(position.x).toBeGreaterThanOrEqual(zone.x);
      expect(position.x).toBeLessThanOrEqual(zone.x + zone.w);
      expect(position.y).toBeGreaterThanOrEqual(zone.y);
      expect(position.y).toBeLessThanOrEqual(zone.y + zone.h);

      for (const locale of locales) {
        expect(position.label[locale].trim()).not.toBe('');
      }
    }
  });

  it('should label every ready-made size in both languages', () => {
    for (const { label, hint } of Object.values(presetLabels)) {
      for (const locale of locales) {
        expect(label[locale].trim()).not.toBe('');
        expect(hint[locale].trim()).not.toBe('');
      }
    }
  });

  it('should not know specs or presets of products that are not offered', () => {
    expect(getPrintSpec('hat')).toBeUndefined();
    expect(getPrintPreset('cap', 'large')).toBeUndefined();
    expect(getPlacement('cap', 'nowhere')).toBeUndefined();
  });
});

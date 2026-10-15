import { describe, expect, it } from 'vitest';

import { PRINT_CUSTOM, getPrintSpec, productIds, printSpecs } from '../data/custom-order';
import { locales } from '../i18n/config';
import { ui } from '../i18n/ui';

import {
  IMAGE_MAX_BYTES,
  IMAGE_MAX_SIDE,
  IMAGE_MIN_SIDE,
  MAX_NOTE_LENGTH,
  ORDER_ERRORS,
  PRINT_MIN_CM,
  buildOrderFormData,
  createDraft,
  findIncompleteStep,
  getColorHex,
  validateImage,
  validatePrintSize,
  validateStep,
  withPlacement,
  withPrintSize,
  withProduct,
  clampPlacement,
  type ImageInfo,
  type OrderDraft,
} from './custom-order';

const goodImage: ImageInfo = { name: 'logo.png', type: 'image/png', size: 200_000, width: 1200, height: 1000 };

function completeDraft(overrides: Partial<OrderDraft> = {}): OrderDraft {
  return {
    product: 'hoodie',
    color: 'navy',
    size: 'M',
    print: { preset: 'medium', widthCm: 15, heightCm: 12 },
    placement: { preset: 'center', x: 50, y: 56 },
    consent: true,
    image: goodImage,
    note: '',
    name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    ...overrides,
  };
}

describe('validateImage', () => {
  it('should accept a PNG that is large enough and within the limits', () => {
    expect(validateImage(goodImage)).toBeNull();
  });

  it.each(['image/gif', 'image/svg+xml', 'application/pdf', ''])('should reject the file type "%s"', (type) => {
    expect(validateImage({ ...goodImage, type })).toBe('image-type');
  });

  it('should reject a file over the size limit but accept one exactly at it', () => {
    expect(validateImage({ ...goodImage, size: IMAGE_MAX_BYTES + 1 })).toBe('image-too-large');
    expect(validateImage({ ...goodImage, size: IMAGE_MAX_BYTES })).toBeNull();
  });

  it('should reject an image whose shorter side is below the minimum', () => {
    expect(validateImage({ ...goodImage, width: IMAGE_MIN_SIDE - 1, height: 3000 })).toBe('image-too-small');
    expect(validateImage({ ...goodImage, width: IMAGE_MIN_SIDE, height: IMAGE_MIN_SIDE })).toBeNull();
  });

  it('should reject an image whose longer side is above the maximum', () => {
    expect(validateImage({ ...goodImage, width: IMAGE_MAX_SIDE + 1, height: 1000 })).toBe('image-too-big-dimensions');
    expect(validateImage({ ...goodImage, width: IMAGE_MAX_SIDE, height: 1000 })).toBeNull();
  });

  it('should reject an image whose dimensions could not be read', () => {
    expect(validateImage({ ...goodImage, width: 0, height: 0 })).toBe('image-unreadable');
  });
});

describe('validateStep', () => {
  it('should ask for a product before anything else', () => {
    expect(validateStep('product', createDraft())).toEqual(['product-required']);
    expect(validateStep('product', completeDraft())).toEqual([]);
  });

  it('should ask for both a color and a size', () => {
    expect(validateStep('options', completeDraft({ color: null, size: null }))).toEqual([
      'color-required',
      'size-required',
    ]);
  });

  it('should reject a color or size that does not exist for the product', () => {
    expect(validateStep('options', completeDraft({ color: 'transparent' }))).toEqual(['color-required']);
    expect(validateStep('options', { ...withProduct(completeDraft(), 'socks'), color: 'navy', size: 'M' })).toEqual(['size-required']);
    expect(validateStep('options', { ...withProduct(completeDraft(), 'cap'), color: 'navy', size: 'one-size' })).toEqual([]);
  });

  it('should require consent before looking at the image', () => {
    expect(validateStep('upload', completeDraft({ consent: false }))).toEqual(['consent-required']);
    expect(validateStep('upload', completeDraft({ consent: false, image: null }))).toEqual(['consent-required']);
  });

  it('should require an image and report why an image is unusable', () => {
    expect(validateStep('upload', completeDraft({ image: null }))).toEqual(['image-required']);
    expect(validateStep('upload', completeDraft({ image: { ...goodImage, type: 'image/gif' } }))).toEqual(['image-type']);
    expect(validateStep('upload', completeDraft())).toEqual([]);
  });

  it('should need a name and a valid email but not a note', () => {
    expect(validateStep('review', completeDraft({ name: '  ', email: 'nope' }))).toEqual([
      'name-required',
      'email-invalid',
    ]);
    expect(validateStep('review', completeDraft({ note: '' }))).toEqual([]);
  });

  it('should limit the length of the name and the note', () => {
    expect(validateStep('review', completeDraft({ name: 'a'.repeat(101) }))).toEqual(['name-too-long']);
    expect(validateStep('review', completeDraft({ note: 'a'.repeat(MAX_NOTE_LENGTH + 1) }))).toEqual(['note-too-long']);
    expect(validateStep('review', completeDraft({ note: 'a'.repeat(MAX_NOTE_LENGTH) }))).toEqual([]);
  });
});

const spec = (product: Parameters<typeof getPrintSpec>[0]) => {
  const found = getPrintSpec(product);

  if (!found) {
    throw new Error(`no print spec for ${product}`);
  }

  return found;
};

describe('print size', () => {
  const hoodie = spec('hoodie');
  const cap = spec('cap');

  it('should accept sizes up to a product\'s own limit and reject anything beyond it', () => {
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 36, heightCm: 20 }, hoodie)).toBeNull();
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 36.5, heightCm: 10 }, hoodie)).toBe('print-size-too-large');
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 10, heightCm: 20.5 }, hoodie)).toBe('print-size-too-large');
  });

  it('should not let a cap take a shirt-sized print', () => {
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 10, heightCm: 6 }, cap)).toBeNull();
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 25, heightCm: 18 }, cap)).toBe('print-size-too-large');
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 11, heightCm: 6 }, cap)).toBe('print-size-too-large');
  });

  it('should keep every product\'s limit at or below the t-shirt limit', () => {
    for (const id of productIds) {
      expect(printSpecs[id].maxWidthCm).toBeLessThanOrEqual(36);
      expect(printSpecs[id].maxHeightCm).toBeLessThanOrEqual(20);
    }
  });

  it('should reject sizes below the minimum', () => {
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: PRINT_MIN_CM, heightCm: PRINT_MIN_CM }, hoodie)).toBeNull();
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: PRINT_MIN_CM - 0.5, heightCm: 10 }, hoodie)).toBe('print-size-too-small');
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 0, heightCm: 0 }, hoodie)).toBe('print-size-too-small');
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: -5, heightCm: 10 }, hoodie)).toBe('print-size-too-small');
  });

  it('should ask for a size when a custom value is empty or not a number', () => {
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: null, heightCm: 10 }, hoodie)).toBe('print-size-required');
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: Number.NaN, heightCm: 10 }, hoodie)).toBe('print-size-required');
    expect(validatePrintSize({ preset: PRINT_CUSTOM, widthCm: 10, heightCm: Number.POSITIVE_INFINITY }, hoodie)).toBe('print-size-required');
  });

  it('should judge the size on the options step against the chosen product', () => {
    expect(validateStep('options', completeDraft({ print: { preset: PRINT_CUSTOM, widthCm: 40, heightCm: 10 } }))).toEqual([
      'print-size-too-large',
    ]);
    expect(validateStep('options', completeDraft({ product: 'cap', size: 'one-size' }))).toEqual(['print-size-too-large']);
  });
});

describe('product defaults', () => {
  it.each(productIds)('should start a %s on a valid medium print in a valid spot', (id) => {
    const draft = { ...withProduct(createDraft(), id), color: 'black', size: printSpecs[id].presets.length ? (id === 'cap' || id === 'scarf' ? 'one-size' : id === 'socks' ? '39-42' : 'M') : null };

    expect(draft.print.preset).toBe('medium');
    expect(validateStep('options', draft)).toEqual([]);
  });

  it('should reset the size when the product changes', () => {
    expect(withProduct(completeDraft({ size: 'M' }), 'socks').size).toBeNull();
  });
});

describe('placement', () => {
  const tshirt = spec('tshirt');

  it('should keep a print inside the zone of the product', () => {
    const { zone } = tshirt;
    const corner = clampPlacement(tshirt, 36, 20, { x: 0, y: 0 });
    const far = clampPlacement(tshirt, 36, 20, { x: 100, y: 100 });

    expect(corner.x - (36 * tshirt.percentPerCm) / 2).toBeGreaterThanOrEqual(zone.x - 0.001);
    expect(far.x + (36 * tshirt.percentPerCm) / 2).toBeLessThanOrEqual(zone.x + zone.w + 0.001);
    expect(corner.y - (20 * tshirt.percentPerCm) / 2).toBeGreaterThanOrEqual(zone.y - 0.001);
    expect(far.y + (20 * tshirt.percentPerCm) / 2).toBeLessThanOrEqual(zone.y + zone.h + 0.001);
  });

  it('should let a small print reach further towards the edge than a large one', () => {
    const small = clampPlacement(tshirt, 5, 5, { x: 0, y: 0 });
    const large = clampPlacement(tshirt, 36, 20, { x: 0, y: 0 });

    expect(small.x).toBeLessThan(large.x);
    expect(small.y).toBeLessThan(large.y);
  });

  it('should centre a print that is larger than the zone', () => {
    const point = clampPlacement(tshirt, 200, 200, { x: 3, y: 3 });

    expect(point).toEqual({ x: tshirt.zone.x + tshirt.zone.w / 2, y: tshirt.zone.y + tshirt.zone.h / 2 });
  });

  it('should move to a named spot and to a clicked point', () => {
    const base = withProduct(createDraft(), 'tshirt');
    const chest = withPlacement(base, 'left-chest');
    const clicked = withPlacement(base, PRINT_CUSTOM, { x: 45, y: 60 });

    expect(chest.placement?.preset).toBe('left-chest');
    expect(clicked.placement?.preset).toBe(PRINT_CUSTOM);
    expect(clicked.placement?.x).toBeCloseTo(45);
    expect(withPlacement(base, PRINT_CUSTOM).placement).toEqual(base.placement);
  });

  it('should pull the print back inside the zone when it grows', () => {
    const base = withPlacement(withProduct(createDraft(), 'tshirt'), PRINT_CUSTOM, { x: 69, y: 72 });
    const grown = withPrintSize(base, { preset: 'max', widthCm: 36, heightCm: 20 });

    expect(validateStep('options', { ...grown, color: 'black', size: 'M' })).toEqual([]);
    expect(grown.placement?.x).toBeLessThan(base.placement?.x ?? 0);
  });

  it('should report a placement that is outside the zone or missing', () => {
    expect(validateStep('options', completeDraft({ placement: { preset: PRINT_CUSTOM, x: 2, y: 2 } }))).toEqual(['placement-invalid']);
    expect(validateStep('options', completeDraft({ placement: null }))).toEqual(['placement-invalid']);
  });
});

describe('findIncompleteStep', () => {
  it('should return null for a complete order', () => {
    expect(findIncompleteStep(completeDraft())).toBeNull();
  });

  it('should point at the earliest step that needs attention', () => {
    expect(findIncompleteStep(createDraft())).toEqual({ step: 'product', errors: ['product-required'] });
    expect(findIncompleteStep(completeDraft({ consent: false, name: '' }))?.step).toBe('upload');
    expect(findIncompleteStep(completeDraft({ email: '' }))).toEqual({ step: 'review', errors: ['email-invalid'] });
  });
});

describe('buildOrderFormData', () => {
  it('should send trimmed fields and the image, with consent spelled out', () => {
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const body = buildOrderFormData(completeDraft({ name: '  Ayşe  ', note: ' hello ' }), file, 'tr');

    expect(body.get('product')).toBe('hoodie');
    expect(body.get('color')).toBe('navy');
    expect(body.get('size')).toBe('M');
    expect(body.get('printWidthCm')).toBe('15');
    expect(body.get('printHeightCm')).toBe('12');
    expect(body.get('printPreset')).toBe('medium');
    expect(body.get('placementPreset')).toBe('center');
    expect(body.get('placementX')).toBe('50');
    expect(body.get('placementY')).toBe('56');
    expect(body.get('name')).toBe('Ayşe');
    expect(body.get('note')).toBe('hello');
    expect(body.get('consent')).toBe('yes');
    expect(body.get('locale')).toBe('tr');
    expect((body.get('image') as File).name).toBe('logo.png');
  });
});

describe('getColorHex', () => {
  it('should look up a color and fall back to white', () => {
    expect(getColorHex('black')).toBe('#1b1b1f');
    expect(getColorHex(null)).toBe('#ffffff');
  });
});

describe('order form copy', () => {
  it.each(locales)('should explain every error in %s', (locale) => {
    expect(Object.keys(ui[locale].customDesign.errors).sort()).toEqual([...ORDER_ERRORS].sort());
  });

  it.each(locales)('should only use placeholders the form can fill in %s', (locale) => {
    const known = new Set(['{maxMb}', '{min}', '{max}', '{maxName}', '{maxNote}', '{maxW}', '{maxH}', '{minCm}', '{product}', '{name}', '{width}', '{height}', '{size}', '{link}']);
    const copy = JSON.stringify(ui[locale].customDesign);

    for (const placeholder of copy.match(/\{\w+\}/g) ?? []) {
      expect(known.has(placeholder)).toBe(true);
    }
  });
});

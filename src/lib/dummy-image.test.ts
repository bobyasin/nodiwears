import { describe, expect, it } from 'vitest';

import { DUMMY_VARIANT_COUNT, renderDummyDesignImage } from './dummy-image';
import { getDesignImages } from './design-images';

describe('renderDummyDesignImage', () => {
  it('should return a standalone SVG document', () => {
    const svg = renderDummyDesignImage({ seed: 'mitoloji-medusa', variant: 1, tint: 0 });

    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('viewBox="0 0 600 400"');
  });

  it('should draw the same picture every time for the same design', () => {
    const options = { seed: 'bitkiler-lale', variant: 2, tint: 1 } as const;

    expect(renderDummyDesignImage(options)).toBe(renderDummyDesignImage(options));
  });

  it('should draw a different picture for different designs', () => {
    const first = renderDummyDesignImage({ seed: 'hayvanlar-kurt', variant: 1, tint: 2 });
    const second = renderDummyDesignImage({ seed: 'hayvanlar-baykus', variant: 1, tint: 2 });

    expect(first).not.toBe(second);
  });

  it('should draw a different picture for every variant of a design', () => {
    const pictures = ([1, 2, 3] as const).map((variant) => renderDummyDesignImage({ seed: 'a', variant, tint: 0 }));

    expect(new Set(pictures).size).toBe(3);
  });

  it('should show the design on a T-shirt in the last variant', () => {
    expect(renderDummyDesignImage({ seed: 'a', variant: 3, tint: 0 })).toContain('L190 350');
    expect(renderDummyDesignImage({ seed: 'a', variant: 1, tint: 0 })).not.toContain('L190 350');
  });

  it('should tint the fabric by collection and wrap around for unknown collections', () => {
    const first = renderDummyDesignImage({ seed: 'a', variant: 1, tint: 0 });
    const next = renderDummyDesignImage({ seed: 'a', variant: 1, tint: 1 });
    const wrapped = renderDummyDesignImage({ seed: 'a', variant: 1, tint: 4 });

    expect(first).not.toBe(next);
    expect(wrapped).toBe(first);
  });
});

describe('getDesignImages', () => {
  it('should fall back to generated placeholders', () => {
    const images = getDesignImages('mitoloji-medusa');

    expect(images).toHaveLength(DUMMY_VARIANT_COUNT);
    expect(images[0]).toBe('/dummy/mitoloji-medusa/1.svg');
    expect(images.at(-1)).toBe(`/dummy/mitoloji-medusa/${DUMMY_VARIANT_COUNT}.svg`);
  });

  it('should prefer the design own images when the catalog lists them', () => {
    expect(getDesignImages('mitoloji-medusa', ['/img/a.webp', '/img/b.webp'])).toEqual(['/img/a.webp', '/img/b.webp']);
  });

  it('should ignore an empty image list', () => {
    expect(getDesignImages('mitoloji-medusa', [])).toHaveLength(DUMMY_VARIANT_COUNT);
  });
});

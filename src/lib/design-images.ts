import { DUMMY_VARIANT_COUNT } from './dummy-image';

/**
 * Pictures shown for a design. Designs with their own `images` in the catalog data use
 * those; the rest get generated placeholders until real photos are added.
 */
export function getDesignImages(id: string, own?: readonly string[]): string[] {
  if (own && own.length > 0) {
    return [...own];
  }

  return Array.from({ length: DUMMY_VARIANT_COUNT }, (_, index) => `/dummy/${id}/${index + 1}.svg`);
}

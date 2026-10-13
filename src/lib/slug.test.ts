import { describe, expect, it } from 'vitest';

import { slugify } from './slug';

describe('slugify', () => {
  it('should replace Turkish characters with their ASCII equivalents', () => {
    expect(slugify('Anka kuşu')).toBe('anka-kusu');
    expect(slugify('İğne Çiçeği')).toBe('igne-cicegi');
  });

  it('should collapse spaces and punctuation into single dashes', () => {
    expect(slugify('Zeus -- şimşeği!')).toBe('zeus-simsegi');
  });

  it('should trim leading and trailing separators', () => {
    expect(slugify('  Kurt  ')).toBe('kurt');
  });

  it('should return an empty string when nothing usable remains', () => {
    expect(slugify('***')).toBe('');
  });
});

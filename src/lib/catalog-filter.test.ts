import { describe, expect, it } from 'vitest';

import { ALL_FILTER, matchesFilter } from './catalog-filter';

describe('matchesFilter', () => {
  it('should show every design when the "all" filter is active', () => {
    expect(matchesFilter(ALL_FILTER, 'mitoloji')).toBe(true);
    expect(matchesFilter(ALL_FILTER, 'bitkiler')).toBe(true);
  });

  it('should show only designs of the selected collection', () => {
    expect(matchesFilter('bitkiler', 'bitkiler')).toBe(true);
    expect(matchesFilter('bitkiler', 'hayvanlar')).toBe(false);
  });

  it('should hide everything for an unknown filter', () => {
    expect(matchesFilter('bilinmeyen', 'mitoloji')).toBe(false);
  });
});

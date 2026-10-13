import { describe, expect, it } from 'vitest';

import { formatMessage } from './format';

describe('formatMessage', () => {
  it('should replace every placeholder with its value', () => {
    expect(formatMessage('{a} and {b}', { a: 'x', b: 2 })).toBe('x and 2');
  });

  it('should replace repeated placeholders', () => {
    expect(formatMessage('{a}-{a}', { a: 'x' })).toBe('x-x');
  });

  it('should keep placeholders that have no value', () => {
    expect(formatMessage('{a} {missing}', { a: 'x' })).toBe('x {missing}');
  });

  it('should not interpret special replacement patterns inside values', () => {
    expect(formatMessage('{a}', { a: '$& $1' })).toBe('$& $1');
  });
});

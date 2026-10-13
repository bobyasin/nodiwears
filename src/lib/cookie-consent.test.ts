import { describe, expect, it } from 'vitest';

import { CONSENT_STORAGE_KEY, acknowledgeNotice, hasAcknowledgedNotice, type ConsentStorage } from './cookie-consent';

function createMemoryStorage(): ConsentStorage {
  const values = new Map<string, string>();

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

const blockedStorage: ConsentStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('cookie notice acknowledgement', () => {
  it('should show the notice when nothing was stored yet', () => {
    expect(hasAcknowledgedNotice(createMemoryStorage())).toBe(false);
  });

  it('should remember that the notice was acknowledged', () => {
    const storage = createMemoryStorage();

    acknowledgeNotice(storage);

    expect(hasAcknowledgedNotice(storage)).toBe(true);
    expect(storage.getItem(CONSENT_STORAGE_KEY)).toBe('acknowledged');
  });

  it('should ignore unexpected stored values', () => {
    const storage = createMemoryStorage();

    storage.setItem(CONSENT_STORAGE_KEY, 'something-else');

    expect(hasAcknowledgedNotice(storage)).toBe(false);
  });

  it('should not throw and should show the notice when storage is blocked', () => {
    expect(() => acknowledgeNotice(blockedStorage)).not.toThrow();
    expect(hasAcknowledgedNotice(blockedStorage)).toBe(false);
  });
});

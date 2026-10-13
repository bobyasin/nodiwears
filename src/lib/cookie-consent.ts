export const CONSENT_STORAGE_KEY = 'nodiwears-cookie-consent';

const ACKNOWLEDGED = 'acknowledged';

export interface ConsentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function hasAcknowledgedNotice(storage: ConsentStorage): boolean {
  try {
    return storage.getItem(CONSENT_STORAGE_KEY) === ACKNOWLEDGED;
  } catch {
    // Storage can be blocked (private mode, strict settings); the notice is simply shown again.
    return false;
  }
}

export function acknowledgeNotice(storage: ConsentStorage): void {
  try {
    storage.setItem(CONSENT_STORAGE_KEY, ACKNOWLEDGED);
  } catch {
    // Same as above: without storage the choice cannot be remembered, which is not an error for the visitor.
  }
}

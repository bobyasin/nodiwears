import type { Locale, Localized } from '../../i18n/config';
import { policiesEn, UPDATED_AT_EN } from './en';
import { policiesTr, UPDATED_AT_TR } from './tr';
import type { Policy } from './types';

export type { Policy, PolicySection, PolicyTable } from './types';

const POLICIES: Localized<readonly Policy[]> = { tr: policiesTr, en: policiesEn };

const UPDATED_AT: Localized<string> = { tr: UPDATED_AT_TR, en: UPDATED_AT_EN };

export function getPolicies(locale: Locale): readonly Policy[] {
  return POLICIES[locale];
}

export function getPolicyById(locale: Locale, id: Policy['id']): Policy | undefined {
  return POLICIES[locale].find((policy) => policy.id === id);
}

export function getPoliciesUpdatedAt(locale: Locale): string {
  return UPDATED_AT[locale];
}

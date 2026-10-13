export const locales = ['tr', 'en'] as const;

export type Locale = (typeof locales)[number];

export type Localized<T> = Record<Locale, T>;

export const defaultLocale: Locale = 'tr';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getOtherLocale(locale: Locale): Locale {
  return locale === 'tr' ? 'en' : 'tr';
}
